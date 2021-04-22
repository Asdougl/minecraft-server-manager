import { World } from '../../../app/types'
import React, { useState } from 'react'
import main from '../../electron'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface Props {
    worlds: World[],
    current: string,
    onClick: (worldname: string) => void;
    onCreate: (worldname: string) => void;
    online: boolean;
}

const Worlds = ({ worlds, current, onClick, onCreate, online }: Props) => {

    const [createNew, setCreateNew] = useState(false)
    const [newName, setNewName] = useState('')

    const filterName = (value: string) => {
        setNewName(value.replace(/[^A-Za-z0-9-_ ']/g, ''))
    }

    const createDone = (create?: boolean) => {
        if(create) onCreate(newName);
        setCreateNew(false);
        setNewName('');
    }

    return (
        <ul className="flex flex-col gap-2">
            {online && 
                <li className="rounded-full flex items-center gap-1 bg-yellow-500 bg-opacity-25 text-yellow-700 border border-transparent px-2 py-1">
                    <FontAwesomeIcon icon="exclamation-circle" fixedWidth />
                    Any Changes will require server restart
                </li>
            }
            {worlds.map(world => (
                <li 
                    key={world.name} 
                    className={`rounded-full flex justify-between items-center gap-1 bg-blue-100 hover:bg-blue-200 cursor-pointer border border-transparent`}
                >
                    <button 
                        className="px-2 py-1 flex-grow flex items-center gap-1 rounded-full focus:outline-none disabled:opacity-75 disabled:cursor-default"
                        onClick={() => onClick(world.name)}
                    >
                        <FontAwesomeIcon className="text-blue-500" icon={['far', current === world.name ? 'check-circle' : 'circle']} fixedWidth />
                        {world.title}
                    </button>
                    <button className="text-blue-500 hover:text-blue-700 hover:bg-white hover:bg-opacity-25 px-2 py-1 rounded-full focus:outline-none">
                        <FontAwesomeIcon size="sm" fixedWidth icon="pencil" />
                    </button>
                </li>
            ))} 
            <li 
                className={`rounded-full flex justify-center items-center  border border-blue-300 border-dashed text-blue-500 px-2 py-1 gap-1 focus-within:bg-blue-200 ${!createNew ? 'hover:bg-blue-100' : '' }`}
            >
                { !createNew ? <button onClick={() => setCreateNew(true)} className="flex-grow focus:outline-none flex justify-center items-center cursor-pointer gap-1">
                    <FontAwesomeIcon icon="plus" size="xs" />
                    New World
                </button> : <>
                    <input className="flex-grow bg-transparent focus:outline-none border-b border-blue-300" type="text" value={newName} onChange={e => filterName(e.currentTarget.value)} />
                    <button
                        className="rounded-lg hover:bg-blue-300 px-1 focus:outline-none"
                        onClick={() => createDone(true)}
                    ><FontAwesomeIcon icon="check" fixedWidth /></button>
                    <button
                        className="rounded-lg hover:bg-blue-300 px-1 focus:outline-none"    
                        onClick={() => createDone(false)}
                    ><FontAwesomeIcon icon="times" fixedWidth /></button>
                </>}
            </li>
        </ul>
    )
}

export default Worlds
