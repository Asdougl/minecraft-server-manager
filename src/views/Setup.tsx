import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useEffect, useState } from 'react'
import ViewWrapper from '../components/util/ViewWrapper'
import { useHistory } from 'react-router'
import main from '../electron'
import Input from '../components/util/Input'
import FileUpload from '../components/util/FileUpload'
import Button from '../components/util/Button'
import { ServerStatusContext } from '../context/ServerStatus'
import { ServerData } from '../../app/RendererAPI'
import ViewHeader from '../components/util/ViewHeader'

interface Props {
    
}

const Setup = (props: Props) => {

    const [status, checkStatus] = useContext(ServerStatusContext)
    const history = useHistory()

    const [name, setName] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [agree, setAgree] = useState(false)
    const [ready, setReady] = useState(false)
    const [pending, setPending] = useState(false);
    const [servers, setServers] = useState<ServerData[]>([])

    const [validName, setValidName] = useState(false);
    useEffect(() => {
        const potentialDir = name.toLowerCase().replace(' ', '-')
        setValidName(name ? (!servers.find(srv => srv.name === name || srv.dir === name || srv.dir === potentialDir || srv.name === potentialDir) && /^[A-Za-z 0-9-_]+$/.test(name)) : true)
    },[name, servers])

    useEffect(() => {

        console.log({ name, file, agree })

        setReady(file !== null && agree);

    },[name, file, agree])

    useEffect(() => {
        main.actions.getList().then(list => setServers(list))
    },[])

    const createServer = () => {
        if(file && agree) {
            setPending(true);
            main.actions.createServer(file.path, name).then(() => {
                checkStatus();
                history.push('/');
            })
            
        }
    }

    return (
        <ViewWrapper>
            <ViewHeader title="Create Server" back="/" />
            <ul className="flex flex-col gap-2">
                <li className="w-full bg-gray-200 flex gap-3 items-center px-3 py-2 rounded-lg">
                    <FontAwesomeIcon 
                        className="text-blue-600 fill-current"
                        icon="id-card"
                        fixedWidth
                    />
                    <span className="flex-grow">
                        <Input 
                            value={name} 
                            onChange={setName} 
                            placeholder="Server Nickname"
                            maxLength={20}
                            error={!validName}
                        />
                    </span>
                </li>
                <li className="w-full bg-gray-200 flex gap-3 items-center px-3 py-2 rounded-lg">
                    <FontAwesomeIcon 
                        className="text-blue-600 fill-current"
                        icon={['fab', 'java']}
                        fixedWidth
                    />
                    <div className="flex-grow">
                        <FileUpload onUpload={file => setFile(file)} />
                    </div>
                </li>
                <li 
                    className="w-full bg-gray-200 flex gap-3 items-center px-3 py-2 rounded-lg hover:bg-gray-300 cursor-pointer"
                    onClick={() => setAgree(curr => !curr)}
                >
                    <FontAwesomeIcon 
                        className="text-blue-600 fill-current"
                        icon={['far', agree ? 'check-circle' : 'circle']}
                        fixedWidth
                    />
                    <div className="flex-grow">
                        Agree to the Minecraft EULA
                    </div>
                </li>
            </ul>
            <div className="py-4 w-full">
                <Button disabled={!ready || pending} onClick={createServer} className="w-full">
                    {pending ? <FontAwesomeIcon icon={['fad', 'spinner-third']} spin /> : 'Create Server'}
                </Button>
            </div>
        </ViewWrapper>
    )
}

export default Setup
