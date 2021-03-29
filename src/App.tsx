import React, { useEffect, useState } from 'react'
import { Route, Switch, useHistory } from 'react-router-dom'
import TitleBar from './components/TitleBar'
import { ServerStatusContext } from './context/ServerStatus'
import electronapi from './electron'
import Dashboard from './views/Dashboard'
import Settings from './views/Settings'
import Setup from './views/Setup'
import { ServerStatus } from '../app/RendererAPI'
import Initializing from './views/Initializing'

const App = () => {

    const [serverStatus, setServerStatus] = useState<ServerStatus | ''>('');

    const history = useHistory()

    useEffect(() => {

        const onClose = () => {
            console.log("Server Closed");
            setServerStatus('offline');
        }

        const onStart = (evt: any, time?: string) => {
            console.log(`Server Up${time ? ` ${time}s` : ''}`)
            setServerStatus('online')
        }

        electronapi.actions.getStatus().then(status => {
            if(status !== 'online' && status !== 'offline') {
                history.push('/setup')
            } else {
                history.push('/dashboard')
            }
            setServerStatus(status);
        })

        electronapi.bind.started(onStart)
        electronapi.bind.close(onClose)

        return () => {
            electronapi.unbind.close(onClose)
            electronapi.unbind.started(onStart)
        }

    },[])

    return (
        <ServerStatusContext.Provider value={serverStatus}>
            <div className="flex flex-col overflow-hidden h-screen">
                <TitleBar />
                <Switch>
                    <Route path="/">
                        <Initializing />
                    </Route>
                    <Route path="/dashboard">
                        <Dashboard />
                    </Route>
                    <Route path="/settings">
                        <Settings />
                    </Route>
                    <Route path="/setup">
                        <Setup />
                    </Route>
                </Switch>
            </div>
        </ServerStatusContext.Provider>
    )
}

export default App
