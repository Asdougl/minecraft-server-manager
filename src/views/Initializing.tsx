import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import ViewWrapper from '../components/util/ViewWrapper'

const Initializing = () => {
    return (
        <ViewWrapper>
            <FontAwesomeIcon icon={['fad', 'spinner-third']} spin />
        </ViewWrapper>
    )
}

export default Initializing
