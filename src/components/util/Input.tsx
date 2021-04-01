import React from 'react'

interface Props {
    value?: string | number;
    onChange?: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    maxLength?: number;
    error?: boolean;
}

const Input = ({ value, onChange, disabled, placeholder, maxLength, error }: Props) => {
    return (
        <input 
            value={value}
            type="text"
            className={`w-full px-2 rounded-lg border-2 ${!error ? 'border-gray-300' : 'border-red-500'} focus:outline-none focus:ring focus:ring-blue-400 bg-transparent`}
            disabled={disabled}
            onChange={onChange && (e => onChange(e.currentTarget.value))}
            placeholder={placeholder}
            maxLength={maxLength}
        />
    )
}

export default Input
