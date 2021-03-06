import { Tree } from "dot-properties";
import { IpcRendererEvent } from "electron";

// export type ServerStatus = 'offline' | 'online' | 'no-servers'
// type ServerOutcome = 'success' | 'error' | 'eula';

export type EventCallback<T> = (evt: IpcRendererEvent, extra: T) => void;
type BindUnbind<T = string | undefined> = (callback: EventCallback<T>) => void;

type Gamemode = 'survival' | 'creative' | 'adventure'

export interface World {
    name: string;
    title: string;
    schedule?: string;
}

export interface ScheduledWorld extends World {
    schedule: string;
}

export const isScheduledWorld = (world: World): world is ScheduledWorld => {
    return typeof world.schedule === 'string' && world.schedule !== ''
}

/* Data Extracted from manager.config.json */
export interface ServerData {
    id: string;
    name: string;
    title: string;
    activeWorld: string;
    worlds: World[];
}

/* Server Representation for Renderer */
export interface ServerInfo extends ServerData {
    current: boolean;
    state: ServerStatus;
    properties: Tree;
    changes: boolean;
}

export type ServerInfoEditable = Pick<ServerInfo, 'title'>;

/* Info Required to Create a Server */
export interface ServerCreateInfo {
    name: string;
    jar: string;
}

/* User information from usercache.json */
export interface MinecraftUser {
    uuid: string;
    name: string;
    expiresOn?: string;
}

/* A record of a backup - {world_name}.{timestamp}.zip */
export interface WorldBackup {
    id: string;
    world_name: string;
    timestamp: number;
    filename: string;
}

export interface WorldBackupMap {
    [worldname: string]: WorldBackup[];
}

export const isMinecraftUser = (test: any): test is MinecraftUser => {
    return (typeof test === 'object' && typeof test.uuid === 'string' && typeof test.name === 'string' && typeof test.expiresOn === 'string')
}

export type Broadcaster = (channel: string, ...args: any[]) => void;

export const validServerData = (test: any): test is ServerData => {
    if(typeof test !== 'object' || typeof test.name !== 'string' || typeof test.title !== 'string' || typeof test.activeWorld !== 'string' || typeof test.worlds !== 'object' || !Array.isArray(test.worlds)) return false;
    if(test.worlds.length) {
        for(const world of test.worlds) {
            if(!isWorld(world)) return false;
        }
    }
    return true;
}

const isWorld = (test: any): test is World => {
    return (typeof test === 'object' && typeof test.name === 'string' && typeof test.title === 'string' && (test.schedule === undefined || typeof test.schedule === 'string'))
}

export const isServerData = (test: any): test is ServerData => {
    return (typeof test === 'object' && test.name !== undefined && typeof test.name === 'string')
}

interface Binders {
    pending: BindUnbind;
    started: BindUnbind;
    eula: BindUnbind;
    error: BindUnbind;
    logged: BindUnbind<ServerLog>;
    close: BindUnbind;
    progress: BindUnbind;
    dimension: BindUnbind;
}

export interface Hook<T> {
    get: () => Promise<T>;
    listen: (listener: (updated: T) => void) => () => void;
}

export interface InteractiveHook<T> {
    get: () => Promise<T>;
    set: (val: T) => Promise<T>;
    listen: (listener: (updated: T) => void) => () => void;
}

export type Action = () => void;
export type Task<T> = (arg: T) => void;
export type Creator<T> = (data: T) => Promise<boolean>;
export type Mutator<T, U> = (arg: T, data: U) => Promise<void>;

export type MutateMap<T, U extends keyof T> = (arg: string, key: T, value: T[U]) => Promise<void>;

type ConditionalHook<S, T> = (id: S) => Hook<T>

export interface LoadState {
    state: LoadingStatus;
    details?: DimensionLoad;
}

export interface DimensionLoad {
    dimension?: string;
    progress?: string;
    time?: string;
}

