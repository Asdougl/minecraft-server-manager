import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useEffect, useRef, useState } from 'react'
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
import Players from './Players'
import StatusLabel from '../../components/util/StatusLabel'
import Console from './Console'
import Backups from './Backups'
import Confirmation from '../../components/Confirmation'
import Advanced from './Advanced'
import FocusInput from '../../components/util/FocusInput'
import Button from '../../components/util/Button'

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
    const logs = useSubscription(electron.current.logs)
    const backups = useSubscription(electron.servers.backups(params.serverid))
    const players = useSubscription(electron.current.players)

    const [editingName, setEditingName] = useState(false)

    const onPropertySave = (label: string, value: string) => {
        electron.servers.setProperty({ id: params.serverid, property: label }, value)
    }

    const sendCommand = (cmd: string) => {
        if(server && server.current) {
            electron.current.command(cmd)
        }
    }

    const createBackup = (worldname: string) => {
        electron.servers.createBackup(params.serverid, worldname)
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
                <StatusLabel status={server.state} changes={server.changes} />
            </ViewHeader>
            {server.state === 'loading' ? <>
                {/* Server is Starting Up */}
                <h3 className="text-lg flex justify-center h-48 flex-col items-center gap-2">
                    <FontAwesomeIcon className="text-blue-500 text-4xl" icon={['fad', 'spinner-third']} spin fixedWidth size="sm" />

                    <div className="font-semibold text-blue-500">
                        Starting {server.title}
                    </div>
                </h3>
                <div className="w-full px-6 flex flex-col gap-1">
                    <div className="flex justify-between px-1">
                        <span>{loading ? (loading.state === 'world' && loading.details && loading.details.dimension ? `Loading ${dimName(loading.details.dimension)}` : loading.state) : 'Loading'}</span>
                        {loading && loading.details && loading.details.progress && <div className="">{loading.details.progress}%</div>}
                    </div>
                    <div className="w-full h-4 py-2 px-4 bg-gray-100 rounded-full relative">
                        <div className="absolute top-0 left-0 bg-blue-600 h-full transition-all rounded-full" style={{ width: `${loading && loading.details && loading.details.progress ? loading.details.progress : 0 }%` }}></div>
                    </div>
                </div>
                {loading && loading.state !== 'pending' && logs && logs.length && <div className="px-6 py-2 text-xs font-mono opacity-60">
                    {logs[logs.length - 1].message}
                </div>}
                <div className="flex-grow flex flex-col justify-end">
                    <Button onClick={() => electron.current.stop(true)}>Cancel</Button>
                </div>
                
            </> : <>
                {/* Server is online or offline */}
                <h3 className="mb-2 px-2 flex gap-2 items-center">
                    <FocusInput
                        editing={editingName}
                        setEditing={setEditingName}
                        current={server.title}
                        onChange={name => electron.servers.edit(server.id, 'title', name)}
                        className="focus:outline-none focus:ring focus:ring-blue-300 text-xl flex-grow rounded-lg font-semibold"
                    >
                        <div className="text-xl font-semibold">{server.title}</div>
                    </FocusInput>
                    <button className="opacity-10 hover:opacity-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center" onClick={() => setEditingName(!editingName)}>
                        <FontAwesomeIcon icon="pencil" size="xs" />
                    </button>
                </h3>
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
                            onCreate={worldname => electron.servers.addWorld(server.id, worldname)}
                            online={server.state === 'online'}
                            onRename={(worldname, title) => electron.servers.renameWorld(server.id, worldname, title)}
                        />
                    </ManagerAction>
                    <ManagerAction 
                        title="Players"
                        icon="users"
                        disabled={server.state !== 'online'}
                    >
                        <Players players={server.state === 'online' ? (players || []) : []} />
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
                            setProp={onPropertySave}
                            online={server.state === 'online'}
                        />
                    </ManagerAction>
                    <ManagerAction 
                        title="Advanced Properties"
                        icon="sliders-h"
                    >
                        <Properties 
                            properties={server.properties} 
                            onSave={onPropertySave} 
                            online={server.state === 'online'} 
                        />
                    </ManagerAction>
                    <ManagerAction 
                        title="World Backups"
                        icon="file-archive"
                    >
                        <Backups 
                            backups={backups || {}}
                            worlds={server.worlds}
                            online={server.state === 'online'}
                            createBackup={createBackup}
                            restoreBackup={(backupid, auto) => electron.servers.restoreBackup(server.id, backupid, auto)}
                            scheduleBackup={(worldname, cron) => electron.servers.scheduleBackup(server.id, worldname, cron)}
                        />
                    </ManagerAction>
                    <ManagerAction
                        title="Advanced"
                        icon="toolbox"
                        modal="Advanced"
                    >
                        <Advanced 
                            server={server}
                        />
                    </ManagerAction>
                    <ManagerAction 
                        title="Open Console"
                        icon="terminal"
                        disabled={server.state !== 'online'}
                        modal="Console"
                    >
                        <Console 
                            logs={logs} 
                            command={sendCommand} 
                        />
                    </ManagerAction>
                </ul>
                {showLogs && <>
                    <h3 className="text-lg font-semibold">Logs</h3>
                    <LogList />
                </>}
            </>}
        </>

    }

    return (
        <ViewWrapper className="flex flex-col">
            {view}
        </ViewWrapper>
    )
}

export default Manager
