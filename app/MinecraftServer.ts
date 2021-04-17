import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { LogEvents, LogStatus, ServerData, ServerLog, ServerStatus, LoadingStatus, ServerInfo, LoadState } from "./types";
import path from 'path'
import { app } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { Tree } from "dot-properties";
import { promises as fs } from 'fs'
import { parse as parseProps, stringify as stringifyProps } from 'dot-properties'

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

            this.onLog(line);

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
    private properties: Tree = {};
    private dir: string;
    private id: string;

    private logs: ServerLog[] = []
    private events: ServerEventLog[] = []

    private broadcast: MinecraftServerConfig['broadcast']
    private onClose: MinecraftServerConfig['onClose']
    private getCurrent: MinecraftServerConfig['getCurrent']

    constructor(id: string, { dir, data, broadcast, onClose, getCurrent }: MinecraftServerConfig) {

        this.config = data;
        this.broadcast = broadcast;
        console.log(this.broadcast.toString());
        this.dir = dir;
        this.id = id;

        this.fetchProperties()

        this.onClose = onClose;
        this.getCurrent = getCurrent;

    }

    /* Private Methods */

    private async fetchProperties() {

        const propdir = path.join(app.getAppPath(), 'minecraft-servers', this.dir, 'server.properties')

        try {
            
            const stats = await fs.stat(propdir)

            if(!stats.isFile()) throw false;

            const propsraw = await fs.readFile(propdir)

            this.properties = parseProps(propsraw.toString());

            // Find Key Datapoints
            if(this.properties.world && typeof this.properties.world === 'string') {
                this.setConfig('activeWorld', this.properties.world);
            }

            // return parseProps(propsraw.toString())
            
        } catch (error) {
            return null;
        }
        
    }

    private writeProperties() {
        const propdir = path.join(app.getAppPath(), 'minecraft-servers', this.dir, 'server.properties')
        
        fs.writeFile(propdir, stringifyProps(this.properties))
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
    }

    private stateChange = (state: ServerStatus) => {
        this.serverState = state;
        this.broadcast(`servers:get:${this.id}`, this.getServerInfo())
        if(this.isCurrent()) this.broadcast('servers:current', this.getServerInfo())
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
    }

    public stop() {
        if(this.server) {
            this.server.closeServer();
            this.broadcast('servers:current', null)
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

    public getProperties() {
        return this.properties;
    }

    public setProperty(key: string, value: string | number | boolean) {
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
            properties: this.properties,
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