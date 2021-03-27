import React, { useContext } from 'react'
import Button from '../components/util/Button'
import { ServerStatusContext } from '../context/ServerStatus'
import electron from '../electron'

interface Props {
}

const Dashboard = (props: Props) => {

    const serverUp = useContext(ServerStatusContext)

    return (
        <div>
            <h1>Dashboard</h1>
            <div>Server: {serverUp ? 'UP' : 'DOWN'}</div>
            {/* Actions */}
            <ul>
                <li>
                    <Button onClick={() => electron.actions.stopServer()}>Stop Server</Button>
                </li>
                <li>
                    <Button onClick={() => electron.actions.startServer()}>Start Server</Button>
                </li>
                <li>
                    <Button
                        onClick={() => electron.actions.openDirectory()}
                    >Open Directory</Button>
                </li>
                <li>
                    <Button
                        onClick={() => electron.actions.eulaAgree(true)}
                    >
                        Agree to EULA
                    </Button>
                </li>
            </ul>
            
            
        </div>
    )
}

export default Dashboard
