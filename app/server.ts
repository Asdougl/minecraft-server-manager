import * as fs from 'fs/promises'
import { app } from 'electron'
import path from 'path'
import { MinecraftServerConfig, MinecraftServer } from './MinecraftServer'

export const checkForFolder = async () => {
    try {
        
        const fsStat = await fs.stat(path.join(app.getAppPath(), 'minecraft'))

        return fsStat.isDirectory()

    } catch (error) {
        return false;
    }
}

export const createDirectory = async () => {
    try {
        
        await fs.mkdir(path.join(app.getAppPath(), 'minecraft'))

        return true;

    } catch (error) {
        return false;
    }
}

export const directoryCheck = async (nickname: string) => {

    try {
        const fsStat = await fs.stat(path.join(app.getAppPath(), 'minecraft-servers'))
        if(!fsStat.isDirectory()) throw new Error("Not Directory")
    } catch (error) {
        await fs.mkdir(path.join(app.getAppPath(), 'minecraft-servers'))
    }

    try {
        
        const fsStat = await fs.stat(path.join(app.getAppPath(), 'minecraft-servers', nickname))
        if(!fsStat.isDirectory()) throw new Error("Not Directory")
        
        return nickname;

    } catch (error) {

        // Directory Musn't exist!

        try {
            // Try Creating It
            await fs.mkdir(path.join(app.getAppPath(), 'minecraft-servers', nickname))
            return nickname;

        } catch (error) {
            // This also failed, you are a failure.
            throw error;
        }
    }
}

export const checkForServer = async (filename?: string) => {
    try {
        
        const fsStat = await fs.stat(path.join(app.getAppPath(), 'minecraft', `${filename || 'server'}.jar`))

        return fsStat.isFile()

    } catch (error) {
        return false;
    }
}

export const eulaCheck = async () => {
    try {
        
        // fs.stat throws error on file not found
        try {
            const fsStat = await fs.stat(path.join(app.getAppPath(), 'minecraft', 'eula.txt'))
            if(!fsStat.isFile()) return 'no-eula'
        } catch (error) {
            return 'no-eula';
        }

        const contents = await fs.readFile(path.join(app.getAppPath(), 'minecraft', 'eula.txt'));
        const eulaStatus = contents.toString().match(/eula=(true|false)/)

        if(!eulaStatus) return 'invalid-eula'

        return eulaStatus[1] === 'true' ? 'agreed' : 'not-agreed'

    } catch (error) {
        throw error;
    }
}

export const eula = async (set?: boolean) => {
    try {
        
        const fsStat = await fs.stat(path.join(app.getAppPath(), 'minecraft', 'eula.txt'))

        if(fsStat.isFile()) {
            const contents = await fs.readFile(path.join(app.getAppPath(), 'minecraft', 'eula.txt'));

            if(set) {
                const changed = contents.toString().replace(/eula=(true|false)/, set ? 'eula=true' : 'eula=false');
            
                await fs.writeFile(path.join(app.getAppPath(), 'minecraft', 'eula.txt'), changed)

                return set 
            } else {
                const eulaResult = contents.toString().match(/eula=(true|false)/)
                
                if(eulaResult) {
                    return JSON.parse(eulaResult[1])
                }

                return false;
            }

            
        }

        return false

    } catch (error) {
        return false
    }
}

export const createMinecraftServer = async (config: MinecraftServerConfig): Promise<MinecraftServer> => {
    try {
        
        await directoryCheck(config.server.dir);

        const serverCheck = await checkForServer();
        if(!serverCheck) throw new Error("Server File Not Found")

        return new MinecraftServer(config);

    } catch (error) {
        throw error;
    }
}