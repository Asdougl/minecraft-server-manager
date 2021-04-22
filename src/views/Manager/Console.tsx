import { ServerLog } from '../../../app/types'
import React, { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Input from '../../components/util/Input'

interface Props {
    logs: ServerLog[] | null;
    command: (cmd: string) => void;
}

const Console = ({ logs, command }: Props) => {

    const [cmd, setCmd] = useState('')
    const bottom = useRef<HTMLLIElement | null>(null)

    const sendCommand = (e: React.FormEvent) => {
        e.preventDefault();
        if(cmd) {
            command(cmd);
            setCmd('');
        }
    }

    useEffect(() => {
        if(bottom.current) bottom.current.scrollIntoView()
    },[logs])

    return (
        <div className="flex flex-col h-full">
            <ul className="flex-grow overflow-y-scroll overflow-x-hidden">
                {logs ? logs.map(log => (
                    <li
                        key={log.id}
                        className="font-mono text-xs"
                    >
                        <span>[<span className="text-green-600">{log.time}</span>]</span>
                        <span>[<span className="text-blue-500">{log.thread}</span>/<span className="text-yellow-400">{log.status}</span>]</span>
                        <span>{log.message}</span>
                    </li>
                )) : <li>No Logs</li>}
                <li ref={bottom}></li>
            </ul>
            <form onSubmit={sendCommand} className="">
                <Input 
                    value={cmd}
                    onChange={val => setCmd(val)}
                    className="font-mono mt-1"
                />
            </form>
        </div>
    )
}

export default Console
