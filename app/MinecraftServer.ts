import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { LogEvents, LogStatus, ServerData, ServerLog, ServerStatus, LoadingStatus, ServerInfo, LoadState, MinecraftUser, isMinecraftUser, World, WorldBackup, WorldBackupMap } from "./types";
import path from 'path'
import { app } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { Tree } from "dot-properties";
import { promises as fs } from 'fs'
import { parse as parseProps, stringify as stringifyProps } from 'dot-properties'
import { archiveDirectory } from './utils'
import { pingCurrent } from "./servers";
import cron from 'node-cron'

const isStatus = (test: string): test is LogStatus => {
    return ['INFO', 'WARN', 'ERROR'].includes(test);
}

interface MinecraftProcessConfig {
    server: ServerData;
    dir: string;
    onClose: () => void;
    onLoading: (evt: LoadState) => void;
    onError: (error: string) => void;
    onLog: (log: ServerLog) => void;
    setState: (state: ServerStatus) => void;
}

class MinecraftProcess {

    /* Properties */
    
    // Internal Data
    private child: ChildProcessWithoutNullStreams;
    private lastDim: string = '';

    // For Slient Command
    private silentLog: ((log: ServerLog) => void) | null = null; 
    private silentErr: ((err: string) => void) | null = null;

    // Event Callbacks
    private onLog: MinecraftProcessConfig['onLog'];
    private onLoading: MinecraftProcessConfig['onLoading'];
    private onError: MinecraftProcessConfig['onError'];
    private onClose: MinecraftProcessConfig['onClose'];
    private setState: MinecraftProcessConfig['setState'];

    /* Constructor */

    constructor({ dir, onClose, onError, onLoading, onLog, setState }: MinecraftProcessConfig) {

        this.onLoading = onLoading;
        this.onError = onError;
        this.onLog = onLog;
        this.onClose = onClose;

        this.child = spawn('java', ['-Xmx2G', '-Xms2G', '-jar', 'server.jar', 'nogui'], { cwd: path.join(app.getAppPath(), 'minecraft-servers', dir) })

        this.setState = setState;
        this.setState('loading')

        this.child.stdout.on('data', chunk => {
            this.processStdout(chunk.toString())
        })

        this.child.stderr.on('data', chunk => {
            this.processStderr(chunk.toString())

        })

        const emergencyKill = () => {
            this.child.kill('SIGINT')
        }

        process.on('beforeExit', emergencyKill)
        

        this.child.on('exit', () => {
            process.off('beforeExit', emergencyKill)           
        })

        this.child.on('error', err => {
            process.off('beforeExit', emergencyKill)
            this.onError(err.message)
            this.setState('error')
            this.closeServer();
        })

    }

    /* Private Methods */

    private processStdout(line: string) {
        // Is it a Minecraft Log?
        const mclogmatch = line.match(/\[(\d{2}:\d{2}:\d{2})\] \[(.+)\/([A-Z]+)\]: (.*)/)
        if(mclogmatch) {

            const line: ServerLog = {
                id: uuidv4(),
                time: mclogmatch[1],
                thread: mclogmatch[2],
                status: isStatus(mclogmatch[3]) ? mclogmatch[3] : 'UNKNOWN',
                message: mclogmatch[4]
            }

            // Check for Events
            if(line.message.includes('Go to eula.txt for more info.')) {
                line.event = 'error';
                line.eventData = 'eula'
            } else if(/Done \(([\d.]+)s\)! For help, type "help"/.test(line.message)) {
                const match = line.message.match(/Done \(([\d.]+)s\)! For help, type "help"/)
                if(match) {
                    line.event = 'done';
                    line.eventData = match[1]
                    // this.onLoading('done', match[1])
                    this.onLoading({ state: 'done', details: { time: match[1] } })
                    this.setState('online')
                }
            } else if(line.message.includes('Stopping server')) {
                // line.event = 'stop'
            } else if(/Preparing start region for dimension (.*)/.test(line.message)) {
                const match = line.message.match(/Preparing start region for dimension (.*)/)
                if(match) {
                    line.event = 'world'
                    line.eventData = match[1]
                    this.lastDim = match[1];
                    this.onLoading({ state: 'world', details: { dimension: match[1], progress: '0' } })
                    // this.onLoading('world', match[1])
                }
            } else if(/Preparing spawn area: (\d+)%/.test(line.message)) {
                const match = line.message.match(/Preparing spawn area: (\d+)%/)
                if(match) {
                    line.event = 'world'
                    line.eventData = match[1]
                    this.onLoading({ state: 'world', details: { dimension: this.lastDim, progress: match[1] } })
                }
            }

            if(this.silentLog) {
                this.silentLog(line);
                this.silentLog = null;
            } else {
                this.onLog(line);
            }

            return;
        }

        // Is It Loading Libraries?
        const loadingmatch = line.includes('Loading libraries, please wait...')
        if(loadingmatch) {
            this.onLoading({ state: 'libraries' })
            return;
        }
    }

