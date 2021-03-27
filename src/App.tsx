import React, { useEffect, useState } from 'react'
import { Route, BrowserRouter as Router, Switch, useHistory } from 'react-router-dom'
import TitleBar from './components/TitleBar'
import { ServerStatusContext } from './context/ServerStatus'
import electronapi from './electron'
import Dashboard from './views/Dashboard'
import Settings from './views/Settings'
import Setup from './views/Setup'

const App = () => {

    const [serverUp, setServerUp] = useState(false);

    useEffect(() => {

        const onClose = () => {
            setServerUp(false);
        }

        electronapi.bind.close(onClose)

        return () => {
            electronapi.unbind.close(onClose)
        }

    },[])

    return (
        <Router>
            <ServerStatusContext.Provider value={serverUp}>
                <TitleBar />
                <Switch>
                    <Route path="/">
                        <Dashboard />
                    </Route>
                    <Route path="/settings">
                        <Settings />
                    </Route>
                    <Route path="/setup">
                        <Setup />
                    </Route>
                </Switch>
            </ServerStatusContext.Provider>
        </Router>
    )
}

export default App
