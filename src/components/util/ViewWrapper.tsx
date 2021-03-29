import React, { FunctionComponent } from 'react'

const ViewWrapper: FunctionComponent = ({ children }) => {
    return (
        <div className="flex-grow overflow-y-auto overflow-x-hidden p-2">
            {children}
        </div>
    )
}

export default ViewWrapper
