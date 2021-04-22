import React from 'react'
import ViewHeader from '../components/util/ViewHeader'
import ViewWrapper from '../components/util/ViewWrapper'

interface Props {
    
}

const Settings = (props: Props) => {
    return (
        <ViewWrapper>
            <ViewHeader
                back="/"
                title="Settings"
            />
            <ul>
                <li className="grid grid-cols-2">
                    <label>Add to Startup</label>
                    <div>[Y/N]</div>
                </li>
                <li className="grid grid-cols-2">
                    <label>Auto Start Server</label>
                    <div>[None]</div>
                </li>
                <li className="grid grid-cols-2">
                    <label>Theme</label>
                    <div>[Light/Dark]</div>
                </li>
                <li className="grid grid-cols-2">
                    <label>Launch Minimised</label>
                    <div>[Y/N]</div>
                </li>
                <li className="grid grid-cols-2">
                    <label>Manage Auto Backups</label>
                    <div>[MANAGE]</div>
                </li>
                <li className="grid grid-cols-2">
                    <label>Check for Updates</label>
                    <div>[CHECK]</div>
                </li>
                <li>
                    [DONATE]
                </li>
            </ul>
        </ViewWrapper>
    )
}

export default Settings
