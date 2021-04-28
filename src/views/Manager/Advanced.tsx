import React from 'react'

interface Props {
    
}

const Advanced = (props: Props) => {
    return (
        <div>
            <ul>
                <li className="grid grid-cols-2">
                    <div>Delete Server</div>
                    <div>
                        <button>Delete</button>
                    </div>
                </li>
                <li className="grid grid-cols-2">
                    <div>Archive Server</div>
                    <div>
                        <button>Archive</button>
                    </div>
                </li>
                <li className="grid grid-cols-2">
                    <div>Open Directory</div>
                    <div>
                        <button>Open Directory</button>
                    </div>
                </li>
            </ul>
        </div>
    )
}

export default Advanced
