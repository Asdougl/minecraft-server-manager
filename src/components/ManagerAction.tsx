import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FunctionComponent, useState } from 'react'
import Modal from './Modal';
import Button from './util/Button'

type ColorOptions = 'blue' | 'green' | 'red' | 'orange'

interface Props {
    title: string;
    icon: IconProp;
    action?: () => void;
    disabled?: boolean;
    color?: ColorOptions
    modal?: string;
}

const getColor = (color?: ColorOptions) => {
    switch(color) {
        case 'green': return ['text-green-500', 'hover:bg-green-200'];
        case 'orange': return ['text-yellow-500', 'hover:bg-yellow-200'];
        case 'red': return ['text-red-500','hover:bg-red-200'];
        default: return ['text-blue-500', 'hover:bg-blue-200'];
    }
}

const ManagerAction: FunctionComponent<Props> = ({ children, title, icon, action, disabled, color, modal }) => {

    const [show, setShow] = useState(false);

    const toggleShow = () => {
        setShow(!show);
    }

    const [textColor, hoverColor] = getColor(color);

    return (
        <li className={`w-full flex flex-col bg-gray-100 rounded-lg`}>
            <button
                className={`w-full flex px-3 py-2 items-center gap-2 focus:outline-none rounded-lg disabled:opacity-40 disabled:cursor-default ${action ? 'focus:ring focus:ring-blue-200' : ''} ${hoverColor} hover:bg-opacity-25`}
                onClick={action || toggleShow}
                disabled={disabled}
            >
                <FontAwesomeIcon icon={icon} className={textColor} fixedWidth />
                <span className="flex-grow text-left">{title}</span>
                {!action && !modal && <FontAwesomeIcon icon="chevron-down" className={`text-blue-500 transform transition-transform ${show ? 'rotate-180' : 'rotate-0'}`} fixedWidth />}
            </button>
            {!modal ? <>
                {show && <hr className="mx-2" />}
                <div className={`${show ? 'h-auto max-h-64' : 'h-0'} overflow-auto`}>
                    {!action && (
                        <div className={`${show ? 'overflow-y-auto' : 'h-0'} p-2`}>
                            {children}
                        </div>
                    )}
                </div>
            </> : (show && <Modal title={modal} onClose={toggleShow}>{children}</Modal>)}
        </li>
    )
}

export default ManagerAction
