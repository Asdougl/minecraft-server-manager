import React from 'react'

interface Props {
    value: boolean;
    onChange: (value: boolean) => void;
}

const Toggle = ({ value, onChange }: Props) => {
    return (
        <button className="w-10 h-4 relative focus:outline-none bg-gray-100 rounded-full focus:ring focus:ring-blue-200" onClick={() => onChange(!value)}>
            {/* Knobule */}
            <div className={`w-4 h-4 absolute top-0 transition-all rounded-full left-0 transform ${value ? 'bg-blue-400 translate-x-6' : 'bg-blue-200'}`}></div>
        </button>
    )
}

export default Toggle
