import { World } from '../../../app/types'
import React, { useState } from 'react'
import main from '../../electron'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface Props {
    worlds: World[],
    current: string,
    onClick: (worldname: string) => void;
    disabled: boolean;
}

const Worlds = ({ worlds, current, onClick, disabled }: Props) => {
    return (
        <ul className="flex flex-col gap-2">
            {worlds.map(world => (
                <li 
                    key={world.name} 
                    className={`rounded-full flex justify-between items-center gap-1 bg-blue-100 hover:bg-blue-200 cursor-pointer border border-transparent`}
                    onClick={() => !disabled && onClick(world.name)}
                >
                    <button className="px-2 py-1 flex-grow flex items-center gap-1 rounded-full focus:outline-none">
                        <FontAwesomeIcon className="text-blue-500" icon={['far', current === world.name ? 'check-circle' : 'circle']} fixedWidth />
                        {world.title}
                    </button>
                    <button className="text-blue-500 hover:text-blue-700 hover:bg-white hover:bg-opacity-25 px-2 py-1 rounded-full focus:outline-none">
                        <FontAwesomeIcon size="sm" fixedWidth icon="pencil" />
                    </button>
                </li>
            ))} 
            <li className="rounded-full flex justify-center items-center cursor-pointer hover:bg-blue-100 border border-blue-300 border-dashed text-blue-500 px-2 py-1 gap-1">
                <FontAwesomeIcon icon="plus" size="xs" />
                New World
            </li>
        </ul>
    )
}

export default Worlds
