import React, { FC } from 'react'
import electron from '../electron'
import { useInteractive } from '../hooks/useInterative'
import ViewHeader from '../components/util/ViewHeader'
import ViewWrapper from '../components/util/ViewWrapper'
import { useSubscription } from '../hooks/useSubscription'
import Toggle from '../components/util/Toggle'
import ButtonGroup from '../components/util/ButtonGroup'
import Dropdown from '../components/util/Dropdown'

interface SettingListItemProp {
    label?: string;
}

const Setting: FC<SettingListItemProp> = ({ children, label }) => {
    return (
        <li className={`${label ? 'grid grid-cols-2' : ''} border-b last:border-0 border-gray-200 p-2`}>
            {label && <label>{label}</label>}
            <div className="flex justify-center items-center">
                {children}
            </div>
        </li>
    )
}

interface Props {
    
}

const Settings = (props: Props) => {

    // OH BOY HERE WE GO...
    const [startup, setStartup] = useInteractive(electron.settings.startup, { onUpdate: val => console.log("LISTENED", val)})
    const [defaultSrv, setDefaultSrv] = useInteractive(electron.settings.defaultServer)
    const [theme, setTheme] = useInteractive(electron.settings.theme)
    const [minimised, setMinimised] = useInteractive(electron.settings.minimised)

    // Also...
    const servers = useSubscription(electron.servers.list)

    return (
        <ViewWrapper>
            <ViewHeader
                back="/"
                title="Settings"
            />
            <ul>
                <Setting label="Add to Startup">
                    <Toggle value={startup === true} onChange={setStartup} />
                </Setting>
                <Setting label="Auto Start Server">
                    <Dropdown 
                        options={[
                            { name: 'None', value: '' },
                            ...(servers ? servers.map(srv => ({ name: srv.title, value: srv.id })) : [])
                        ]}
                        value={defaultSrv || ''}
                        onChange={setDefaultSrv}
                        placeholder="Default Server"
                    />
                </Setting>
                <Setting label="Theme">
                    <ButtonGroup 
                        className="flex-1"
                        options={[{ name: 'Dark', value: 'dark' },{ name: 'Light', value: 'light' }]}
                        value={theme || ''}
                        onChange={val => setTheme(val === 'dark' ? 'dark' : 'light')}
                    />
                </Setting>
                <Setting label="Launch Minimised">
                    <Toggle 
                        value={minimised === true}
                        onChange={setMinimised}
                    />  
                </Setting>
                <Setting label="Manage Auto Backups">
                    [MANAGE]
                </Setting>
                <Setting label="Check for Updates">
                    [CHECK]
                </Setting>
                <Setting>
                    [DONATE]
                </Setting>
            </ul>
        </ViewWrapper>
    )
}

export default Settings
