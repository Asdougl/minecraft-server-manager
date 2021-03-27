import React, { FunctionComponent } from 'react'

interface ButtonProps {
    onClick: () => void;
    disabled?: boolean;
    className?: string;
}

const Button: FunctionComponent<ButtonProps> = ({ onClick, disabled, className, children }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-3 py-2 bg-red-300 rounded text-center hover:opacity-75 cursor-pointer ${className}`}
        >
            {children}
        </button>
    )
}

export default Button
