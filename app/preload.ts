import { contextBridge, ipcRenderer } from "electron";
import RendererAPI from './RendererAPI'

const api: RendererAPI = {
    window: {
        minimize: () => ipcRenderer.send('window:minimize'),
        maximize: () => ipcRenderer.send('window:maximize'),
        close: () => ipcRenderer.send('window:close')
    },
    actions: {
        getStatus: () => {
            return ipcRenderer.invoke('server:status')
        },
        startServer: () => {
            return ipcRenderer.invoke('server:start')
        },
        stopServer: () => {
            return ipcRenderer.invoke('server:stop')
        },
        restartServer: () => {
            return ipcRenderer.invoke('server:restart')
        },
        eulaAgree: (status) => {
            return ipcRenderer.invoke('server:eula', status)
        },
        openDirectory: () => {
            return ipcRenderer.invoke('files:open')
        },
    },
    bind: {
        pending: (cb) => {
            ipcRenderer.addListener('server:pending', cb)
        },
        started: (cb) => {
            ipcRenderer.addListener('server:started', cb)
        },
        eula: cb => {
            ipcRenderer.addListener('server:eula', cb)
        },
        error: (cb) => {
            ipcRenderer.addListener('server:error', cb)
        },
        logged: cb => {
            ipcRenderer.addListener('server:log', cb)
        },
        close: cb => {
            ipcRenderer.addListener('server:close', cb)
        }
    },
    unbind: {
        pending: (cb) => {
            ipcRenderer.removeListener('server:pending', cb)
        },
        started: (cb) => {
            ipcRenderer.removeListener('server:started', cb)
        },
        eula: cb => {
            ipcRenderer.removeListener('server:eula', cb)
        },
        error: cb => {
            ipcRenderer.removeListener('server:error', cb)
        },
        logged: cb => {
            ipcRenderer.removeListener('server:log', cb)
        },
        close: cb => {
            ipcRenderer.removeListener('server:close', cb)
        }
    }
}

contextBridge.exposeInMainWorld("api", api)
contextBridge.exposeInMainWorld("platform", process.platform)