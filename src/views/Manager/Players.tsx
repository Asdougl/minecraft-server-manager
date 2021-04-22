import React from 'react'
import { MinecraftUser } from '../../../app/types'

interface Props {
    players: MinecraftUser[];
}

const Players = ({ players }: Props) => {
    return (
        <div>
            <ul>
                {players.length ? 
                    players.map(player => <li key={player.uuid}>{player.name}</li>)
                : <li>Nobody is Online :(</li>}
            </ul>
        </div>
    )
}

export default Players