    private processStderr(line: string) {
        if(this.silentErr) {
            this.silentErr(line)
            this.silentErr = null;
        }

        if(line.includes('*** Error, this build is outdated ***')) {
            this.onLoading({ state: 'outdated' });
        } else {
            this.onError(line);
            this.onLoading({ state: 'error' });
        }
    }

    /* Public Methods */

    public sendCommand(command: string) {
        this.child.stdin.write(command + '\n')
    }

    public closeServer() {
        return new Promise<void>((resolve, reject) => {
            this.sendCommand('stop');

            const tookTooLong = setTimeout(() => {
                this.child.kill('SIGINT')
            }, 10000)

            this.child.on('error', err => {
                reject(err)
                clearTimeout(tookTooLong)
            })

            this.child.on('exit', () => {
                clearTimeout(tookTooLong)
                this.onClose();
                resolve();
            })
        })
    }

    public silentCommand(command: string): Promise<ServerLog> {
        return new Promise((resolve, reject) => {
            this.silentLog = (log) => {
                resolve(log);
            }
            this.silentErr = (err) => {
                reject(err)
            }

            this.child.stdin.write(command + '\n');
        })
    }

}

interface ServerEventLog {
    id: string;
    timestamp: number;
    event: LogEvents;
}

interface MinecraftServerConfig {
    dir: string;
    data: ServerData;
    broadcast: (channel: string, ...args: any[]) => void;
    onClose: () => void;
    getCurrent: () => string;
}

export class MinecraftServer {

    private config: ServerData;
    private server: MinecraftProcess | null = null;
    private serverState: ServerStatus = 'offline';
    private properties: Tree | null = null;
    private usercache: MinecraftUser[] = [];
    private backups: WorldBackupMap = {};
    private dir: string;
    private id: string;
    private hasChanges: boolean = false;

    private logs: ServerLog[] = []
    private events: ServerEventLog[] = []

    private pingInterval: NodeJS.Timeout | null = null;
    private nextLineListeners: ((line: string) => void)[] = [];

    private broadcast: MinecraftServerConfig['broadcast']
    private onClose: MinecraftServerConfig['onClose']
    private getCurrent: MinecraftServerConfig['getCurrent']

    constructor(id: string, { dir, data, broadcast, onClose, getCurrent }: MinecraftServerConfig) {

        this.config = data;
        this.broadcast = broadcast;
        this.dir = dir;
        this.id = id;

        // Schedule Backups
        for(const world of this.config.worlds) {
            if(world.schedule) {
                cron.schedule(world.schedule, () => {
                    this.createBackup(world.name);
                })
            }
        }

        // Perform Async Actions
        Promise.all([
            this.fetchProperties(),
            this.fetchUsercache(),
            this.fetchBackups(),
        ]).then(([ properties, usercache, backups ]) => {
            // Assignment
            this.usercache = usercache;
            this.properties = properties;

            // Check Properties for world
            if(this.properties && this.properties.world && typeof this.properties.world === 'string') {
                this.setConfig('activeWorld', this.properties.world);
            }

            // Assign yer backups
            this.backups = backups;
            this.broadcast(`server:backups:${this.id}`, this.backups)

            // Finally broacast your new discoveries
            this.broadcastInfo();

        })

        this.onClose = onClose;
        this.getCurrent = getCurrent;

    }

    /* Private Methods */

    private broadcastInfo = () => {
        this.broadcast(`servers:get:${this.id}`, this.getServerInfo())
        if(this.isCurrent()) this.broadcast('servers:current', this.getServerInfo())
    }

