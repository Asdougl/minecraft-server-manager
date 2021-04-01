import { contextBridge, ipcRenderer } from "electron";
import { Log } from "./logs";
import RendererAPI, { EventCallback } from './RendererAPI'

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
        openDirectory: () => {
            return ipcRenderer.invoke('files:open')
        },
        getLogs: () => {
            return ipcRenderer.invoke('server:logs')
        },
        createServer: (file, name) => {
            return ipcRenderer.invoke('server:create', file, name)
        }
    },
    bind: {
        pending: binder('server:pending'),
        started: binder('server:started'),
        eula: binder('server:eula'),
        error: binder('server:error'),
        logged: binder<Log>('server:log'),
        close: binder('server:close'),
        progress: binder('server:progress'),
        dimension: binder('server:dimension')
    },
    unbind: {
        pending: unbinder('server:pending'),
        started: unbinder('server:started'),
        eula: unbinder('server:eula'),
        error: unbinder('server:error'),
        logged: unbinder<Log>('server:log'),
        close: unbinder('server:close'),
        progress: unbinder('server:progress'),
        dimension: unbinder('server:dimension')
    }
}

contextBridge.exposeInMainWorld("api", api)
contextBridge.exposeInMainWorld("platform", process.platform)