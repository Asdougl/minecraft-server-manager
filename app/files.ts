import { spawn } from 'child_process'
import path from 'path'
import { app } from 'electron'

export const openServerPath = () => {
    if(process.platform === 'win32') {
        spawn('explorer', ['.'], { cwd: path.join(app.getAppPath(), 'minecraft') })
    } else if(process.platform === 'darwin') {
        spawn('open', ['.'], { cwd: path.join(app.getAppPath(), 'minecraft') })
    }
}