import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import log from 'electron-log'

import {
    eula,
    MinecraftServer,
    createMinecraftServer,
    directoryCheck,
    eulaCheck,
    checkForServer,
} from './server'
import { openServerPath } from './files'
import { Log as ServerLog, parseLine } from './logs'

const IS_DEV = process.env.NODE_ENV === 'development'

const createWindow = (onClose: () => void) => {

    // Create Window Object
    const window = new BrowserWindow({
        height: 600,
        width: 400,
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

    window.on('focus', () => {
        window.webContents.send("window:focus")
    })

    window.on('blur', () => {
        window.webContents.send('window:blur')
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

ipcMain.handle('window:status', () => {
    return win ? win.isFocused() : false;
})


/* ------| MINECRAFT SERVER |------ */

let server: MinecraftServer | null = null;

let logs: ServerLog[] = [];

app.on('before-quit', async () => {
    if(server) await server.closeServer();
})

// We need to:
//  1) Check that the server folder exists
//  2) Check that it contains a minecraft server
//  3) Check that the eula has been agreed to

ipcMain.handle('server:status', async () => {
    // Check if server is running
    if(server !== null) {
        // Safe to assume its online
        return 'online';
    } else if(!directoryCheck()) {
        return 'no-folder';
    } else if(!checkForServer()) {
        return 'no-server'
    } else {
        const eula = await eulaCheck();

        if(eula === 'invalid-eula' || eula === 'no-eula') return 'no-first-run'

        if(eula === 'not-agreed') return 'eula-agree'

        // Otherwise it must just be offline
        return 'offline'

    }
})

ipcMain.handle('server:start', async () => {

    try {

        if(server === null)  {

            if(win) win.webContents.send('server:pending');

            server = await createMinecraftServer();

            server.onOut(msg => {
                const parsed = parseLine(msg);
                if(parsed) {
                    if(parsed.event) {
                        // fire events based on flags
                        console.log(`Evt server:${parsed.event} Inbound`);
                        if(win) win.webContents.send(`server:${parsed.event}`, parsed.eventData)
                    }
                    logs = [...logs, parsed];
                    if(win) win.webContents.send('server:log', parsed);
                }
                log.info(msg);
            })

            server.onError(err => {
                log.error(err);
            })

            server.onClose(() => {
                if(win) win.webContents.send('server:close')
            })
        }

        return 'success';

    } catch (error) {
        log.error(error)
        sendNodeError(error);
        return 'error';
    }
})

ipcMain.handle('server:stop', async () => {
    try {
        
        if(server) {
            await server.closeServer()
            server = null;
            logs = [];
        }

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

ipcMain.handle('server:logs', () => {
    return logs;
})

ipcMain.handle('files:open', () => {
    openServerPath()
})