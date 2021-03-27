type ServerStatus = 'offline' | 'online';
type ServerOutcome = 'success' | 'error' | 'eula';

export default interface RendererAPI {
    window: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
    };
    actions: {
        getStatus: () => Promise<ServerStatus>;
        startServer: () => Promise<ServerOutcome>;
        stopServer: () => Promise<void>;
        restartServer: () => Promise<ServerOutcome>;
        eulaAgree: (status?: boolean) => Promise<ServerOutcome>;
        openDirectory: () => Promise<void>;
    };
    bind: {
        pending: (callback: () => void) => void;
        started: (callback: () => void) => void;
        eula: (callback: () => void) => void;
        error: (callback: () => void) => void;
        logged: (callback: () => void) => void;
        close: (callback: () => void) => void;

    };
    unbind: {
        pending: (callback: () => void) => void;
        started: (callback: () => void) => void;
        eula: (callback: () => void) => void;
        error: (callback: () => void) => void;
        logged: (callback: () => void) => void;
        close: (callback: () => void) => void;
    };
}

export interface CheckResponse {
    file: boolean;
    eula: boolean;
    server: boolean;
}