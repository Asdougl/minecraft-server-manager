import { ServerData, ServerInfo } from '../../app/types'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

interface Props {
    server: ServerInfo
}

const ServerStats = ({ server }: Props) => {
    return (
        <div className="w-full px-2 py-1 bg-green-300 text-green-700 flex justify-between items-center">
            <div><FontAwesomeIcon icon="check" size="sm" fixedWidth /> {server.name} Online</div>
            <Link to={`/manage/${server.id}`} className="bg-green-400 px-2 rounded hover:bg-green-300 cursor-pointer">Manage</Link>
        </div>
    )
}

export default ServerStats
