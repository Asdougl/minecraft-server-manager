import { contextBridge, ipcRenderer } from "electron";
import { IpcRendererEvent } from "electron/main";
import { API } from './types'

/*

const binder = <T = string | undefined>(channel: string) => (cb: EventCallback<T>) => {
    ipcRenderer.addListener(channel, cb)
}

const unbinder = <T = string | undefined>(channel: string) => (cb: EventCallback<T>) => {
    ipcRenderer.removeListener(channel, cb)
}

const api: RendererAPI = {
    window: {
        minimize: () => ipcRenderer.send('window:minimize'),
        maximize: () => ipcRenderer.send('window:maximize'),
        close: () => ipcRenderer.send('window:close'),
        isFocused: () => {
            return ipcRenderer.invoke('window:status')
        },
        onFocus: binder('window:focus'),
        offFocus: unbinder('window:focus'),
        onBlur: binder('window:blur'),
        offBlur: binder('window:blur')
    },
    actions: {
        getStatus: () => {
            return ipcRenderer.invoke('server:status')
        },
        getList: () => {
            return ipcRenderer.invoke('server:list')
        },
        getServer: (serverid) => {
            return ipcRenderer.invoke('server:get', serverid)
        },
        getCurrent: () => {
            return ipcRenderer.invoke('server:current')
        },
        startServer: (serverid) => {
            return ipcRenderer.invoke('server:start', serverid)
        },
        stopServer: () => {
            return ipcRenderer.invoke('server:stop')
        },
        restartServer: () => {
            return ipcRenderer.invoke('server:restart')
        },
        openDirectory: (dir?: string) => {
            return ipcRenderer.invoke('files:open', dir)
        },
        getLogs: () => {
            return ipcRenderer.invoke('server:logs')
        },
        createServer: (file, name) => {
            return ipcRenderer.invoke('server:create', file, name)
        },
        openLogWindow: (srvid) => {
            return ipcRenderer.invoke('server:open-console', srvid)
        },
        getPublicIp: () => {
            return ipcRenderer.invoke('process:public-ip')
        },
        sendCommand: (command) => {
            return ipcRenderer.invoke('server:send-command', command)
        },
        getProperties: (serverid) => {
            return ipcRenderer.invoke('server:get-properties', serverid)
        }
    },
    bind: {
        pending: binder('server:pending'),
        started: binder('server:started'),
        eula: binder('server:eula'),
        error: binder('server:error'),
        logged: binder<ServerLog>('server:log'),
        close: binder('server:close'),
        progress: binder('server:progress'),
        dimension: binder('server:dimension')
    },
    unbind: {
        pending: unbinder('server:pending'),
        started: unbinder('server:started'),
        eula: unbinder('server:eula'),
        error: unbinder('server:error'),
        logged: unbinder<ServerLog>('server:log'),
        close: unbinder('server:close'),
        progress: unbinder('server:progress'),
        dimension: unbinder('server:dimension')
    }
}

contextBridge.exposeInMainWorld("api", api)
contextBridge.exposeInMainWorld("platform", process.platform)

*/

const createListener = (channel: string, condition?: string) => (listener: (updated: any) => void) => {

    const grouped = (evt: IpcRendererEvent, ...args: any[]) => {
        listener(args[0])
    }

    ipcRenderer.addListener(condition ? `${channel}:${condition}` : channel, grouped);

    return () => {
        ipcRenderer.removeListener(condition ? `${channel}:${condition}` : channel, grouped)
    }
} 

const api: API = {
    window: {
        minimize: () => ipcRenderer.send('window:minimize'),
        maximize: () => ipcRenderer.send('window:maximize'),
        close: () => ipcRenderer.send('window:close'),
        focus: {
            get: () => ipcRenderer.invoke('window:focus'),
            listen: createListener('window:focus')
        }
    },
    application: {
        state: {
            get: () => ipcRenderer.invoke('application:state'),
            listen: createListener('application:state')
        },
        publicIp: {
            get: () => ipcRenderer.invoke('application:public-ip'),
            listen: createListener('application:public-ip')
        }
    },
    servers: {
        list: {
            get: () => ipcRenderer.invoke('servers:list'),
            listen: createListener('servers:list')
        },
        get: (id) => {
            return {
                get: () => ipcRenderer.invoke('servers:get', id),
                listen: createListener('servers:get', id)
            }
        },
        current: {
            get: () => ipcRenderer.invoke('servers:current'),
            listen: createListener('servers:current')
        },
        // todo
        create: (info) => ipcRenderer.invoke('servers:create', info),
        // todo
        edit: (id, info) => ipcRenderer.invoke('servers:edit', id, info),
        directory: serverid => ipcRenderer.invoke('servers:directory', serverid),
        // todo
        setProperty: ({ id, property }, value) => ipcRenderer.invoke('servers:properties-edit', id, property, value)
    },
    current: {
        start: serverid => ipcRenderer.invoke('current:start', serverid),
        stop: () => ipcRenderer.invoke('current:stop'),
        restart: () => ipcRenderer.invoke('current:restart'),
        status: {
            get: () => ipcRenderer.invoke('current:status'),
            listen: createListener('current:status')
        },
        loading: {
            get: () => ipcRenderer.invoke('current:loading'),
            listen: createListener('current:loading')
        },
        logs: {
            get: () => ipcRenderer.invoke('current:logs'),
            listen: createListener('current:log')
        },
        logWindow: () => ipcRenderer.invoke('current:log-window'),
        command: cmd => ipcRenderer.invoke('current:command', cmd),
    }
}

contextBridge.exposeInMainWorld('api', api)
contextBridge.exposeInMainWorld("platform", process.platform)
