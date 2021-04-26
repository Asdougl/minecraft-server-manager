import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmAction {
    name: string;
    priority: boolean;
    onChosen: () => void;
}

interface Props {
    title: string;
    message: string | JSX.Element;
    actions: ConfirmAction[];
    onCancel: () => void;
}

const Confirmation = ({ title, message, actions, onCancel }: Props) => {

    const [el, setEl] = useState<HTMLElement>(document.createElement('div'))

    useEffect(() => {
        const modalRoot = document.getElementById('modal-root')
        if(modalRoot) setEl(modalRoot)

    },[])

    return createPortal(
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center z-30 bg-black bg-opacity-50">
            {/* Modal */}
            <div className="bg-white rounded-lg w-64 h-80 flex flex-col items-center p-4 shadow gap-4">
                <h3 className="text-xl font-semibold py-4 flex-grow">{title}</h3>
                <p className="text-xs flex-grow">{message}</p>
                <div className="flex flex-col w-full gap-1">
                    {actions.map(action => (
                        <button 
                            key={action.name}
                            onClick={action.onChosen}
                            className={`rounded w-full hover:bg-opacity-60 ${action.priority ? 'bg-blue-500 text-white' : 'bg-gray-200'} focus:outline-none focus:ring focus:ring-blue-200 py-1`}
                        >
                            {action.name}
                        </button>
                    ))}
                </div>
                <div className="w-full">
                    <button className="w-full rounded bg-gray-200 hover:bg-opacity-60 focus:outline-none focus:ring focus:ring-blue-200 py-1" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>,
        el
    )
}

export default Confirmation
