import * as fs from 'fs/promises'
import { app } from 'electron'
import path from 'path'
import { spawn } from 'child_process'
import { ChildProcessWithoutNullStreams } from 'node:child_process'

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

export const directoryCheck = async () => {
    try {
        
        const fsStat = await fs.stat(path.join(app.getAppPath(), 'minecraft'))
        if(!fsStat.isDirectory()) throw new Error("Not Directory")
        
        return true;

    } catch (error) {

        // Directory Musn't exist!

        try {
            // Try Creating It
            await fs.mkdir(path.join(app.getAppPath(), 'minecraft'))
            return true;

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
        
        const fsStat = await fs.stat(path.join(app.getAppPath(), 'minecraft', 'eula.txt'))

        if(!fsStat.isFile()) return 'no-eula'

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

interface ServerConfig {
    onOut: (msg: string) => void;
    onError: (msg: string) => void;
    onClose: () => void;
    onReady: () => void;
    filename?: string;
    gigabytes?: number;
}

interface MinecraftServerConfig {
    filename?: string;
    gigabytes?: number;
}

export const createMinecraftServer = async (config?: MinecraftServerConfig): Promise<MinecraftServer> => {
    try {
        
        await directoryCheck();

        const serverCheck = await checkForServer();
        if(!serverCheck) throw new Error("Server File Not Found")

        return new MinecraftServer(config);

    } catch (error) {
        throw error;
    }
}

export class MinecraftServer {

    private child: ChildProcessWithoutNullStreams;

    constructor(config?: MinecraftServerConfig) {

        let ram1 = '-Xmx2G', ram2 = '-Xms2G'
        if(config && config.gigabytes) {
            if(config.gigabytes >= 2 && config.gigabytes <= 8) {
                ram1 = `-Xmx${Math.floor(config.gigabytes)}G`
                ram2 = `-Xms${Math.floor(config.gigabytes)}G`
            }
        }

        this.child = spawn('java', [ram1, ram2, '-jar', `${config && config.filename ? config.filename : 'server'}.jar`, 'nogui'], { cwd: path.join(app.getAppPath(), 'minecraft') })

        process.on('beforeExit', () => this.child.kill('SIGINT'));
    }

    public onOut = (callback: (msg: string) => void) => {
        this.child.stdout.on('data', data => callback(data.toString()))
    }

    public onError = (callback: (err: string) => void) => {
        this.child.stderr.on('data', data => callback(data.toString()))
    }

    public onClose = (callback: () => void) => {
        this.child.on('close', () => callback())
    }

    public sendCommand = (command: string) => {
        this.child.stdin.write(command + '\n');
    }

    public closeServer = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            this.sendCommand('stop');

            const tookTooLong = setTimeout(() => {
                this.child.kill('SIGINT');
            }, 5000)

            this.child.on('error', err => {
                reject(err)
                clearTimeout(tookTooLong);
                this.child.kill('SIGINT')
            })

            this.child.on('exit', () => {
                clearTimeout(tookTooLong)
                resolve();
            })
        })
    }

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