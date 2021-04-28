import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import { LoadState, MinecraftUser, Preferences, ServerCreateInfo, ServerInfo, Theme } from './types'
import publicip from 'public-ip'
import { getCurrent, getServer, getServerList, rebuildServers, startServer, createServer, pingCurrent } from './servers'
import { openServerPath } from './utils'
import AutoLaunch from 'auto-launch'
import ElectronStore from 'electron-store'

const IS_DEV = process.env.NODE_ENV === 'development'

/*
    # ELECTRON STORE
======================================================= */

const store = new ElectronStore<Preferences>({
    schema: {
        startup: {
            type: 'boolean',
            default: false,
        },
        defaultServer: {
            type: ['null', 'string'],
            default: null,
        },
        minimised: {
            type: ['boolean'],
            default: false,
        },
        theme: {
            enum: ['light', 'dark'],
            default: 'light'
        },
    }
})

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
app.on('ready', () => {

    console.log("Auto Start: ", store.get('defaultServer'))
    rebuildServers(broadcast, store.get('defaultServer') || '');
    
    winmap['main'] = createWindow({ onClose: () => delete winmap['main'] })
    
    if(!IS_DEV) {
        const autoLauncher = new AutoLaunch({
            name: 'Minecraft Server Manager',
            path: app.getPath('exe')
        })
        autoLauncher.isEnabled().then(enabled => {
            const startup = store.get('startup')
            if(enabled) {
                if(!startup) autoLauncher.disable();
            } else {
                if(startup) autoLauncher.enable();
            }
        })
    }
    
})
app.on('window-all-closed', () => app.quit())
app.on('activate', focusWindow)

// Node Error Handler
const broadcast = (channel: string, ...args: any[]) => {
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

// Open Link Externally
ipcMain.handle('application:open-external', (evt, url: string) => {
    shell.openExternal(url)
})


/*
    # MINECRAFT SERVERS
    track the minecraft servers
======================================================= */

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

ipcMain.handle('servers:create', async (evt, config: ServerCreateInfo) => {
    try {
        
        await createServer({
            name: config.name,
            jarpath: config.jar,
            broadcast: broadcast,
        })

        return true;

    } catch (error) {
        return false;
    }
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

ipcMain.handle('servers:world-add', (evt, serverid: string, worldname: string) => {
    const srv = getServer(serverid)
    if(srv) {
        srv.addWorld(worldname);
    }
})

ipcMain.handle('servers:world-rename', (evt, serverid: string, worldname: string, title: string) => {
    const srv = getServer(serverid)
    if(srv) {
        srv.editWorld(worldname, 'title', title);
    }
})

ipcMain.handle('servers:schedule-backup', (evt, serverid: string, worldname: string, cron?: string) => {
    const srv = getServer(serverid)
    if(srv) {
        srv.editWorld(worldname, 'schedule', cron);
    }
})

ipcMain.handle('servers:backups', (evt, serverid: string) => {
    const srv = getServer(serverid)
    return srv ? srv.getBackups() : []
})

ipcMain.handle('servers:create-backup', async (evt, serverid: string, worldname: string) => {
    const srv = getServer(serverid)
    if(srv) await srv.createBackup(worldname)
})

ipcMain.handle('servers:restore-backup', async (evt, serverid: string, backupid: string, autobackup?: boolean) => {
    const srv = getServer(serverid);
    if(srv) await srv.restoreBackup(backupid, autobackup)
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

ipcMain.handle('current:ping', async () => {
    if(getCurrent()) {
        try {
            
            return await pingCurrent();

        } catch (error) {
            return undefined;
        }   
    } else {
        return undefined
    }
})

ipcMain.handle('current:players', async () => {
    const curr = getCurrent();
    if(curr) {

        return curr.getPlayers();

    } else {
        return []
    }
})


/*
    # SERVER MANAGER SETTINGS
======================================================= */

ipcMain.handle('settings:startup', async (evt, startup?: boolean) => {
    // TODO
    if(startup !== undefined) {
        // Setting
        store.set('startup', startup);
        broadcast('settings:startup', startup)
    }

    return store.get('startup')
})

ipcMain.handle('settings:default-server', async (evt, server?: string | null) => {
    // TODO
    if(server !== undefined) {
        // Setting
        store.set('defaultServer', server);
        broadcast('settings:default-server', server)
    }
    
    return store.get('defaultServer')
})

ipcMain.handle('settings:minimised', async (evt, minimised?: boolean) => {
    // TODO
    if(minimised !== undefined) {
        // Setting
        store.set('minimised', minimised);
        broadcast('settings:minimised', minimised)
    }
    
    return store.get('minimised')
})

ipcMain.handle('settings:theme', async (evt, theme?: Theme) => {
    // TODO
    if(theme !== undefined) {
        // Setting
        store.set('theme', theme);
        broadcast('settings:theme', theme)
    }
    
    return store.get('theme')
})