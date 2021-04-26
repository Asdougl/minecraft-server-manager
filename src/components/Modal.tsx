import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
    title: string;
    height?: 'full' | 'fit';
    onClose: () => void;
}

const Modal: FC<Props> = ({ children, title, onClose, height }) => {

    const [el, setEl] = useState<HTMLElement>(document.createElement('div'))

    useEffect(() => {
        const modalRoot = document.getElementById('modal-root')
        if(modalRoot) setEl(modalRoot)

    },[])

    return createPortal(
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-25 flex justify-center z-20 p-8">
            {/* Modal Window */}
            <div className={`bg-white w-full rounded-lg shadow-lg px-2 flex flex-col ${height === 'fit' ? 'my-auto' : ''}`}>
                <h3 className="font-semibold text-lg flex items-center justify-between border-b border-gray-200 py-2 px-2">
                    <div>{title}</div>
                    <button onClick={onClose} className="cursor-pointer rounded-full hover:bg-gray-100 focus:bg-gray-200 w-8 h-8 focus:outline-none focus:ring focus:ring-blue-200 flex items-center justify-center">
                        <FontAwesomeIcon icon="times" />
                    </button>
                </h3>
                <div className="flex-grow py-2 overflow-scroll pl-1">
                    {children}
                </div>
            </div>
        </div>,
        el
    )
}

export default Modal
