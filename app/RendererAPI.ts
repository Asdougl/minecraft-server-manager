import { IpcRendererEvent } from "electron";
import { Log } from "./logs";

export type ServerStatus = 'offline' | 'online' | 'no-folder' | 'no-server' | 'no-first-run' | 'eula-agree';
type ServerOutcome = 'success' | 'error' | 'eula';

export type EventCallback<T> = (evt: IpcRendererEvent, extra: T) => void;
type BindUnbind<T = string | undefined> = (callback: EventCallback<T>) => void;

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
        startServer: () => Promise<ServerOutcome>;
        stopServer: () => Promise<void>;
        restartServer: () => Promise<ServerOutcome>;
        eulaAgree: (status?: boolean) => Promise<ServerOutcome>;
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