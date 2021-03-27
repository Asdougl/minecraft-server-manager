import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import log from 'electron-log'

import {
    checkForFolder,
    createDirectory,
    checkForServer,
    eula,
    startServer,
} from './server'
import { ChildProcessWithoutNullStreams } from 'node:child_process'
import { CheckResponse } from './RendererAPI'
import { openServerPath } from './files'

const IS_DEV = process.env.NODE_ENV === 'development'

const createWindow = (onClose: () => void) => {

    // Create Window Object
    const window = new BrowserWindow({
        height: 600,
        width: 400,
        frame: true,
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
        winLocation = "http://localhost:8080/index.html"
    } else {
        winLocation = "file://" + path.join(__dirname, "../renderer/index.html")
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

    return window;

}

// Track Window Status and Handle Window with this
let win: BrowserWindow | null = null;

// Handle Window Focus
const focusWindow = () => {
    if(win) {
        if(win.isMinimized()) win.restore()
        win.focus();
    } else {
        win = createWindow(() => win = null)
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
app.on('ready', () => win = createWindow(() => win = null))
app.on('window-all-closed', () => app.quit())
app.on('activate', focusWindow)

// Node Error Handler
const sendNodeError = (error: Error) => {
    if(win) win.webContents.send('node-error', error);
}

/* ------| WINDOW FUNCTIONS |------ */

ipcMain.on('window:minimize', () => {
    if(win) win.minimize()
})

ipcMain.on('window:maximize', () => {
    if(win) win.isMaximized() ? win.unmaximize() : win.maximize()
})

ipcMain.on('window:close', () => {
    if(win) win.close()
})


/* ------| MINECRAFT SERVER |------ */

let server: ChildProcessWithoutNullStreams | null;

// We need to:
//  1) Check that the server folder exists
//  2) Check that it contains a minecraft server
//  3) Check that the eula has been agreed to

ipcMain.handle('server:status', async () => {
    // Check if server is running
    return server === null ? 'offline' : 'online';
})

ipcMain.handle('server:start', async () => {
    try {

        server = startServer({
            onOut: msg => {
                log.info(msg)
            },
            onError: msg => {
                log.error(msg)
            },
            onClose: () => {
                if(win) win.webContents.send('server:close')
            },
            onReady: () => {
                if(win) win.webContents.send('server:ready')
            }
        })

        return 'success';

    } catch (error) {
        log.error(error)
        sendNodeError(error);
        return 'error';
    }
})

ipcMain.handle('server:stop', () => {
    try {
        
        if(server) server.kill('SIGINT');

        return true;

    } catch (error) {
        log.error(error)
        sendNodeError(error)
        return false;
    }
})

ipcMain.handle('server:restart', () => {
    // TODO
})

ipcMain.handle('server:eula', (evt, status) => {
    eula(status);
})

ipcMain.handle('files:open', () => {
    openServerPath()
})