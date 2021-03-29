import { v4 as uuid } from 'uuid'

type LogStatus = 'INFO' | 'WARN' | 'ERROR' | 'UNKNOWN'
type LogEvents = 'eula' | 'started' | 'close' | 'pending' | 'dimension' | 'progress'

export interface Log {
    id: string;
    time: string;
    thread: 'MAIN' | string;
    status: LogStatus;
    message: string;
    event?: LogEvents;
    eventData?: string;
}

const isStatus = (test: string): test is LogStatus => {
    return ['INFO', 'WARN', 'ERROR'].includes(test);
}

export const parseLine = (logline: string) => {

    const match = logline.match(/\[(\d{2}:\d{2}:\d{2})\] \[(.+)\/([A-Z]+)\]: (.*)/)

    if(!match) return null;

    const line: Log = {
        id: uuid(),
        time: match[1],
        thread: match[2],
        status: isStatus(match[3]) ? match[3] : 'UNKNOWN',
        message: match[4]
    }

    // Check for Flags
    if(line.message.includes('Go to eula.txt for more info.')) {
        line.event = 'eula';
    } else if(line.message.match(/Done \(([\d.]+)s\)! For help, type "help"/)) {
        const match = line.message.match(/Done \(([\d.]+)s\)! For help, type "help"/)
        line.event = 'started'
        if(match) line.eventData = match[1]
    } else if(line.message.includes('Stopping server')) {
        line.event = 'close'
    } else if(line.message.match(/Preparing start region for dimension (.*)/)) {
        const match = line.message.match(/Preparing start region for dimension (.*)/)
        line.event = 'dimension'
        if(match) line.eventData = match[1]
    } else if(line.message.match(/Preparing spawn area: (\d+)%/)) {
        const match = line.message.match(/Preparing spawn area: (\d+)%/)
        line.event = 'progress'
        if(match) line.eventData = match[1];
    }

    return line;

}