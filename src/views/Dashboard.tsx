import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Log } from '../../app/logs'
import { IpcRendererEvent } from 'electron'
import React, { useContext, useEffect, useState } from 'react'
import Button from '../components/util/Button'
import { ServerStatusContext } from '../context/ServerStatus'
import electron from '../electron'
import LogList from '../components/LogList'
import ViewWrapper from '../components/util/ViewWrapper'

const dimName = (dimension: string) => {
    if(dimension === 'minecraft:overworld') {
        return 'Overworld'
    }
    if(dimension === 'minecraft:the_nether') {
        return 'The Nether'
    }
    if(dimension === 'minecraft:the_end') {
        return 'The End'
    }
    return dimension
}

interface Props {
}

const Dashboard = (props: Props) => {

    const serverStatus = useContext(ServerStatusContext)

    const [pending, setPending] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Initializing');
    const [showLogs, setShowLogs] = useState(false)

    useEffect(() => {
        if(serverStatus === 'online') {
            setPending(false);
            setProgress(0);
            setStatus('Initializing');
        }
    },[serverStatus])

    useEffect(() => {

        const onPending = () => {
            setPending(true)
        }

        const onProgress = (evt: IpcRendererEvent, extra?: string) => {
            console.log(extra);
            setProgress(extra ? +extra : 0)
        }

        const onDimension = (evt: IpcRendererEvent, extra?: string) => {
            console.log(extra);
            setStatus(extra ? `Loading Dimension ${dimName(extra)}` : 'Loading...')
        }

        electron.bind.pending(onPending)
        electron.bind.progress(onProgress)
        electron.bind.dimension(onDimension)

        return () => {
            electron.unbind.pending(onPending)
            electron.unbind.progress(onProgress)
            electron.unbind.dimension(onDimension)
        }

    }, [])

    return (
        <ViewWrapper>
            <h1 className="text-4xl font-bold flex justify-between items-center mb-4">
                <span>Manage</span>
                <span className={`h-6 px-3 rounded-full flex gap-1 items-center ${serverStatus === 'online' ? 'bg-green-300 text-green-700' : 'bg-red-300 text-red-700'} text-base`}>
                    <FontAwesomeIcon icon={serverStatus === 'online' ? 'check' : 'times'} />
                    <div className="">{serverStatus === 'online' ? 'Online' : 'Offline'}</div>
                </span>
            </h1>
            {/* Pending */}
            {pending ? 
                <>
                    <h3 className="text-lg flex justify-between">
                        <div className="font-semibold">{status}</div>
                        {progress > 0 && <div className="">{progress}%</div>}
                    </h3>
                    <div className="w-full h-4 py-2 bg-gray-100 rounded-full relative">
                        <div className="absolute top-0 left-0 bg-blue-600 h-full transition-all rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </>
            :   <>
                    <h3 className="text-lg font-semibold">Actions</h3>
                    <ul className="flex flex-col gap-2">
                        <li className="w-full">
                            <Button 
                                onClick={() => serverStatus === 'online' ? electron.actions.stopServer() : electron.actions.startServer()}
                                className="w-full"
                                icon="power-off"
                            >
                                {serverStatus === 'online' ? 'Stop' : 'Start'}
                            </Button>
                        </li>
                        {serverStatus === 'online' && 
                            <li className="w-full">
                                <Button
                                    onClick={() => electron.actions.restartServer()}
                                    className="w-full"
                                    icon="undo-alt"
                                >
                                    Restart
                                </Button>
                            </li>
                        }
                        <li className="w-full">
                            <Button
                                onClick={() => console.log("Manage Players")}
                                className="w-full"
                                icon="users"
                            >
                                Manage Players
                            </Button>
                        </li>
                        <li className="w-full">
                            <Button
                                onClick={() => console.log("Manage Server Settings")}
                                className="w-full"
                                icon="sliders-h"
                            >
                                Manage Server Settings
                            </Button>
                        </li>
                        <li className="w-full">
                            <Button
                                onClick={() => electron.actions.openDirectory()}
                                className="w-full"
                                icon="folder-open"
                            >Open Directory</Button>
                        </li>
                        <li className="w-full">
                            <Button
                                onClick={() => setShowLogs(curr => !curr)}
                                className="w-full"
                                icon="terminal"
                            >{showLogs ? 'Hide' : 'Show'} Logs</Button>
                        </li>
                    </ul>
                    {showLogs && <>
                        <h3 className="text-lg font-semibold">Logs</h3>
                        <LogList />
                    </>}
                </>
            }
        </ViewWrapper>
    )
}

export default Dashboard
