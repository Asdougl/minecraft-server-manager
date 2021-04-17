import { ServerData, ServerLog } from '../../app/types'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import Input from '../components/util/Input'
import ViewHeader from '../components/util/ViewHeader'
import ViewWrapper from '../components/util/ViewWrapper'
import main from '../electron'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CurrentServerContext } from '../context/CurrentServerContext'
import { useSubscription } from '../hooks/useSubscription'

const Logs = () => {

    const params = useParams<{ serverid: string }>()

    const current = useContext(CurrentServerContext);

    const [cmd, setCmd] = useState('')
    const logs = useSubscription(main.current.logs)

    const logUl = useRef<HTMLUListElement | null>(null)

    useEffect(() => {
        if(logUl.current) logUl.current.scrollTop = logUl.current.scrollHeight;
    },[logs])

    const sendCommand = () => {
        main.current.command(cmd);
        setCmd('');
    }

    return (
        <ViewWrapper className="flex flex-col h-screen">
            <ViewHeader title="Console" />
            {current ?
                <ul className="flex-grow overflow-auto" ref={logUl}>
                    {logs && logs.map(log => (
                        <li key={log.id} className="font-mono text-sm">
                            <FontAwesomeIcon icon="chevron-right" />
                            [<span className="text-green-600">{log.time}</span>]&nbsp;
                            [<span className="text-blue-500">{log.thread}</span>/<span className="text-yellow-400">{log.status}</span>]&nbsp;
                            {log.message}
                        </li>
                    ))}
                </ul>
            :
                <div className="flex-grow flex items-center justify-center relative">
                    <FontAwesomeIcon icon="power-off" size="6x" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20" />
                    <h3 className="text-2xl font-semibold">Server Offline</h3>
                </div>
            }
            <form onSubmit={sendCommand}>
                <Input value={cmd} onChange={setCmd} className="font-mono mt-1" disabled={!current} />
            </form>
        </ViewWrapper>
    )
}

export default Logs
