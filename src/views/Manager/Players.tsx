import React from 'react'
import { MinecraftUser } from '../../../app/types'

interface Props {
    players: MinecraftUser[];
    online: string[];
}

const Players = ({ players, online }: Props) => {
    return (
        <div>
            <ul>
                {players.map(player => <li key={player.uuid}>{player.name} {online.includes(player.uuid) && 'Online'}</li>)}
            </ul>
        </div>
    )
}

export default Players
