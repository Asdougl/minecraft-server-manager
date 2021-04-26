import React, { useEffect, useState } from 'react'
import { HashRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import TitleBar from './components/TitleBar'
import { CurrentServerContext } from './context/CurrentServerContext'
import main from './electron'
import Dashboard from './views/Dashboard'
import Settings from './views/Settings'
import Logs from './views/Logs'
import Setup from './views/Setup'
import Manager from './views/Manager'
import ServerStats from './components/ServerStats'
import { useSubscription } from './hooks/useSubscription'
import { useInteractive } from './hooks/useInterative'

const App = () => {

    const currentServer = useSubscription(main.servers.current)
    const [theme] = useInteractive(main.settings.theme)

    /*
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
    */

    return (
        <Router>
            <CurrentServerContext.Provider value={currentServer}>
                <div className={`${theme === 'dark' ? 'dark' : ''} flex flex-col overflow-hidden h-screen`}>
                    <TitleBar />
                    <div className="flex flex-col overflow-hidden h-full relative">
                        <Switch>
                            <Route exact path="/">
                                <Dashboard activeid={currentServer ? currentServer.id : ''} />
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
                            <Route path="/srvconsole/:serverid">
                                <Logs />
                            </Route>
                            <Route path="*" children={<Redirect to="/" />} />
                        </Switch>
                        {currentServer && currentServer.state === 'online' && <ServerStats server={currentServer} />}
                        <div id="modal-root"></div>
                    </div>
                </div>
            </CurrentServerContext.Provider>
        </Router>
    )
}

export default App
