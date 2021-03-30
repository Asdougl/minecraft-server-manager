import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useEffect, useState } from 'react'
import { ServerStatusContext } from '../context/ServerStatus'
import ViewWrapper from '../components/util/ViewWrapper'
import { useHistory } from 'react-router'
import main from '../electron'

interface Checklist {
    folder: boolean;
    file: boolean;
    run: boolean;
    eula: boolean;
}

interface Props {
    
}

const Setup = (props: Props) => {

    const serverStatus = useContext(ServerStatusContext)
    const history = useHistory()

    const [progress, setProgress] = useState<Checklist>({ folder: false, file: false, run: false, eula: false })
    const [pending, setPending] = useState<keyof Checklist | ''>('')

    useEffect(() => {

        if(serverStatus === 'no-folder' || serverStatus === 'no-server') {
            setProgress({ folder: true, file: false, run:false, eula: false })
        } else if(serverStatus === 'no-first-run') {
            setProgress({ folder: true, file: true, run: false, eula: false })
        } else if(serverStatus === 'eula-agree') {
            setProgress({ folder: true, file: true, run: true, eula: false })
        } else {
            history.push('/')
        }

    },[serverStatus])

    const openDir = () => {
        setPending('file')
        main.actions.openDirectory().finally(() => setPending(''))
    }

    const initialRun = () => {
        setPending('run')
        main.actions.startServer()
        .then(outcome => {
            if(outcome === 'success') setProgress(curr => ({ ...curr, run: true }))
        })
        .finally(() => setPending(''))
    }

    const eulaAgree = () => {
        setPending('eula')
        main.actions.eulaAgree(true)
        .then(outcome => {
            if(outcome === 'success') setProgress(curr => ({ ...curr, eula: true }))
        })
        .finally(() => setPending(''))
    }

    return (
        <ViewWrapper>
            <h1 className="text-4xl font-bold flex justify-between items-center mb-4">
                <span>Setup</span>
                <button 
                    className="text-lg text-blue-600 fill-current px-3 py-1 h-full bg-blue-100 rounded-lg hover:bg-opacity-50"
                    onClick={() => console.log("Refresh Server Status")}
                >
                    <FontAwesomeIcon icon="sync-alt" spin={pending !== ''} />
                </button>
            </h1>
            <ul className="flex flex-col gap-2">
                <li className="w-full bg-gray-200 flex gap-2 items-center px-3 py-2 rounded-lg">
                    <FontAwesomeIcon 
                        className="text-blue-600 fill-current"
                        icon={pending !== 'folder' ? ['far', progress.folder ? 'check-circle' : 'circle'] : ['fad', 'spinner-third']} 
                        spin={pending === 'folder'}
                    />
                    <span className="flex-grow">Folder</span>
                </li>
                <li className="w-full bg-gray-200 flex gap-2 items-center px-3 py-2 rounded-lg">
                    <FontAwesomeIcon 
                        className="text-blue-600 fill-current"
                        icon={pending !== 'file' ? ['far', progress.file ? 'check-circle' : 'circle'] : ['fad', 'spinner-third']} 
                        spin={pending === 'file'}
                    />
                    <span className="flex-grow">File</span>
                    <button 
                        disabled={!progress.folder} 
                        className="group relative w-2 h-full px-2 text-blue-400 fill-current disabled:text-gray-500 disabled:opacity-40 disabled:cursor-default"
                        onClick={openDir}
                    >
                        <FontAwesomeIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:opacity-0" icon="folder" />
                        <FontAwesomeIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100" icon="folder-open" />
                    </button>
                </li>
                <li className="w-full bg-gray-200 flex gap-2 items-center px-3 py-2 rounded-lg">
                    <FontAwesomeIcon 
                        className="text-blue-600 fill-current"
                        icon={pending !== 'run' ? ['far', progress.run ? 'check-circle' : 'circle'] : ['fad', 'spinner-third']} 
                        spin={pending === 'run'}
                    />
                    <span className="flex-grow">First Run</span>
                    <button 
                        disabled={!progress.file} 
                        className="relative w-2 h-full px-2 text-blue-400 fill-current disabled:text-gray-500 disabled:opacity-40 disabled:cursor-default"
                        onClick={initialRun}
                    >
                        <FontAwesomeIcon icon="power-off" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:opacity-80" />
                    </button>
                </li>
                <li className="w-full bg-gray-200 flex gap-2 items-center px-3 py-2 rounded-lg">
                    <FontAwesomeIcon 
                        className="text-blue-600 fill-current"
                        icon={pending !== 'eula' ? ['far', progress.eula ? 'check-circle' : 'circle'] : ['fad', 'spinner-third']} 
                        spin={pending === 'eula'}
                    />
                    <span className="flex-grow">EULA</span>
                    <button 
                        disabled={!progress.run} 
                        className="relative w-2 h-full px-2 text-blue-400 fill-current disabled:text-gray-500 disabled:opacity-40 disabled:cursor-default"
                        onClick={eulaAgree}
                    >
                        <FontAwesomeIcon icon={['far', 'file-check']} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:opacity-80" />
                    </button>
                </li>
            </ul>
        </ViewWrapper>
    )
}

export default Setup
