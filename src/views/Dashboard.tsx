import React, { useEffect, useState } from 'react'
import ViewWrapper from '../components/util/ViewWrapper'
import ViewHeader from '../components/util/ViewHeader'
import main from '../electron'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSubscription } from '../hooks/useSubscription'

interface Props {
    activeid: string | null
}

const Dashboard = ({ activeid }: Props) => {

    const servers = useSubscription(main.servers.list)
    const publicIp = useSubscription(main.application.publicIp)

    console.log(servers)

    return (
        <ViewWrapper>
            <ViewHeader title="Minecraft Servers">
                <Link to="/settings" className="opacity-20 hover:opacity-50 px-1 focus:outline-none">
                    <FontAwesomeIcon icon={['fal', 'cogs']} size="xs" />
                </Link>
            </ViewHeader>
            <h3>Public IP: {publicIp || '...'}</h3>
            <h2 className="text-2xl font-bold">Your Servers:</h2>
            <ul className="flex flex-col gap-2 px-2 py-2">
                {servers ? servers.map(srv => (
                    <li key={srv.id} className="flex justify-between items-center px-3 py-2 bg-gray-200 border-2 border-gray-200 rounded-lg">
                        <div className="flex gap-1 items-center">
                            {srv.id === activeid && <FontAwesomeIcon icon="circle" size="sm" className="text-green-300" />}
                            {srv.name}
                        </div>
                        <Link 
                            to={`/manage/${srv.id}`} 
                            className={`px-2 rounded ${srv.id === activeid ? 'bg-green-300 text-green-700 hover:bg-green-200' : 'bg-blue-200 text-blue-500 hover:bg-blue-100'}`}
                        >
                            Manage
                        </Link>
                    </li>
                )) : <div>Loading...</div>}
                {servers && 
                <Link to="/setup" className="flex justify-center items-center px-3 py-2 rounded-lg gap-1 border-2 border-dashed border-blue-100 text-blue-300 hover:text-blue-500 hover:bg-blue-200 hover:border-blue-500 cursor-pointer">
                    <FontAwesomeIcon icon="plus" size="sm" />
                    <div>{!servers.length ? 'Create Your First Server' : 'Create Server'}</div>
                </Link>
                }
            </ul>
        </ViewWrapper>
    )
}

export default Dashboard
