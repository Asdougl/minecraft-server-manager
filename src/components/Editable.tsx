import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FunctionComponent, useState } from 'react'

interface Props<T> {
    value: T;
    onSave: (value: T) => void;
}

interface WrapperProps {
    editing: boolean;
    toggleEditing: () => void;
}

const Wrapper: FunctionComponent<WrapperProps> = ({ children, editing, toggleEditing }) => {
    return (
        <div className={`w-full flex rounded overflow-visible border-2 ${editing ? 'border-blue-400' : 'border-gray-200'}`}>
            {children}
            <button 
                className="w-8 focus:outline-none rounded focus:bg-blue-100 opacity-50 hover:opacity-80"
                onClick={toggleEditing}
            >
                <FontAwesomeIcon className="" icon={editing ? 'save' : 'pencil'} />
            </button>
        </div>
    )
}

export const StringEditable = ({ value, onSave }: Props<string>) => {

    const [temp, setTemp] = useState(value)
    const [editing, setEditing] = useState(false)

    const onToggle = () => {
        if(temp !== value) onSave(temp);
        setEditing(curr => !curr)
    }

    return (
        <Wrapper editing={editing} toggleEditing={onToggle}>
            <input 
                type="text"
                className={`flex-grow w-0 bg-transparent px-2 rounded focus:outline-none focus:bg-blue-100`}
                value={temp} 
                onChange={e => setTemp(e.currentTarget.value)} 
                disabled={!editing}
            />
        </Wrapper>
    )
}

export const NumberEditable = ({ value, onSave }: Props<number>) => {

    const [temp, setTemp] = useState(`${value}`)
    const [editing, setEditing] = useState(false)

    const onToggle = () => {
        if(parseFloat(temp) !== value && !isNaN(parseFloat(temp))) onSave(+temp);
        setEditing(curr => !curr)
    }

    return (
        <Wrapper editing={editing} toggleEditing={onToggle}>
            <input 
                type="text"
                className={`flex-grow w-0 bg-transparent px-2 rounded focus:outline-none focus:bg-blue-100`}
                value={temp} 
                onChange={e => setTemp(e.currentTarget.value)} 
                disabled={!editing}
            />
        </Wrapper>
    )
}

export const BooleanEditable = ({ value, onSave }: Props<boolean>) => {

    const [temp, setTemp] = useState(value)
    const [editing, setEditing] = useState(false)

    const onToggle = () => {
        if(temp !== value) onSave(temp);
        setEditing(curr => !curr)
    }

    return (
        <Wrapper editing={editing} toggleEditing={onToggle}>
            <div className="grid grid-cols-2 flex-grow">
                <button 
                    className={`rounded focus:outline-none ${temp ? (editing ? 'bg-blue-300' : 'bg-gray-300') : ''}`}
                    onClick={() => setTemp(true)}
                >True</button>
                <button 
                    className={`rounded focus:outline-none ${!temp ? (editing ? 'bg-blue-300' : 'bg-gray-300') : ''}`}
                    onClick={() => setTemp(false)}
                >False</button>
            </div>
        </Wrapper>
    )
}