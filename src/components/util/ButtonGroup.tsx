import React from 'react'

interface Option {
    name: string;
    value: string;
}

interface Props {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const ButtonGroup = ({ options, value, onChange, className }: Props) => {
    return (
        <div className={`flex ${className}`}>
            {options.map(opt => (
                <button 
                    key={opt.value}
                    className={`flex-1 first:rounded-l-lg last:rounded-r-lg ${value === opt.value ? 'bg-blue-300 hover:bg-blue-400' : 'bg-gray-200 hover:bg-blue-100'} focus:outline-none focus:ring focus:ring-blue-200`}
                    onClick={() => onChange(opt.value)}
                >
                    {opt.name}
                </button>
            ))}
        </div>
    )
}

export default ButtonGroup
