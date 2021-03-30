import React, { useEffect, useState } from 'react'
import { HashRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
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
            console.log("Server Status: " + status)
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
        <Router>
            <ServerStatusContext.Provider value={serverStatus}>
                <div className="flex flex-col overflow-hidden h-screen">
                    <TitleBar />
                    <Switch>
                        <Route exact path="/">
                            {serverStatus === '' ? <Initializing /> : <Redirect to="/dashboard" />}
                        </Route>
                        <Route path="/dashboard">
                            {serverStatus === 'online' || serverStatus === 'offline' ? <Dashboard /> : <Redirect to="/setup" />}
                        </Route>
                        <Route path="/settings">
                            {serverStatus === 'online' || serverStatus === 'offline' ? <Settings /> : <Redirect to="/setup" />}
                        </Route>
                        <Route path="/setup">
                            {serverStatus !== 'online' && serverStatus !== 'offline' ? <Setup /> : <Redirect to="/dashboard" />}
                        </Route>
                    </Switch>
                </div>
            </ServerStatusContext.Provider>
        </Router>
    )
}

export default App
