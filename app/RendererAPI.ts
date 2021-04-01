import { IpcRendererEvent } from "electron";
import { Log } from "./logs";

export type ServerStatus = 'offline' | 'online' | 'no-servers'
type ServerOutcome = 'success' | 'error' | 'eula';

export type EventCallback<T> = (evt: IpcRendererEvent, extra: T) => void;
type BindUnbind<T = string | undefined> = (callback: EventCallback<T>) => void;

type Gamemode = 'survival' | 'creative' | 'adventure'

export interface ServerData {
    id: string;
    name: string;
    dir: string;
    gamemode: Gamemode;
}

interface Binders {
    pending: BindUnbind;
    started: BindUnbind;
    eula: BindUnbind;
    error: BindUnbind;
    logged: BindUnbind<Log>;
    close: BindUnbind;
    progress: BindUnbind;
    dimension: BindUnbind;
}

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
        openDirectory: () => Promise<void>;
        getLogs: () => Promise<Log[]>;
        
    };
    bind: Binders;
    unbind: Binders;
}

export interface CheckResponse {
    file: boolean;
    eula: boolean;
    server: boolean;
}