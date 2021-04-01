import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Log } from '../../app/logs'
import { IpcRendererEvent } from 'electron'
import React, { useContext, useEffect, useState } from 'react'
import Button from '../components/util/Button'
import { ServerStatusContext } from '../context/ServerStatus'
import electron from '../electron'
import LogList from '../components/LogList'
import ViewWrapper from '../components/util/ViewWrapper'
import { ServerData } from '../../app/RendererAPI'
import { useHistory, useParams } from 'react-router'
import { Link } from 'react-router-dom'
import ViewHeader from '../components/util/ViewHeader'

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

const Manager = (props: Props) => {

    const [serverStatus] = useContext(ServerStatusContext)
    const params = useParams<{ serverid: string }>();
    const history = useHistory();

    const [pending, setPending] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Initializing');
    const [showLogs, setShowLogs] = useState(false)
    const [currentServer, setCurrentServer] = useState<ServerData | null>(null);
    const [onlineServer, setOnlineServer] = useState<ServerData | null>(null);

    useEffect(() => {
        electron.actions.getServer(params.serverid).then(srv => {
            if(!srv) history.push('/');
            else setCurrentServer(srv);
            console.log(srv)
        })
    },[params])

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

        electron.actions.getCurrent().then(current => current && setOnlineServer(current))

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
            {!currentServer ? <>
                <ViewHeader title="Manage Server" back="/" />
                <div className="h-24 flex justify-center items-center gap-2">
                    <FontAwesomeIcon icon={['fad', 'spinner-third']} spin />
                    Fetching Server
                </div>
            </> : <>
                <ViewHeader title="Manage" back="/">
                    <span className={`h-6 px-3 rounded-full flex gap-1 items-center ${serverStatus === 'online' && onlineServer && onlineServer.id === currentServer.id ? 'bg-green-300 text-green-700' : 'bg-red-300 text-red-700'} text-base`}>
                        <FontAwesomeIcon icon={serverStatus === 'online' ? 'check' : 'times'} />
                        <div className="">{serverStatus === 'online' && onlineServer && onlineServer.id === currentServer.id     ? 'Online' : 'Offline'}</div>
                    </span>
                </ViewHeader>
                {pending ? 
                    <>
                        <h3 className="text-lg flex justify-between">
                            <div className="font-semibold flex items-center gap-1">
                                <FontAwesomeIcon className="text-blue-500" icon={['fad', 'spinner-third']} spin fixedWidth size="sm" />
                                {status}
                            </div>
                            {progress > 0 && <div className="">{progress}%</div>}
                        </h3>
                        <div className="w-full h-4 py-2 bg-gray-100 rounded-full relative">
                            <div className="absolute top-0 left-0 bg-blue-600 h-full transition-all rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </>
                :   <>
                        <h3 className="text-lg font-semibold">{currentServer.name}</h3>
                        <ul className="flex flex-col gap-2">
                            <li className="w-full">
                                {(!onlineServer || currentServer.id === onlineServer.id) && 
                                    <Button 
                                        onClick={() => serverStatus === 'online'  ? electron.actions.stopServer() : electron.actions.startServer(currentServer.id)}
                                        className="w-full"
                                        icon="power-off"
                                    >
                                        {serverStatus === 'online' ? 'Stop' : 'Start'}
                                    </Button>
                                }
                                
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
                        </ul>
                        {showLogs && <>
                            <h3 className="text-lg font-semibold">Logs</h3>
                            <LogList />
                        </>}
                    </>
                }
            </>}
            
            {/* Pending */}
            
        </ViewWrapper>
    )
}

export default Manager
