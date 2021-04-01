import React, { useEffect, useState } from 'react'
import { HashRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import TitleBar from './components/TitleBar'
import { ServerStatusContext } from './context/ServerStatus'
import electronapi from './electron'
import Dashboard from './views/Dashboard'
import Settings from './views/Settings'
import Setup from './views/Setup'
import { ServerData, ServerStatus } from '../app/RendererAPI'
import Manager from './views/Manager'
import ServerStats from './components/ServerStats'

const App = () => {

    const [serverStatus, setServerStatus] = useState<ServerStatus>('offline');
    const [activeServer, setActiveServer] = useState<ServerData | null>(null);

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
            setServerStatus(status);
        })

        electronapi.bind.started(onStart)
        electronapi.bind.close(onClose)

        return () => {
            electronapi.unbind.close(onClose)
            electronapi.unbind.started(onStart)
        }

    },[])

    useEffect(() => {
        console.log("SERVER STATUS: " + serverStatus)
        if(serverStatus === 'online') {
            electronapi.actions.getCurrent().then(srv => setActiveServer(srv || null))
        } else {
            setActiveServer(null)
        }
    },[serverStatus])

    const checkStatus = () => {
        electronapi.actions.getStatus().then(status => setServerStatus(status))
    }

    return (
        <Router>
            <ServerStatusContext.Provider value={[serverStatus, checkStatus]}>
                <div className="flex flex-col overflow-hidden h-screen">
                    <TitleBar />
                    <Switch>
                        <Route exact path="/">
                            <Dashboard activeid={activeServer ? activeServer.id : null} />
                        </Route>
                        <Route path="/manage/:serverid">
                            <Manager />
                        </Route>
                        <Route path="/settings">
                            <Settings />
                        </Route>
                        <Route path="/setup">
                            <Setup />
                        </Route>
                    </Switch>
                    {activeServer && <ServerStats server={activeServer} />}
                </div>
            </ServerStatusContext.Provider>
        </Router>
    )
}

export default App
