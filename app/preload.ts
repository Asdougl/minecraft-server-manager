import { contextBridge, ipcRenderer } from "electron";
import { IpcRendererEvent } from "electron/main";
import { API, Hook, InteractiveHook } from './types'

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

const createHook = <T>(channel: string): Hook<T> => ({
    get: () => ipcRenderer.invoke(channel),
    listen: createListener(channel)
})

const createInteractiveHook = <T>(channel: string): InteractiveHook<T> => ({
    get: () => ipcRenderer.invoke(channel),
    set: (value: T) => ipcRenderer.invoke(channel, value),
    listen: createListener(channel)
})

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
        },
        openExternal: (url: string) => ipcRenderer.invoke('application:open-external', url)
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
        setProperty: ({ id, property }, value) => ipcRenderer.invoke('servers:properties-edit', id, property, value),
        addWorld: (serverid, worldname) => ipcRenderer.invoke('servers:world-add', serverid, worldname),
        backups: id => {
            return {
                get: () => ipcRenderer.invoke('servers:backups', id),
                listen: createListener('servers:backups', id)
            }
        },
        createBackup: (serverid, worldname) => ipcRenderer.invoke('servers:create-backup', serverid, worldname)
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
            listen: createListener('current:logs')
        },
        logWindow: () => ipcRenderer.invoke('current:log-window'),
        command: cmd => ipcRenderer.invoke('current:command', cmd),
        ping: {
            get: () => ipcRenderer.invoke('current:ping'),
            listen: createListener('current:ping')
        },
        players: {
            get: () => ipcRenderer.invoke('current:players'),
            listen: createListener('current:players')
        }
    },
    settings: {
        startup: createInteractiveHook('settings:startup'),
        defaultServer: createInteractiveHook('settings:default-server'),
        minimised: createInteractiveHook('settings:minimised'),
        theme: createInteractiveHook('settings:theme')
    }
}

contextBridge.exposeInMainWorld('api', api)
contextBridge.exposeInMainWorld("platform", process.platform)
