import React, { useEffect, useState } from 'react'
import electronapi, { platform } from '../electron'

const TitleBar = () => {

    const [focused, setFocused] = useState(true);

    useEffect(() => {

        electronapi.window.isFocused().then(status => setFocused(status))

        const onFocus = () => setFocused(true);
        const onBlur = () => setFocused(false)

        electronapi.window.onFocus(onFocus)
        electronapi.window.onBlur(onBlur)

        return () => {
            electronapi.window.offFocus(onFocus)
            electronapi.window.offBlur(onBlur)
        }

    },[])

    return (
        <div className={`w-screen h-8 flex bg-gray-300 ${platform !== 'darwin' ? 'px-32' : 'px-16'} relative`}>
            <div className="w-full flex items-center drag-region justify-center">Minecraft Server Manager</div>
            {platform !== 'darwin' ?
                <div className="absolute top-0 right-0 h-full flex">
                    <button 
                        className="h-full w-10"
                        onClick={() => electronapi.window.minimize()}
                    >_</button>
                    <button 
                        className="h-full w-10"
                        onClick={() => electronapi.window.maximize()}
                    >[]</button>
                    <button 
                        className="h-full w-10"
                        onClick={() => electronapi.window.close()}
                    >X</button>
                </div>
            :
                <div className="absolute top-0 left-0 h-full flex items-center px-2 gap-2">
                    <button
                        className="h-3 w-3 rounded-full cursor-default focus:outline-none"
                        style={{ backgroundColor: focused ? '#fc615d' : '#777777'}}
                        onClick={() => electronapi.window.close()}
                    ></button>
                    <button
                        className="h-3 w-3 rounded-full cursor-default focus:outline-none"
                        style={{ backgroundColor: focused ? '#fdbc40' : '#777777'}}
                        onClick={() => electronapi.window.minimize()}
                    ></button>
                    <button
                        className="h-3 w-3 rounded-full cursor-default focus:outline-none"
                        style={{ backgroundColor: focused ? '#34c749' : '#777777'}}
                        onClick={() => electronapi.window.maximize()}
                    ></button>
                </div>
            }
        </div>
    )
}

export default TitleBar
