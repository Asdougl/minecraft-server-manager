import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FunctionComponent } from 'react'

interface ButtonProps {
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    icon?: IconProp;
}

const Button: FunctionComponent<ButtonProps> = ({ onClick, disabled, className, children, icon }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`px-3 py-2 bg-gray-100 rounded-lg flex ${!icon ? 'justify-center' : 'items-center gap-2'} hover:opacity-75 cursor-pointer ${className} focus:outline-none focus:ring focus:ring-blue-200 disabled:opacity-50 disabled:cursor-default`}
        >
            {icon ? <>
                <FontAwesomeIcon icon={icon} fixedWidth className="text-blue-600 fill-current" />
                <div className="flex-grow text-left">{children}</div>
            </> : children}
        </button>
    )
}

export default Button
