import { World, WorldBackup, WorldBackupMap } from '../../../app/types'
import React, { useEffect, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import RelativeTime from 'dayjs/plugin/relativeTime'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CronEditor from '../../components/CronEditor'
import Modal from '../../components/Modal'
import Confirmation from '../../components/Confirmation'

dayjs.extend(LocalizedFormat)
dayjs.extend(RelativeTime)

const BackupOption = ({ timestamp }: WorldBackup) => {

    const [restoring, setRestoring] = useState(false)

    const onRestore = (backup: boolean) => {
        setRestoring(false);
        console.log(backup ? 'BACK ME UP SCOTTY' : 'JUST RESTORE TY')
    }

    return (
        <li className="flex justify-between">
            <div className="flex-1 font-mono">
                {dayjs(timestamp).fromNow()}
            </div>
            <button
                className="bg-blue-100 text-blue-500 hover:opacity-75 rounded-lg focus:outline-none focus:ring focus:ring-blue-200 flex items-center justify-center gap-1 px-3"
                onClick={() => setRestoring(true)}
            >Restore</button>
            {restoring && (
                <Confirmation 
                    title="Confirm Backup Restore"
                    message={<>Restoring the Backup from <code>{dayjs(timestamp).format('YYYY-MM-DD hh:mm a')}</code> will permanently erase all current data from your world. Do you wish to proceed?</>}
                    actions={[
                        { name: 'Restore Backup', priority: true, onChosen: () => onRestore(false) },
                        { name: 'Backup then Restore', priority: false, onChosen: () => onRestore(true) },
                    ]}
                    onCancel={() => setRestoring(false)}
                />
            )}
        </li>
    )
}

interface WorldToBackupProps {
    world: World;
    backups: WorldBackup[];
    create: () => void;
}

const WorldToBackup = ({ world, backups, create }: WorldToBackupProps) => {

    const [lastBackup, setLastBackup] = useState('');
    const [modalView, setModalView] = useState('')
    const [sorted, setSorted] = useState(backups)

    useEffect(() => {

        const nowSorted = backups.sort((a, b) => {
            if(a.timestamp < b.timestamp) return 1;
            if(a.timestamp > b.timestamp) return -1;
            return 0;
        })

        setSorted(nowSorted)

        setLastBackup(nowSorted[0] ? dayjs(nowSorted[0].timestamp).fromNow() : 'never')

    },[backups])

    let modalContent: JSX.Element | null = null;
    if(modalView === 'Schedule Backup') {
        modalContent = <div className="w-full flex gap-1">
            {/* Cron Job */}
            <CronEditor
                cron={world.schedule || ''}
                onSave={cron => console.log(cron)}
                onCancel={() => setModalView('')}
            />
        </div>
    } else if(modalView === 'Backup History') {
        modalContent = <ul className="w-full flex flex-col gap-2">
            {sorted.map(backup => <BackupOption key={backup.id} {...backup} />)}
        </ul>
    }

    return (
        <li key={world.name} className="">
            <div className="flex justify-between">
                <h3 className="text-lg font-semibold">{world.title}</h3>
                <span>{lastBackup}</span>
            </div>
            <div className="w-full flex gap-1">
                <button 
                    className="flex-1 bg-blue-100 text-blue-500 hover:opacity-75 rounded-lg focus:outline-none focus:ring focus:ring-blue-200 flex items-center justify-center gap-1"
                    onClick={() => create()}
                >
                    <FontAwesomeIcon icon="file-archive" size="xs" fixedWidth />
                    Backup
                </button>
                <button 
                    className="flex-1 bg-blue-100 text-blue-500 hover:opacity-75 rounded-lg focus:outline-none focus:ring focus:ring-blue-200 flex items-center justify-center gap-1"
                    onClick={() => setModalView('Schedule Backup')}
                >
                    <FontAwesomeIcon icon="alarm-clock" size="xs" fixedWidth />
                    Schedule
                </button>
                <button 
                    className="flex-1 bg-blue-100 text-blue-500 hover:opacity-75 rounded-lg focus:outline-none focus:ring focus:ring-blue-200 flex items-center justify-center gap-1"
                    onClick={() => setModalView('Backup History')}
                >
                    <FontAwesomeIcon icon="history" size="xs" fixedWidth />
                    History
                </button>
            </div>
            {modalView && modalContent && (
                <Modal title={modalView} onClose={() => setModalView('')} height="fit">
                    {modalContent}
                </Modal>
            )}
        </li>
    )
}

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
            {worlds.map(world => (
                <WorldToBackup 
                    key={world.name}
                    world={world} 
                    backups={backups[world.name] || []} 
                    create={() => createBackup(world.name)}
                />
            ))}
        </ul>
    )
}

export default Backups