export interface API {
    window: {
        minimize: Action;
        maximize: Action;
        close: Action;
        focus: Hook<boolean>;
    },
    application: {
        state: Hook<string>;
        publicIp: Hook<string>;
        openExternal: Task<string>;
    },
    servers: {
        list: Hook<ServerInfo[]>;
        get: ConditionalHook<string, ServerInfo | null>;
        current: Hook<ServerInfo | null>;
        directory: Task<string>;
        create: Creator<ServerCreateInfo>;
        edit: <T extends keyof ServerInfoEditable>(serverid: string, key: T, value: ServerInfo[T]) => Promise<void>;
        setProperty: Mutator<{ id: string, property: string }, string>;
        addWorld: Mutator<string, string>;
        renameWorld: (serverid: string, worldname: string, title: string) => Promise<void>;
        backups: ConditionalHook<string, WorldBackupMap | null>;
        scheduleBackup: (serverid: string, worldname: string, cron?: string) => Promise<void>;
        createBackup: Mutator<string, string>;
        restoreBackup: (serverid: string, backupid: string, autobackup?: boolean) => Promise<void>;
    },
    current: {
        start: Task<string>;
        stop: (force?: boolean) => void;
        restart: Action;
        status: Hook<ServerStatus | undefined>;
        loading: Hook<LoadState | undefined>;
        logs: Hook<ServerLog[]>;
        logWindow: Action;
        command: Task<string>;
        ping: Hook<ServerPing | undefined>;
        // players: Hook<MinecraftUser[] | null>;
        players: Hook<MinecraftUser[]>;
    },
    settings: {
        startup: InteractiveHook<boolean>;
        defaultServer: InteractiveHook<string | null>;
        minimised: InteractiveHook<boolean>;
        theme: InteractiveHook<Theme>;
    }
}

export interface ServerPing {
    version: string;
    description: string;
    players: number;
    max: number;
    ping: number;
}

export type Theme = 'light' | 'dark'

export interface Preferences {
    startup: boolean;
    defaultServer: string | null;
    minimised: boolean;
    theme: Theme;
}

/*
export default interface RendererAPI {
    window: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
        isFocused: () => Promise<boolean>;
        onFocus: BindUnbind;
        offFocus: BindUnbind;
        onBlur: BindUnbind;
        offBlur: BindUnbind;
    };
    actions: {
        getStatus: () => Promise<ServerStatus>;
        getList: () => Promise<ServerData[]>;
        getServer: (serverid: string) => Promise<ServerData | undefined>;
        getCurrent: () => Promise<ServerData | undefined>;
        startServer: (serverid: string) => Promise<ServerOutcome>;
        stopServer: () => Promise<void>;
        restartServer: () => Promise<ServerOutcome>;
        createServer: (path: string, name?: string) => Promise<void>;
        openDirectory: (dir?: string) => Promise<void>;
        getLogs: () => Promise<ServerLog[]>;
        openLogWindow: (srvid: string) => void;
        getPublicIp: () => Promise<string>;
        sendCommand: (command: string) => void;
        getProperties: (serverid: string) => Promise<Response<Tree>>
    };
    bind: Binders;
    unbind: Binders;
}

export interface CheckResponse {
    file: boolean;
    eula: boolean;
    server: boolean;
}
*/

export type LogStatus = 'INFO' | 'WARN' | 'ERROR' | 'UNKNOWN'

export type ServerStatus = 'online' | 'offline' | 'loading' | 'error'
export type LoadingStatus = 'pending' | 'loading' | 'libraries' | 'world' | 'done' | 'error' | 'outdated'
export type MinecraftEvent = 'chat' | 'command'

export type LogEvents = LoadingStatus | MinecraftEvent

export interface ServerLog {
    id: string;
    time: string;
    thread: string;
    status: LogStatus;
    message: string;
    event?: LogEvents;
    eventData?: string;
}

interface BaseResponse {
    status: 'success' | 'error' | 'done'
}

interface SuccessResponse<T> extends BaseResponse {
    status: 'success';
    data: T
}

interface ErrorResponse extends BaseResponse {
    status: 'error';
    error: string;
}

interface DoneResponse extends BaseResponse {
    status: 'done';
}

export type Response<T> = SuccessResponse<T> | ErrorResponse
export type Done = DoneResponse | ErrorResponse