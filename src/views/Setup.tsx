import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useEffect, useState } from 'react'
import { ServerStatusContext } from '../context/ServerStatus'
import ViewWrapper from '../components/util/ViewWrapper'
import { useHistory } from 'react-router'

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

    return (
        <ViewWrapper>
            <h1 className="text-4xl font-bold flex justify-between items-center mb-4">
                Setup
            </h1>
            <ul>
                <li>
                    <FontAwesomeIcon icon={['far', progress.folder ? 'check-circle' : 'circle']} />
                    <span>Folder</span>
                </li>
                <li>
                    <FontAwesomeIcon icon={['far', progress.file ? 'check-circle' : 'circle']} />
                    <span>File</span>
                </li>
                <li>
                    <FontAwesomeIcon icon={['far', progress.run ? 'check-circle' : 'circle']} />
                    <span>First Run</span>
                </li>
                <li>
                    <FontAwesomeIcon icon={['far', progress.eula ? 'check-circle' : 'circle']} />
                    <span>EULA</span>
                </li>
            </ul>
        </ViewWrapper>
    )
}

export default Setup
