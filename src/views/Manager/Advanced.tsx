import React from 'react'
import Button from '../../components/util/Button'
import AreYouSure from '../../components/util/AreYouSure'
import electron from '../../electron'
import { ServerInfo } from '../../../app/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface Props {
    server: ServerInfo
}

const Advanced = ({ server }: Props) => {
    return (
        <div className="px-1">
            <ul className="flex flex-col gap-1">
                <li className="grid grid-cols-3">
                    <div className="flex items-center gap-1 col-span-2">
                        <FontAwesomeIcon icon="trash" fixedWidth className="text-blue-500" size="xs" />
                        Delete Server
                    </div>
                    <div>
                        <AreYouSure
                            onDone={() => console.log("DELETED")}
                            className="w-full"
                        >
                            Delete
                        </AreYouSure>
                    </div>
                </li>
                <li className="grid grid-cols-3">
                    <div className="flex items-center gap-1 col-span-2">
                        <FontAwesomeIcon icon="archive" fixedWidth className="text-blue-500" size="xs" />
                        Archive Server
                    </div>
                    <div>
                        <AreYouSure
                            onDone={() => console.log("ARCHIVED")}
                            className="w-full"
                        >
                            Archive
                        </AreYouSure>
                    </div>
                </li>
                <li className="grid grid-cols-3">
                    <div className="flex items-center gap-1 col-span-2">
                        <FontAwesomeIcon icon="folder-open" fixedWidth className="text-blue-500" size="xs" />
                        Open Directory
                    </div>
                    <div>
                        <Button className="w-full" onClick={() => electron.servers.directory(server.id)}>Open</Button>
                    </div>
                </li>
            </ul>
        </div>
    )
}

export default Advanced
