import React, { FC, useRef, useState } from 'react'

interface Props {
    onDone: () => void;
    className?: string;
}

const AreYouSure: FC<Props> = ({ children, onDone, className }) => {

    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

    const clear = () => {
        if(timer) clearTimeout(timer);
        setTimer(null);
    }

    const start = () => {
        if(timer) clearTimeout(timer);
        setTimer(setTimeout(() => {
            clear();
            onDone();
        }, 2500))
    }

    return (
        <button
            onMouseDown={start}
            onTouchStart={start}
            onMouseUp={clear}
            onTouchEnd={clear}
            className={`relative px-2 py-1 bg-gray-100 rounded-lg hover:bg-opacity-75 cursor-pointer focus:outline-none focus:ring focus:ring-blue-300 ${className}`}
        >
            <div className="absolute top-0 left-0 h-full w-full rounded-lg overflow-hidden">
                <div className={`absolute top-0 left-0 w-0 h-full bg-blue-500 bg-opacity-25 ${timer !== null ? 'animate-grow-width' : ''}`}></div>
            </div>
            {children}
        </button>
    )
}

export default AreYouSure
