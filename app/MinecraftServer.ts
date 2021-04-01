import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { v4 as uuid } from 'uuid'
import { app } from 'electron'
import path from 'path'
import { ServerData } from "./RendererAPI";

type LogStatus = 'INFO' | 'WARN' | 'ERROR' | 'UNKNOWN'
type LogEvents = 
    'close' 
    | 'pending' 
    | 'init' 
    | 'eula' 
    | 'file' 
    | 'run' 
    | 'started' 
    | 'dimension' 
    | 'progress' 
    | 'error' 
    | 'outdated';

export interface ServerLog {
    id: string;
    time: string;
    thread: string;
    status: LogStatus;
    message: string;
    event?: LogEvents;
    eventData?: string;
}

const isStatus = (test: string): test is LogStatus => {
    return ['INFO', 'WARN', 'ERROR'].includes(test);
}

export interface MinecraftServerConfig {
    server: ServerData;
    gigabytes?: number;
    onClose: () => void;
    onInit?: () => void;
    onEvent?: (event: LogEvents, data?: string) => void;
    onError?: (error: string) => void;
}

export class MinecraftServer {

    // Internal Data
    private child: ChildProcessWithoutNullStreams;
    private logs: ServerLog[] = [];
    private data: ServerData;

    // Events
    private onInit: (() => void) | null = null;
    private onEvent: ((event: LogEvents, data?: string) => void) | null = null;
    private onError: ((error: string) => void) | null = null;

    constructor({ gigabytes, server, onInit, onClose, onEvent, onError}: MinecraftServerConfig) {

        let ram1 = '-Xmx2G', ram2 = '-Xms2G'
        if(gigabytes) {
            if(gigabytes >= 2 && gigabytes <= 8) {
                ram1 = `-Xmx${Math.floor(gigabytes)}G`
                ram2 = `-Xms${Math.floor(gigabytes)}G`
            }
        }

        this.data = server;

        if(onInit) this.onInit = onInit;
        if(onEvent) this.onEvent = onEvent;
        if(onError) this.onError = onError;

        this.child = spawn('java', [ram1, ram2, '-jar', 'server.jar', 'nogui'], { cwd: path.join(app.getAppPath(), 'minecraft-servers', this.data.dir) })
        this.onEvent?.('pending');

        this.child.stdout.on('data', chunk => {
            this.processStdout(chunk.toString())
        })
        this.child.stderr.on('data', chunk => {
            this.processStderr(chunk.toString())

        })
        this.child.on('exit', onClose)

        process.on('beforeExit', () => this.child.kill('SIGINT'));

    }

    private processStdout(line: string) {
        // Is it a Minecraft Log?
        const mclogmatch = line.match(/\[(\d{2}:\d{2}:\d{2})\] \[(.+)\/([A-Z]+)\]: (.*)/)
        if(mclogmatch) {

            const line: ServerLog = {
                id: uuid(),
                time: mclogmatch[1],
                thread: mclogmatch[2],
                status: isStatus(mclogmatch[3]) ? mclogmatch[3] : 'UNKNOWN',
                message: mclogmatch[4]
            }

            // Check for Events
            if(line.message.includes('Go to eula.txt for more info.')) {
                line.event = 'eula';
            } else if(line.message.match(/Done \(([\d.]+)s\)! For help, type "help"/)) {
                const match = line.message.match(/Done \(([\d.]+)s\)! For help, type "help"/)
                line.event = 'started'
                if(match) line.eventData = match[1]
            } else if(line.message.includes('Stopping server')) {
                line.event = 'close'
            } else if(line.message.match(/Preparing start region for dimension (.*)/)) {
                const match = line.message.match(/Preparing start region for dimension (.*)/)
                line.event = 'dimension'
                if(match) line.eventData = match[1]
            } else if(line.message.match(/Preparing spawn area: (\d+)%/)) {
                const match = line.message.match(/Preparing spawn area: (\d+)%/)
                line.event = 'progress'
                if(match) line.eventData = match[1];
            }

            if(line.event) {
                this.onEvent?.(line.event, line.eventData);
            }

            this.logs = [...this.logs, line];

            return;
        }

        // Is It Loading Libraries?
        const loadingmatch = line.includes('Loading libraries, please wait...')
        if(loadingmatch) {
            this.onInit ? this.onInit() : this.onEvent?.('init');
            return;
        }
    }

    private processStderr(line: string) {
        if(line.includes('*** Error, this build is outdated ***')) {
            this.onEvent?.('outdated');
        } else {
            this.onError?.(line);
        }
    }

    public sendCommand(command: string) {
        this.child.stdin.write(command + '\n');
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
                this.onEvent?.('close')
                resolve();
            })
        })
    }

    public getData() {
        return this.data;
    }

}