import * as fs from 'fs/promises'
import { app } from 'electron'
import path from 'path'
import { spawn } from 'child_process'

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

export const checkForServer = async (filename?: string) => {
    try {
        
        const fsStat = await fs.stat(path.join(app.getAppPath(), 'minecraft', `${filename || 'server'}.jar`))

        return fsStat.isFile()

    } catch (error) {
        return false;
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

interface ServerConfig {
    onOut: (msg: string) => void;
    onError: (msg: string) => void;
    onClose: () => void;
    onReady: () => void;
    filename?: string;
    gigabytes?: number;
}

export const startServer = ({ onOut, onError, onClose, onReady, filename, gigabytes }: ServerConfig) => {

    let ram1 = '-Xmx2G', ram2 = '-Xms2G'
    if(gigabytes) {
        if(gigabytes >= 2 && gigabytes <= 8) {
            ram1 = `-Xmx${Math.floor(gigabytes)}G`
            ram2 = `-Xms${Math.floor(gigabytes)}G`
        }
    }

    const child = spawn('java', [ram1, ram2, '-jar', `${filename || 'server'}.jar`, 'nogui'], { cwd: path.join(app.getAppPath(), 'minecraft') })

    child.stdout.on('data', data => {
        onOut(data.toString())
    })

    child.stderr.on('data', data => {
        onError(data.toString())
    })

    child.on('error', err => {
        onError(err.message)
    })

    const onExit = () => {
        child.kill('SIGINT')
    };

    child.on('close', () => {
        process.off('beforeExit', onExit)
        onClose()
    });

    process.on('beforeExit', onExit)

    return child;
}