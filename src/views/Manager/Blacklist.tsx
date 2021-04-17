import { MinecraftUser } from '../../../app/types'
import React from 'react'

interface Props {
    type: 'blacklist' | 'whitelist';
    blacklist: MinecraftUser[];
    whitelist: MinecraftUser[];
}

const Blacklist = ({ type, blacklist, whitelist }: Props) => {

    const list = type === 'blacklist' ? blacklist : whitelist

    return (
        <div>
            Use <button>Blacklist</button> or <button>Whitelist</button>
            <ul>
                {list.map(player => <li key={player.uuid}>{player.name}</li>)}
            </ul>
        </div>
    )
}

export default Blacklist
