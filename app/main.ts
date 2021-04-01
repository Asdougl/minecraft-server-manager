import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import log from 'electron-log'
import { promises as fs } from 'fs'
import {
    createMinecraftServer,
    directoryCheck,
} from './server'
import { openServerPath } from './files'
import { MinecraftServer, ServerLog } from './MinecraftServer'
import { ServerData, ServerStatus } from './RendererAPI'
import Store from 'electron-store'
import { v4 as uuidv4 } from 'uuid'

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

/* ------| ELECTRON STORE |------ */

interface StoreSchema {
    servers: ServerData[];
}

const storage = new Store<StoreSchema>({
    schema: {
        servers: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    dir: { type: 'string' },
                    gamemode: { type: 'string' },
                },
                required: ['id', 'name', 'dir', 'gamemode'],
            },
            default: []
        }   
    }
});

// storage.set('servers', [])

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

const sendWindowEvent = (channel: string, data?: string) => {
    if(win) win.webContents.send(channel, data)
}


/* ------| MINECRAFT SERVER |------ */

let server: MinecraftServer | null = null;

let logs: ServerLog[] = [];

app.on('before-quit', async () => {
    if(server) await server.closeServer();
})

// Ensure there is a minecraft-servers folder
fs.stat(path.join(app.getAppPath(), 'minecraft-servers'))
.then(stat => {
    if(!stat.isDirectory) {
        fs.mkdir(path.join(app.getAppPath(), 'minecraft-servers'))
    }
})
.catch(err => {
    if(err.code === 'ENOENT') {
        fs.mkdir(path.join(app.getAppPath(), 'minecraft-servers'))
    }
})

// We need to:
//  1) Check that the server folder exists
//  2) Check that it contains a minecraft server
//  3) Check that the eula has been agreed to

ipcMain.handle('server:status', (): ServerStatus => {
    // Check if a Server is running
    if(server !== null) {
        return 'online'
    } else {
        // Offline, but what type?
        if(storage.get('servers').length) {
            return 'offline'
        } else {
            return 'no-servers'
        }
    }
})

ipcMain.handle('server:list', (): ServerData[] => {
    return storage.get('servers')
})

ipcMain.handle('server:get', (evt, serverid: string): ServerData | undefined => {
    return storage.get('servers').find(srv => srv.id === serverid)
})

ipcMain.handle('server:current', (): ServerData | undefined => {
    if(server) return server.getData();
})

ipcMain.handle('server:start', async (evt, serverid: string) => {

    try {

        if(server === null)  {

            const allServers = storage.get('servers')
            const active = allServers.find(srv => srv.id === serverid)
            if(!active) throw new Error("Server of id " + serverid + " not found")

            if(win) win.webContents.send('server:pending');

            server = await createMinecraftServer({
                server: active,
                onClose: () => {
                    sendWindowEvent('server:close')
                    server = null;
                },
                onInit: () => {
                    sendWindowEvent('server:initialized')
                },
                onEvent: (event, data) => {
                    sendWindowEvent(`server:${event}`, data)
                }
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

ipcMain.handle('server:logs', () => {
    return logs;
})

ipcMain.handle('server:create', async (evt, serverPath: string, name: string) => {
    try {

        const servers = storage.get('servers')

        // 0a) Check name is valid
        if(!/^[A-Za-z 0-9-_]+$/.test(name)) throw new Error("Invalid Server Name")

        const dir = name.toLowerCase().replaceAll(' ', '-')

        // 0b) Check name is unique
        if(servers.find(srv => srv.name === name || srv.dir === name || srv.dir === dir || srv.name === dir)) throw new Error("Server Name already in use")
        
        // 1) Check for folder
        await directoryCheck(dir);

        // 2) Write File to Directory
        console.log(serverPath, name)
        await fs.copyFile(serverPath, path.join(app.getAppPath(), 'minecraft-servers', dir, 'server.jar'))

        // 3) Run a EULA Check
        await fs.writeFile(path.join(app.getAppPath(), 'minecraft-servers', dir, 'eula.txt'), 'eula=true');

        // 4) Create Server Data
        const srv: ServerData = {
            id: uuidv4(),
            name,
            dir,
            gamemode: 'survival'
        }

        // 4) Track in Storage
        storage.set('servers', [...storage.get('servers'), srv])

        return;

    } catch (error) {
        log.error(error)
        sendNodeError(error)
        return;
    }
})

ipcMain.handle('files:open', () => {
    openServerPath()
})