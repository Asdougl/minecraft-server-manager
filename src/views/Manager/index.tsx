import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useState } from 'react'
import { CurrentServerContext } from '../../context/CurrentServerContext'
import electron from '../../electron'
import LogList from '../../components/LogList'
import ViewWrapper from '../../components/util/ViewWrapper'
import { useHistory, useParams } from 'react-router'
import ViewHeader from '../../components/util/ViewHeader'
import ManagerAction from '../../components/ManagerAction'
import { useSubscription } from '../../hooks/useSubscription'
import Properties from './Properties'
import Worlds from './Worlds'
import Blacklist from './Blacklist'
import Settings from './Settings'

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

    const current = useContext(CurrentServerContext)
    const params = useParams<{ serverid: string }>();
    const history = useHistory();

    const [showLogs, setShowLogs] = useState(false)
    const server = useSubscription(electron.servers.get(params.serverid), { onNull: () => history.push('/') });
    const loading = useSubscription(electron.current.loading)

    const onPropertySave = (label: string, value: string) => {
        electron.servers.setProperty({ id: params.serverid, property: label }, value)
    }

    let view: JSX.Element;
    if(!server) {
        // Some Loading Message
        view = <>
            <ViewHeader title="Manage Server" back="/" />
            <div className="h-24 flex justify-center items-center gap-2">
                <FontAwesomeIcon icon={['fad', 'spinner-third']} spin />
                Fetching Server
            </div>
        </>

    } else {
        // Server is Found
        view = <>   
            <ViewHeader title="Manage" back="/">
                <span className={`h-6 px-3 rounded-full flex gap-1 items-center ${server.state === 'online' ? 'bg-green-300 text-green-700' : 'bg-red-300 text-red-700'} text-base`}>
                    <FontAwesomeIcon icon={server.state === 'online' ? 'check' : 'times'} />
                    <div className="">{server.state === 'online' ? 'Online' : 'Offline'}</div>
                </span>
            </ViewHeader>
            {server.state === 'loading' ? <>
                {/* Server is Starting Up */}
                <h3 className="text-lg flex justify-center h-48 flex-col items-center gap-2">
                    <FontAwesomeIcon className="text-blue-500 text-4xl" icon={['fad', 'spinner-third']} spin fixedWidth size="sm" />

                    <div className="font-semibold text-blue-500">
                        Starting {server.name}
                    </div>
                </h3>
                <div className="w-full px-6 flex flex-col gap-1">
                    <div className="flex justify-between px-1">
                        <span>{loading ? (loading.state === 'world' && loading.details && loading.details.dimension ? `Loading ${loading.details.dimension}` : loading.state) : 'Loading'}</span>
                        {loading && loading.details && loading.details.progress && <div className="">{loading.details.progress}%</div>}
                    </div>
                    <div className="w-full h-4 py-2 px-4 bg-gray-100 rounded-full relative">
                        <div className="absolute top-0 left-0 bg-blue-600 h-full transition-all rounded-full" style={{ width: `${loading && loading.details && loading.details.progress ? loading.details.progress : 0 }%` }}></div>
                    </div>
                </div>
                
            </> : <>
                {/* Server is online or offline */}
                <h3 className="text-lg font-semibold">{server.name}</h3>
                    <ul className="flex flex-col gap-2 relative">
                        <ManagerAction 
                            title={server.state === 'online' ? 'Stop' : 'Start'}
                            icon="power-off"
                            action={() => server.state === 'online'  ? electron.current.stop() : electron.current.start(server.id)}
                            disabled={!!current && server.id !== current.id}
                            color={server.state === 'online' ? 'red' : 'green'}
                        />
                        {server.state === 'online' && 
                            <ManagerAction 
                                title="Restart"
                                icon="undo-alt"
                                color="orange"
                                action={() => electron.current.restart()}
                            />
                        }
                        <hr/>
                        <ManagerAction
                            title="Worlds"
                            icon="globe-stand"
                        >
                            <Worlds 
                                worlds={server.worlds} 
                                current={typeof server.properties['level-name'] === 'string' ? server.properties['level-name'] : ''} 
                                onClick={(worldname) => electron.servers.setProperty({ id: server.id, property: 'level-name' }, worldname)}
                                disabled={server.state === 'online'}
                            />
                        </ManagerAction>
                        <ManagerAction 
                            title="Players"
                            icon="users"
                        >
                            <ul>
                                <li>Asdougl</li>
                                <li>Plecc</li>
                            </ul>
                        </ManagerAction>
                        <hr/>
                        <ManagerAction
                            title="Player Management"
                            icon="users-cog"
                        >
                            <Blacklist 
                                type={server.properties['white-list'] === 'true' ? 'whitelist' : 'blacklist'}
                                blacklist={[]}
                                whitelist={[]}
                            />
                        </ManagerAction>
                        <ManagerAction
                            title="Gameplay Settings"
                            icon="cog"
                        >
                            <Settings 
                                gamemode={typeof server.properties['gamemode'] === 'string' ? server.properties['gamemode'] : 'normal'}
                                difficulty={typeof server.properties['difficulty'] === 'string' ? server.properties['difficulty'] : 'easy'}
                                command_blocks={server.properties['enable-command-block'] === "true"}
                                hardcore={server.properties['hardcore'] === "true"}
                            />
                        </ManagerAction>
                        <ManagerAction 
                            title="Advanced Properties"
                            icon="sliders-h"
                        >
                            <Properties properties={server.properties} onSave={onPropertySave} />
                        </ManagerAction>
                        <ManagerAction 
                            title="World Backups"
                            icon="file-archive"
                        >
                            Show a list of world backups with world names and a "backup now" button
                        </ManagerAction>
                        <ManagerAction 
                            title="Open Directory"
                            icon="folder-open"
                            action={() => electron.servers.directory(server.id)}
                        />
                        <ManagerAction 
                            title="Open Console"
                            icon="terminal"
                            // action={() => electron.actions.openLogWindow(currentServer.id)}
                            action={() => console.log("Open Log Window")}
                        />
                    </ul>
                    {showLogs && <>
                        <h3 className="text-lg font-semibold">Logs</h3>
                        <LogList />
                    </>}
            </>}
        </>

    }

    return (
        <ViewWrapper>
            {view}
        </ViewWrapper>
    )
}

export default Manager
