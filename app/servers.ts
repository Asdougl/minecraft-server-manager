import { v4 as uuid } from 'uuid'
import { app } from 'electron'
import { createMinecraftServer, MinecraftServer } from './MinecraftServer'
import { promises as fs } from 'fs'
import path from 'path'
import { Broadcaster, ServerData, validServerData, ServerPing } from './types'
import net from 'net'

interface ServerMap {
    [id: string]: MinecraftServer
}

let servers: ServerMap = {}
let current: MinecraftServer | null = null;

const ensureFolder = async (folder: string) => {
    try {

        const stat = await fs.stat(folder)

        if(!stat.isDirectory()) throw false;

        return true;

    } catch (error) {
        
        await fs.mkdir(folder)

        return true;

    }
}

export const rebuildServers = async (broadcast: Broadcaster, autostart: string) => {
    try {

        const folder = path.join(app.getAppPath(), 'minecraft-servers')
        const srvmap: ServerMap = {}
        
        // Step 1 -- Ensure the minecraft-servers folder exists
        await ensureFolder(folder);

        // Step 2 -- Find all subfolders
        const contents = await fs.readdir(folder, { withFileTypes: true })
        for (const child of contents) {
            if(child.isDirectory()) {
                // Check for a file called server.config.js
                try {
                    
                    const configraw = await fs.readFile(path.join(folder, child.name, 'manager.config.json'), 'utf-8')

                    const config = JSON.parse(configraw)

                    if(validServerData(config)) {
                        // Add to srvmap
                        const server = await createMinecraftServer(config.id, { 
                            data: config, 
                            dir: child.name,
                            broadcast,
                            onClose: () => {
                                current = null;
                            },
                            getCurrent: () => current ? current.getId() : ''
                        });
                        if(server) srvmap[config.id] = server;
                    }

                } catch (error) {
                    // should be right.
                }
                
            }
        }

        // Step 3 -- Assign the Server Map
        servers = srvmap;

        if(autostart) {
            console.log("We gonna start a server... " + autostart)
            const started = startServer(autostart);
            console.log("Did is start? " + (started ? 'Yes' : 'No'))
        }

    } catch (error) {
        // Well then...
    }
}

export const getServer = (id: string): MinecraftServer | undefined => {
    return servers[id];
}

export const getServerList = () => {
    return Object.values(servers).map(srv => srv.getServerInfo());
}

export const getCurrent = () => {
    return current;
}

export const startServer = (serverid: string) => {
    if(current === null) {

        const server = getServer(serverid);

        if(server) {

            current = server;
            current.start();

            return true;

        } else {
            return false;
        }

    } else {
        return false;
    }
}

interface CreateServerOptions {
    name: string;
    dir?: string;
    jarpath: string;
    broadcast: Broadcaster;
}

export const serverFolderExists = async (name: string) => {
    try {
        
        const contents = await fs.readdir(path.join(app.getAppPath(), 'minecraft-servers'), { withFileTypes: true });

        const existing = contents.find(entity => entity.name === name && entity.isDirectory())

        return existing !== undefined;

    } catch (error) {
        throw error;
    }
}

export const createServer = async ({ name, dir, jarpath, broadcast }: CreateServerOptions) => {
    // Step 1 - Create the subfolder

    try {

        let foldername = dir;
        if(!foldername) {
            foldername = name.toLowerCase().replace(/[^a-z0-9-_ ]/g, '').replace(/ /g, '-');
        }
        
        const exists = await serverFolderExists(foldername)
        if(exists) {
            // eh oh
            foldername += '_' + Math.random().toString(36).substr(2, 7);
            const tryagain = await serverFolderExists(foldername);

            if(tryagain) throw new Error("Try a better name cunt");

        }

        // We now have a valid name! Make it!
        const folderpath = path.join(app.getAppPath(), 'minecraft-servers', foldername)

        await fs.mkdir(folderpath);

        // Add the Java File!
        await fs.copyFile(jarpath, path.join(folderpath, 'server.jar'));

        // Agree to the EULA
        await fs.writeFile(path.join(folderpath, 'eula.txt'), 'eula=true');

        const managerConfig: ServerData = {
            id: uuid(),
            name: foldername,
            title: name,
            activeWorld: 'world',
            worlds: [
                {
                    name: 'world',
                    title: 'World'
                }
            ]
        }

        // Write the config file
        await fs.writeFile(path.join(folderpath, 'manager.config.json'), JSON.stringify(managerConfig))

        // Add it to the srvmap

        const server = await createMinecraftServer(managerConfig.id, {
            data: managerConfig,
            dir: foldername,
            broadcast,
            onClose: () => {
                current = null;
            },
            getCurrent: () => current ? current.getId() : ''
        })
        if(server) {
            servers[managerConfig.id] = server;
        }
        

    } catch (error) {
        throw error;
    }

}

export const pingCurrent = (): Promise<ServerPing> => new Promise((resolve, reject) => {
    let sentAt = Date.now();
    const client = net.connect(25565, 'localhost', () => {
        const buf = Buffer.from([0xFE, 0x01])
        client.write(buf);
        sentAt = Date.now()
    })

    let ping: ServerPing | null = null;

    client.on('data', data => {
        if(data !== null && data.toString() !== '') {
            const info = data.toString().split('\x00\x00\x00')

            ping = {
                version: info[2].replace(/\u0000/g, ''),
                description: info[3].replace(/\u0000/g, ''),
                players: +info[4].replace(/\u0000/g, ''),
                max: +info[5].replace(/\u0000/g, ''),
                ping: Date.now() - sentAt,
            }
        }
    })

    client.on('error', err => {
        reject(err)
    })

    client.on('close', () => {
        if(ping) {
            resolve(ping)
        } else {
            reject(new Error("Ping Unsuccessful"))
        }
    })
})