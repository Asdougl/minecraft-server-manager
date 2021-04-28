import { World } from '../../../app/types'
import React, { useEffect, useRef, useState } from 'react'
import main from '../../electron'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface WorldItemProps {
    world: World;
    current: string;
    onClick: () => void;
    onRename: (title: string) => void;
}

const WorldItem = ({ world, current, onClick, onRename }: WorldItemProps) => {

    const [renaming, setRenaming] = useState(false);
    const [title, setTitle] = useState(world.title)

    const input = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        console.log("Hai")
        if(input.current) input.current.focus();

    },[renaming])

    const reset = () => {
        setTitle(world.title);
        setRenaming(false);
    }
    
    const change = () => {
        onRename(title);
        setRenaming(false);
    }

    const editInput = (e: React.KeyboardEvent) => {
        if(e.key === 'Escape') reset();
        else if(e.key === 'Enter') change();
    }

    return (
        <li 
            className={`rounded-full flex justify-between items-center gap-1 bg-blue-100 hover:bg-blue-200 cursor-pointer border border-transparent`}
        >
            { !renaming ? (
                <button 
                    className="px-2 py-1 flex-grow flex items-center gap-1 rounded-full focus:outline-none disabled:opacity-75 disabled:cursor-default"
                    onClick={onClick}
                >
                    <FontAwesomeIcon className="text-blue-500" icon={['far', current === world.name ? 'check-circle' : 'circle']} fixedWidth />
                    {world.title}
                </button>
            ) : (
                <div className="px-2 py-1 flex-grow flex items-center gap-1 rounded-full">
                    <FontAwesomeIcon className="text-blue-500" icon={['far', current === world.name ? 'check-circle' : 'circle']} fixedWidth />
                    <input 
                        type="text"
                        value={title}
                        ref={input}
                        onChange={e => setTitle(e.currentTarget.value)}
                        onKeyDown={editInput}
                        onBlur={reset}
                        className="w-auto flex-grow bg-transparent px-2 rounded border border-blue-400 focus:outline-none focus:bg-blue-100 py-0"
                    />
                </div>
            )}
            
            <button className="text-blue-500 hover:text-blue-700 hover:bg-white hover:bg-opacity-25 px-2 py-1 rounded-full focus:outline-none" onClick={() => setRenaming(!renaming)}>
                <FontAwesomeIcon size="sm" fixedWidth icon="pencil" />
            </button>
        </li>
    )
}

interface Props {
    worlds: World[],
    current: string,
    onClick: (worldname: string) => void;
    onCreate: (worldname: string) => void;
    onRename: (worldname: string, title: string) => void;
    online: boolean;
}

const Worlds = ({ worlds, current, onClick, onCreate, onRename, online }: Props) => {

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
                <WorldItem 
                    key={world.name}
                    world={world} 
                    current={current} 
                    onClick={() => onClick(world.name)} 
                    onRename={title => onRename(world.name, title)}
                />
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
