import { World, WorldBackupMap } from '../../../app/types'
import React, { useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import RelativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(LocalizedFormat)
dayjs.extend(RelativeTime)

interface Props {
    backups: WorldBackupMap;
    worlds: World[];
    createBackup: (worldname: string) => void;
}

const Backups = ({ backups, worlds, createBackup }: Props) => {

    // let list: JSX.Element[] = []

    // for(const world of worlds) {
    //     const world_backups = backups[world.name];
    //     list = [...list,
    //         <div key={world.name}>
    //             <h2 className="font-semibold text-lg">{world.title}</h2>
    //             <ul>
    //                 {world_backups && world_backups.map(bkup => (
    //                     <li key={bkup.timestamp}>
    //                         <span>{dayjs(bkup.timestamp).format('YYYY-MM-DD HH:mm:ss')}</span>
    //                         <button>Restore</button>
    //                     </li>
    //                 ))}
    //                 <button onClick={() => createBackup(world.name)}>Create Backup</button>
    //             </ul>
    //         </div>
    //     ]
    // }

    return (
        <ul className="flex flex-col gap-3">
            {worlds.map(world => {

                let latest = 0;
                if(backups[world.name]) {
                    backups[world.name].forEach(bkup => {
                        if(bkup.timestamp > latest) latest = bkup.timestamp;
                    })
                }

                const lastBackup = latest > 0 ? dayjs(latest).fromNow() : 'never';

                return (
                    <li key={world.name} className="">
                        <div className="flex justify-between">
                            <h3 className="text-lg font-semibold">{world.title}</h3>
                            <span>{lastBackup}</span>
                        </div>
                        <div className="w-full flex gap-1">
                            <button 
                                className="flex-1 bg-blue-100 text-blue-500 hover:opacity-75 rounded-lg"
                                onClick={() => createBackup(world.name)}
                            >Backup</button>
                            <button 
                                className="flex-1 bg-blue-100 text-blue-500 hover:opacity-75 rounded-lg"
                            >Schedule</button>
                            <button 
                                className="flex-1 bg-blue-100 text-blue-500 hover:opacity-75 rounded-lg"
                            >History</button>
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

export default Backups
