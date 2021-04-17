import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { promises as fs, existsSync, mkdirSync } from 'fs'
import { MinecraftServer, createMinecraftServer } from './MinecraftServer'
import { LoadState, LogEvents, ServerData, ServerInfo } from './types'
import { v4 as uuid } from 'uuid'
import publicip from 'public-ip'
import { getCurrent, getServer, getServerList, rebuildServers, startServer } from './servers'
import { openServerPath } from './utils'

const IS_DEV = process.env.NODE_ENV === 'development'


/*
    # CREATE WINDOW
======================================================= */

interface CreateWindowOptions {
    onClose: () => void;
    route?: string;
    height?: number;
    width?: number;
}

const createWindow = ({ onClose, route, height, width }: CreateWindowOptions) => {

    // Create Window Object
    const window = new BrowserWindow({
        height: height || 600,
        width: width || 400,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false,
        }
    })

    // Process Window Location
    let winLocation: string;
    if(IS_DEV) {
        winLocation = route ? `http://localhost:8080/#/${route}` : "http://localhost:8080/"
    } else {
        winLocation = "file://" + path.join(__dirname, route ? `http://localhost:8080/#/${route}` : "../renderer/")
    }
    window.loadURL(winLocation)

    // Handle Events
    window.on('close', () => {
        if(window.webContents.isDevToolsOpened()) window.webContents.closeDevTools()
        onClose()
    })

    window.once('ready-to-show', () => {
        if(IS_DEV) {
            window.webContents.openDevTools()
        }
    })

    window.on('focus', () => {
        window.webContents.send("window:focus", true)
    })

    window.on('blur', () => {
        window.webContents.send('window:focus', false)
    })

    return window;

}

ipcMain.on('window:minimize', (evt) => {
    // if(win) win.minimize()
    BrowserWindow.getFocusedWindow()?.minimize();
})

ipcMain.on('window:maximize', () => {
    // if(win) win.isMaximized() ? win.unmaximize() : win.maximize()
    const curr = BrowserWindow.getFocusedWindow()
    if(curr) {
        curr.isMaximized() ? curr.unmaximize() : curr.maximize();
    }
})

ipcMain.on('window:close', () => {
    // if(win) win.close()
    BrowserWindow.getFocusedWindow()?.close();
})

ipcMain.handle('window:focus', () => {
    const curr = BrowserWindow.getFocusedWindow()
    return curr ? curr.isFocused() : false;
})


/*
    # WINDOWS
======================================================= */

// Track Window Status and Handle Window with this
interface WinMap {
    [id: string]: BrowserWindow;
}

const winmap: WinMap = {}

// Handle Window Focus
const focusWindow = () => {
    if(winmap['main']) {
        if(winmap['main'].isMinimized()) winmap['main'].restore()
        winmap['main'].focus();
    } else {
        winmap['main'] = createWindow({ onClose: () => delete winmap['main']})
    }
}

// Handle Single Instance Lock
const gotLock = app.requestSingleInstanceLock()
if(gotLock === false) {
    // Another window already has the lock
    app.quit();
} else {
    // We got the lock - bind what happens if another tries to open
    app.on('second-instance', focusWindow)
}

// Handle App Events
app.on('ready', () => winmap['main'] = createWindow({ onClose: () => delete winmap['main'] }))
app.on('window-all-closed', () => app.quit())
app.on('activate', focusWindow)

// Node Error Handler
const broadcast = (channel: string, ...args: any[]) => {
    console.log("Having a little broadcast here... ", channel, ...args);
    for(const id in winmap) {
        winmap[id].webContents.send(channel, ...args);
    }
}

const openWindow = (id: string, winconfig: CreateWindowOptions) => {
    if(winmap[id]) {
        winmap[id].focus();
    } else {
        const window = createWindow({ ...winconfig, onClose: () => delete winmap[id]})
        winmap[id] = window;
        window.focus();
    }
}


/*
    # APPLICATION API
    track where the app is at int erms of starting up
======================================================= */

type ApplicationState = 'init' | 'loading' | 'active'

let appState: ApplicationState = 'init';

// State Hook
ipcMain.handle('application:state', () => appState)

const changeApplicationState = (newstate: ApplicationState) => {
    appState = newstate;
    broadcast('application:state', newstate)
}

// Public IP Action
ipcMain.handle('application:public-ip', async () => {
    try {
        return await publicip.v4();
    } catch (error) {
        return '';
    }
})


/*
    # MINECRAFT SERVERS
    track the minecraft servers
======================================================= */

rebuildServers(broadcast);

ipcMain.handle('servers:list', (evt, newserver?: ServerInfo) => {
    if(newserver) {
        // Add the new server
    }
    return getServerList();
})

ipcMain.handle('servers:get', (evt, serverid: string) => {
    const server = getServer(serverid)
    return server ? server.getServerInfo() : null;
})

ipcMain.handle('servers:current', () => {
    const curr = getCurrent();
    return curr ? curr.getServerInfo() : null;
})

ipcMain.handle('servers:directory', (evt, serverid: string) => {
    const srv = getServer(serverid)
    if(srv) openServerPath(srv.getServerInfo().dir)
})

ipcMain.handle('servers:create', (evt, config: ServerInfo) => {
    // TODO
})

ipcMain.handle('servers:edit', (evt, id: string, config: ServerInfo) => {
    // TODO
})

ipcMain.handle('servers:properties-edit', (evt, id: string, property: string, value: string) => {
    // TODO
    const srv = getServer(id)
    if(srv) {
        srv.setProperty(property, value)
    }
})


/*
    # CURRENT MINECRAFT SERVER
    the current active minecraft server
======================================================= */

ipcMain.handle('current:start', (evt, serverid: string) => {
    // Set the current server as a found server
    // Start that server
    return startServer(serverid);
})

ipcMain.handle('current:stop', () => {
    // Stop the current running server if there is one
    const curr = getCurrent();
    if(curr) {
        curr.stop();
    }
})

ipcMain.handle('current:restart', () => {
    // If there is a current server, restart it
    const curr = getCurrent();
    if(curr) {
        curr.restart()
    }
})

ipcMain.handle('current:status', () => {
    // If there is a current server, return its status
    const curr = getCurrent();
    return curr ? curr.getStatus() : 'offline';
})

ipcMain.handle('current:loading', (): LoadState | undefined => {
    const curr = getCurrent();
    return curr ? { state: 'pending' } : undefined;
})

ipcMain.handle('current:logs', () => {
    // If there is a current server, return is log[]
    const curr = getCurrent()
    if(curr) {
        return curr.getLogs();
    }
})

ipcMain.handle('current:log-window', () => {
    // If there is a current server, open a window contianing its log[]
})

ipcMain.handle('current:command', (evt, command: string) => {
    // If there is a current server, send a command to it
    const curr = getCurrent();
    if(curr) {
        return curr.cmd(command);
    }
})