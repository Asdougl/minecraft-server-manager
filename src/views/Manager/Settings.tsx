import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

interface Props {
    gamemode: string;
    difficulty: string;
    command_blocks: boolean;
    hardcore: boolean;
    setProp: (prop: string, value: string) => void;
    online: boolean;
}

interface SettingsButtonProps {
    active: boolean;
    label: string;
    onClick: () => void;
}

const SettingsButton = ({ active, label, onClick }: SettingsButtonProps) => {
    return (
        <button 
            onClick={onClick} 
            className={`flex-1 rounded-lg hover:opacity-75 transition-colors ${active ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500'} focus:outline-none`}
        >
            {label}
        </button>
    )
}

const Settings = ({ gamemode, difficulty, command_blocks, hardcore, setProp, online }: Props) => {
    return (
        <div className="flex flex-col">
            {online &&
            <div className="pb-2">
                <div className="rounded-full flex items-center gap-1 bg-yellow-500 bg-opacity-25 text-yellow-700 border border-transparent px-2 py-1">
                    <FontAwesomeIcon icon="exclamation-circle" fixedWidth />
                    Any Changes will require server restart
                </div>
            </div>}
            <div className="pb-2">
                <h4 className="text-lg font-bold">Gamemode</h4>
                <div className="flex gap-1 py-2">
                    <SettingsButton 
                        active={gamemode === 'survival'} 
                        label="Survival" 
                        onClick={() => setProp('gamemode', 'survival')}
                    />
                    <SettingsButton 
                        active={gamemode === 'creative'} 
                        label="Creative" 
                        onClick={() => setProp('gamemode', 'creative')}
                    />
                    <SettingsButton 
                        active={gamemode === 'adventure'} 
                        label="Adventure" 
                        onClick={() => setProp('gamemode', 'adventure')}
                    />
                    <SettingsButton 
                        active={gamemode === 'spectator'} 
                        label="Spectator" 
                        onClick={() => setProp('gamemode', 'spectator')}
                    />
                </div>
            </div>
            <div className="pb-2">
                <h4 className="text-lg font-bold">Difficulty</h4>
                <div className="flex gap-1 py-2">
                    <SettingsButton 
                        active={difficulty === 'peaceful'}
                        label="Peaceful"
                        onClick={() => setProp('difficulty', 'peaceful')}
                    />
                    <SettingsButton 
                        active={difficulty === 'easy'}
                        label="Easy"
                        onClick={() => setProp('difficulty', 'easy')}
                    />
                    <SettingsButton 
                        active={difficulty === 'normal'}
                        label="Normal"
                        onClick={() => setProp('difficulty', 'normal')}
                    />
                    <SettingsButton 
                        active={difficulty === 'hard'}
                        label="Hard"
                        onClick={() => setProp('difficulty', 'hard')}
                    />
                </div>
            </div>
            <div className="pb-2">
                <h4 className="text-lg font-bold">Command Blocks</h4>
                <div className="flex gap-1 py-2">
                    <SettingsButton 
                        active={command_blocks}
                        label="Enabled"
                        onClick={() => setProp('enable-command-block', 'true')}
                    />
                    <SettingsButton 
                        active={!command_blocks}
                        label="Disabled"
                        onClick={() => setProp('enable-command-block', 'false')}
                    />
                </div>
            </div>
            <div className="pb-2">
                <h4 className="text-lg font-bold">Hardcore</h4>
                <div className="flex gap-1 py-2">
                    <SettingsButton 
                        active={hardcore}
                        label="Enabled"
                        onClick={() => setProp('hardcore', 'true')}
                    />
                    <SettingsButton 
                        active={!hardcore}
                        label="Disabled"
                        onClick={() => setProp('hardcore', 'false')}
                    />
                </div>
            </div>
        </div>
    )
}

export default Settings
