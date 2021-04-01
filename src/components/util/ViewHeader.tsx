import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FunctionComponent } from 'react'
import { Link } from 'react-router-dom'

interface Props {
    title: string;
    back?: string;
}

const ViewHeader: FunctionComponent<Props> = ({ title, back, children }) => {
    return (
        <h1 className="text-4xl font-bold flex justify-between items-center mb-4">
            {back ? 
                <div className="flex gap-2 items-center">
                    <Link to="/" className="text-blue-500 fill-current hover:opacity-70">
                        <FontAwesomeIcon icon="chevron-left" size="xs" fixedWidth />
                    </Link>
                    {title}
                </div>
            :
                title
            }
            {children}
        </h1>
    )
}

export default ViewHeader
