import dayjs from 'dayjs'

type LogStatus = 'INFO' | 'WARN' | 'ERROR' | 'UNKNOWN'

type LogFlags = 'EULA' | 'DONE'

interface Log {
    time: string;
    thread: 'MAIN' | string;
    status: LogStatus;
    message: string;
    flags?: LogFlags
}

const isStatus = (test: string): test is LogStatus => {
    return ['INFO', 'WARN', 'ERROR'].includes(test);
}

export const parseLine = (logline: string) => {

    const match = logline.match(/\[(\d{2}:\d{2}:\d{2})\] \[([a-zA-Z0-9]+)\/([A-Z]+)\]: (.*)/)

    if(!match) return null;

    const line: Log = {
        time: match[1],
        thread: match[2],
        status: isStatus(match[3]) ? match[3] : 'UNKNOWN',
        message: match[4]
    }

    // Check for Flags
    if(line.message.includes('Go to eula.txt for more info.')) {
        line.flags = 'EULA';
    } else if(line.message.includes('Done!')) {
        line.flags = 'DONE'
    }

    return line;

}