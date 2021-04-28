import { promises as fs, createWriteStream, createReadStream } from 'fs'
import { app } from 'electron'
import path from 'path'
import { spawn } from 'child_process'
import { parse as propsParse, stringify as propsStringify, Tree } from 'dot-properties'
import archiver from 'archiver'
import unzipper from 'unzipper'

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

/*
export const createMinecraftServer = async (config: MinecraftServerConfig): Promise<MinecraftServer> => {
    try {
        
        await directoryCheck(config.server);

        const serverCheck = await checkForServer();
        if(!serverCheck) throw new Error("Server File Not Found")

        return new MinecraftServer(config);

    } catch (error) {
        throw error;
    }
}
*/

export const openServerPath = (dir?: string) => {

    const dirpath = dir ? path.join(app.getAppPath(), 'minecraft-servers', dir) : path.join(app.getAppPath(), 'minecraft-servers')

    if(process.platform === 'win32') {
        spawn('explorer', ['.'], { cwd: dirpath })
    } else if(process.platform === 'darwin') {
        spawn('open', ['.'], { cwd: dirpath })
    }
}

export const getProperties = async (dir: string) => {
    try {
        
        const propsraw = await fs.readFile(path.join(app.getAppPath(), 'minecraft-servers', dir, 'server.properties'));

        return propsParse(propsraw.toString())

    } catch (error) {
        throw error;
    }
}

export const setProperties = async (dir: string, properties: Tree) => {
    try {
        
        await fs.writeFile(path.join(app.getAppPath(), 'minecraft-servers', dir, 'server.properties'), propsStringify(properties))

    } catch (error) {
        throw error;
    }
}

export const archiveDirectory = (inputPath: string, outputPath: string) => new Promise<number>((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => {
        resolve(archive.pointer());
    })
    
    archive.on('error', err => {
        reject(err);
    })

    archive.pipe(output);

    archive.directory(inputPath, false);

    archive.finalize();
})

export const extractArchive = (archivePath: string, outputPath: string) => new Promise<void>((resolve, reject) => {
    createReadStream(archivePath)
        .pipe(unzipper.Extract({ path: outputPath }))
        .on('close', () => resolve())
        .on('error', () => reject())
})