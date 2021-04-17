import React from 'react'

interface Props {
    gamemode: string;
    difficulty: string;
    command_blocks: boolean;
    hardcore: boolean;
}

const Settings = ({ gamemode, difficulty, command_blocks, hardcore }: Props) => {
    return (
        <div className="flex flex-col">
            <div>
                <h4>Gamemode</h4>
                <div className="flex">
                    <button>Survival</button>
                    <button>Creative</button>
                    <button>Adventure</button>
                    <button>Spectator</button>
                </div>
            </div>
            <div>
                <h4>Difficulty</h4>
                <div className="flex">
                    <button>Peaceful</button>
                    <button>Easy</button>
                    <button>Normal</button>
                    <button>Hard</button>
                </div>
            </div>
            <div>
                <h4>Command Blocks</h4>
                <div className="flex">
                    <button>Enabled</button>
                    <button>Disabled</button>
                </div>
            </div>
            <div>
                <h4>Hardcore</h4>
                <div className="flex">
                    <button>Enabled</button>
                    <button>Disabled</button>
                </div>
            </div>
        </div>
    )
}

export default Settings