    private async fetchProperties() {

        const propdir = path.join(app.getAppPath(), 'minecraft-servers', this.dir, 'server.properties')

        try {
            
            const stats = await fs.stat(propdir)

            if(!stats.isFile()) throw false;

            const propsraw = await fs.readFile(propdir)

            const properties = parseProps(propsraw.toString());

            // Find Key Datapoints
            // if(this.properties.world && typeof this.properties.world === 'string') {
            //     this.setConfig('activeWorld', this.properties.world);
            // }

            // return parseProps(propsraw.toString())
            return properties;
            
        } catch (error) {
            return null;
        }
        
    }

    private async fetchUsercache() {
        const userdatadir = path.join(app.getAppPath(), 'minecraft-servers', this.dir, 'usercache.json')

        try {
            
            const raw = await fs.readFile(userdatadir);

            const potentialusers = JSON.parse(raw.toString())

            if(typeof potentialusers !== 'object' || !Array.isArray(potentialusers)) throw new Error("Invalid Usercache array");

            let users: MinecraftUser[] = [];
            
            for(const potential of potentialusers) {
                if(isMinecraftUser(potential)) users = [...users, potential];
            }

            return users;

        } catch (error) {
            return [];
        }

    }

    private async fetchBackups() {
        try {
            
            const files = await fs.readdir(path.join(app.getAppPath(), 'minecraft-servers', this.dir, 'server-backups'), { withFileTypes: true })

            let backups: WorldBackupMap = {};
            this.config.worlds.forEach(world => backups[world.name] = []);
            for(const file of files) {
                if(file.isFile()) {
                    const filenamematch = file.name.match(/([a-z0-9-_]+)\.(\d+)\.zip/);
                    if(filenamematch) {
                        const [, world_name, timestamp] = filenamematch;
                        if(backups[world_name]) {
                            backups[world_name] = [...backups[world_name], {
                                id: uuidv4(),
                                world_name: world_name,
                                timestamp: +timestamp,
                                filename: file.name,
                            }]
                        }
                        
                    }
                }
            }

            return backups;

        } catch (error) {
            return {};
        }
    }

    private writeProperties() {
        const propdir = path.join(app.getAppPath(), 'minecraft-servers', this.dir, 'server.properties')

        if(this.serverState === 'online') this.hasChanges = true;
        
        fs.writeFile(propdir, stringifyProps(this.properties || {}))
            .then(() => this.broadcast(`servers:get:${this.id}`, this.getServerInfo()))
            .catch((error) => console.log("the big oof\\", error.message))

    }

    private setConfig = async <T extends keyof ServerData>(key: T, value: ServerData[T]) => {
        this.config[key] = value;
        fs.writeFile(path.join(app.getAppPath(), 'minecraft-servers', this.dir, 'manager.config.json'), JSON.stringify(this.config))
        .then(() => this.broadcast(`servers:get:${this.id}`, this.getServerInfo()))
        .catch(() => console.log("ooft"))
    }

    private handleClose = () => {
        this.server = null;
        this.onClose();
        this.stateChange('offline')
    }

    private handleLoading = (evt: LoadState) => {
        this.broadcast('current:loading', evt);
    }

    private handleError = (err: string) => {
        // Handle Errors
    }

    private handleLog = (log: ServerLog) => {
        this.logs = [...this.logs, log]
        this.broadcast('current:logs', this.logs);
    }

    private stateChange = (state: ServerStatus) => {
        if(this.serverState === 'online' && state !== 'online') this.hasChanges = false;
        this.serverState = state;
        if(this.properties === null) {
            this.fetchProperties().finally(() => this.broadcastInfo())
        } else {
            this.broadcastInfo();
        }
    }

    /* Public Methods */

