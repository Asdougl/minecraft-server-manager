import { ServerLog } from '../../app/types'
import React, { useEffect, useState } from 'react'
import main from '../electron'
import { useSubscription } from '../hooks/useSubscription';

interface Props {
}

const LogList = (props: Props) => {

    const logs = useSubscription(main.current.logs)

    return (
        <ul>
            {logs && logs.length ?
                logs.map(log => <li key={log.id} className="font-mono">[{log.time}] [{log.thread}/{log.status}]: {log.message}</li>)
            :
                <li>No Logs Available</li>
            }
        </ul>
    )
}

export default LogList
