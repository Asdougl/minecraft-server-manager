import { ServerStatus } from '../../../app/types'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
    status: ServerStatus;
    changes?: boolean;
}

const StatusLabel = ({ status, changes }: Props) => {
    let icon: JSX.Element;
    let coloring: string;
    let label: string;

    switch(status) {
        case 'online': {
            if(!changes) {
                icon = <FontAwesomeIcon icon="check" fixedWidth />
                coloring = 'bg-green-300 text-green-700'
                label = 'Online'
            } else {
                icon = <FontAwesomeIcon icon="exclamation-circle" fixedWidth />
                coloring = 'bg-yellow-500 bg-opacity-25 text-yellow-500'
                label = 'Restart Required'
            }
            break;
        }
        case 'offline': {
            icon = <FontAwesomeIcon icon="times" fixedWidth />;
            coloring = 'bg-red-300 text-red-700'
            label = 'Offline'
            break;
        }
        case 'loading': {
            icon = <FontAwesomeIcon icon={['fad', 'spinner-third']} spin fixedWidth />
            coloring = 'bg-blue-300 text-blue-700'
            label = 'Loading'
            break;
        }
        default: {
            icon = <FontAwesomeIcon icon="question" fixedWidth />
            coloring = 'bg-gray-300 text-gray-700'
            label = 'Unknown'
            break;
        }
    }

    return (
        <span className={`h-6 px-3 rounded-full flex gap-1 items-center ${coloring} text-base`}>
            {icon}
            <div className="">{label}</div>
        </span>
    )
}

export default StatusLabel
