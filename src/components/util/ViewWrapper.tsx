import React, { FunctionComponent } from 'react'

interface ViewWrapperProps {
    className?: string;
}

const ViewWrapper: FunctionComponent<ViewWrapperProps> = ({ children, className }) => {
    return (
        <div className={`flex-grow overflow-y-scroll overflow-x-hidden py-2 pl-2 pr-1 ${className}`}>
            {children}
        </div>
    )
}

export default ViewWrapper