    public start() {
        this.server = new MinecraftProcess({
            dir: this.dir,
            server: this.config,
            onClose: this.handleClose,
            onLoading: this.handleLoading,
            onError: this.handleError,
            onLog: this.handleLog,
            setState: this.stateChange,
        })
        this.broadcast('servers:current', this.getServerInfo())
        if(this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
            pingCurrent().then(ping => {
                this.broadcast('current:ping', ping)
            }).catch(err => {
                this.broadcast('current:ping')
            })
            this.getPlayers().then(players => {
                this.broadcast('current:players', players)
            }).catch(() => {
                this.broadcast('current:players', [])
            })
        },5000)
    }

    public stop() {
        if(this.pingInterval) {
            clearInterval(this.pingInterval)
            this.pingInterval = null;
        }
        if(this.server) {
            this.server.closeServer();
            this.broadcast('servers:current', null)
            this.broadcast('current:ping')
        }
    }

    public async restart() {
        try {
            
            if(this.server) {
                await this.server.closeServer();
            }

            this.start();

            return true;

        } catch (error) {
            return false;
        }
    }

    public cmd(line: string) {
        this.server?.sendCommand(line)
    }
    
    public async sneakyCmd(line: string) {
        if(this.server) {
            try {
                return await this.server.silentCommand(line);
            } catch (error) {
                return null;
            }
        } else {
            return null;
        }
    }

    public getProperties() {
        return this.properties;
    }

    public setProperty(key: string, value: string | number | boolean) {
        if(this.properties === null) {
            this.properties = {}
        }
        this.properties[key] = value.toString();
        this.writeProperties();
    }

    public getServerInfo(): ServerInfo {
        return {
            name: this.config.title,
            dir: this.dir,
            id: this.id,
            current: this.getCurrent() === this.id,
            state: this.serverState,
            worlds: this.config.worlds,
            activeWorld: this.config.activeWorld,
            properties: this.properties || {},
            changes: this.hasChanges
        }
    }

    public getWorlds() {
        return this.config.worlds;
    }

    public getLogs() {
        return this.logs;
    }

    public getStatus(): ServerStatus {
        return this.server ? this.serverState : 'offline';
    }

    public getId() {
        return this.id;
    }

    public isCurrent() {
        return this.getCurrent() === this.id;
    }

    public addWorld(worldname: string) {

        let codename = worldname.toLowerCase().replace(/[^a-z0-9-_ ]/g, '').replace(/ /g, '-');

        let exists = false;
        for(const world of this.config.worlds) {
            if(world.name === codename) {
                exists = true;
            }
        }

        if(exists) codename = codename + '_' + Math.random().toString(36).substr(2,7);

        const world: World = {
            name: codename,
            title: worldname
        }

        this.setConfig('worlds', [...this.config.worlds, world]);
    }

    public getBackups() {
        return this.backups;
    }

    public async createBackup(worldname: string) {

        if(!this.config.worlds.find(world => world.name === worldname)) return null;

        try {

            // Ensure Backups folder exists
            try {
                await fs.stat(path.join(app.getAppPath(), 'minecraft-servers', this.dir, 'server-backups'))
            } catch (error) {
                await fs.mkdir(path.join(app.getAppPath(), 'minecraft-servers', this.dir, 'server-backups'))
            }

            const timestamp = Date.now();
            const zipname = `${worldname}.${timestamp}.zip`
            
            const time = await archiveDirectory(
                path.join(app.getAppPath(), 'minecraft-servers', this.dir, worldname),
                path.join(app.getAppPath(), 'minecraft-servers', this.dir, 'server-backups', zipname)
            )

            this.backups[worldname] = [...this.backups[worldname], {
                id: uuidv4(),
                world_name: worldname,
                timestamp: timestamp,
                filename: zipname,
            }]

            this.broadcast(`servers:backups:${this.id}`, this.backups)

            return time;

        } catch (error) {
            return null;
        }
    }

    public async getPlayers() {
        if(this.server && this.isCurrent()) {
            try {
                
                const log = await this.server.silentCommand('list uuids');

                if(!log) throw 'no-logs';

                const rawplayers = log.message.match(/([A-Za-z0-9-_]+) \(([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\)/g)

                if(!rawplayers) throw 'no-raw';

                let players: MinecraftUser[] = []
                for(const player of rawplayers) {
                    const match = player.match(/([A-Za-z0-9-_]+) \(([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\)/)
                    if(match) {
                        players = [...players, { name: match[1], uuid: match[2] }]
                    }
                }

                return players;

            } catch (error) {
                return [];
            }
        } else {
            return [];
        }
    }

}

export const createMinecraftServer = async (id: string, config: MinecraftServerConfig) => {
    try {
        
        await fs.access(path.join(app.getAppPath(), 'minecraft-servers', config.dir, 'server.jar'))
        await fs.access(path.join(app.getAppPath(), 'minecraft-servers', config.dir, 'eula.txt'))

        return new MinecraftServer(id, config);

    } catch (error) {
        console.error(error);
        return false;
    }
}