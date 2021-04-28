import React, { FC, useEffect, useRef, useState } from 'react'

interface Props {
    editing: boolean;
    setEditing: (value: boolean) => void;
    current: string;
    onChange: (value: string) => void;
    className: string;
}

const FocusInput: FC<Props> = ({ children, editing, setEditing, current, onChange, className }) => {

    const [value, setValue] = useState(current)
    
    const input = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if(input.current) input.current.focus();
    },[editing])

    useEffect(() => {
        setValue(current)
    },[current])

    const reset = () => {
        setValue(current)
        setEditing(false)
    }

    const change = () => {
        onChange(value);
        setEditing(false)
    }

    const editInput = (e: React.KeyboardEvent) => {
        if(e.key === 'Escape') reset();
        else if(e.key === 'Enter') change();
    }

    return editing ? (
        <input 
            type="text"
            value={value}
            onChange={e => setValue(e.currentTarget.value)}
            ref={input}
            onKeyDown={editInput}
            onBlur={reset}
            className={className}
        />
    ) : <>{children}</>;
}

export default FocusInput
