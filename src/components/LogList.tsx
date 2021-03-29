import { Log } from '../../app/logs'
import React, { useEffect, useState } from 'react'
import main from '../electron'

interface Props {
}

const LogList = (props: Props) => {

    const [pending, setPending] = useState(true);
    const [logs, setLogs] = useState<Log[]>([])

    useEffect(() => {

        main.actions.getLogs().then(logs => {
            setLogs(logs)
        }).finally(() => setPending(false))

        const onLog = (evt: any, log: Log) => {
            setLogs(logs => [...logs, log])
        }

        main.bind.logged(onLog)

        return () => {
            main.unbind.logged(onLog)
        }

    },[])

    return (
        <ul>
            {logs.length ?
                logs.map(log => <li key={log.id} className="font-mono">[{log.time}] [{log.thread}/{log.status}]: {log.message}</li>)
            :
                <li>No Logs Available</li>
            }
        </ul>
    )
}

export default LogList
