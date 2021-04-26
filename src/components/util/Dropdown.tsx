import React, { useRef } from 'react'

type Option = {
    name: string;
    value: string;
}

interface Props {
    options: Option[];
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
}

const Dropdown = ({ options, value, onChange, placeholder }: Props) => {

    const list = useRef<HTMLButtonElement | null>(null)

    const curr = options.find(opt => opt.value === value)

    const choose = (e: React.MouseEvent, option: Option) => {
        e.preventDefault();
        if(list.current) list.current.blur();
        onChange(option.value)
    }

    return (
        <button className="group relative w-full focus:outline-none focus:ring focus:ring-blue-400 rounded-lg hover:rounded-b-none bg-gray-200 hover:bg-blue-300 focus:rounded-b-none" ref={list}>
            {/* Opener */}
            <div>
                {curr ? curr.name : <span className="opacity-50">{placeholder}</span>}
            </div>
            <ul className="group-focus:visible invisible absolute top-full w-full h-auto bg-white z-10 shadow rounded-b-lg ring ring-blue-400">
                {options.map(opt => (
                    <li key={opt.value} onClick={e => choose(e, opt)} className="rounded-lg hover:bg-blue-300">
                        {opt.name}
                    </li>
                ))}
            </ul>
        </button>
    )
}

export default Dropdown
