import { v4 as uuid } from 'uuid'
import { app } from 'electron'
import { createMinecraftServer, MinecraftServer } from './MinecraftServer'
import { promises as fs } from 'fs'
import path from 'path'
import { validServerData } from './types'

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

export const rebuildServers = async (broadcast: (channel: string, ...args: any[]) => void) => {
    try {

        const folder = path.join(app.getAppPath(), 'minecraft-servers')
        const srvmap: ServerMap = {}
        
        // Step 1 -- Ensure the minecraft-servers folder exists
        await ensureFolder(folder);

        // Step 2 -- Find all subfolders
        const contents = await fs.readdir(folder, { withFileTypes: true })
        for (const child of contents) {
            console.log("POTENTIAL:", child);
            if(child.isDirectory()) {
                // Check for a file called server.config.js
                try {
                    
                    const configraw = await fs.readFile(path.join(folder, child.name, 'manager.config.json'), 'utf-8')

                    const config = JSON.parse(configraw)

                    if(validServerData(config)) {
                        // Add to srvmap
                        const id = uuid();
                        const server = await createMinecraftServer(id, { 
                            data: config, 
                            dir: child.name,
                            broadcast,
                            onClose: () => {
                                current = null;
                            },
                            getCurrent: () => current ? current.getId() : ''
                        });
                        if(server) srvmap[id] = server;
                    }

                } catch (error) {
                    console.log(`Folder ${child.name} is an invalid server. Why:`)
                    console.log(error);
                }
                
            }
        }

        // Step 3 -- Assign the Server Map
        servers = srvmap;

        console.log(servers);

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