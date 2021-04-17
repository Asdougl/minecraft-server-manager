import React from 'react'
import { useSubscription } from '../hooks/useSubscription'
import main, { platform } from '../electron'

const TitleBar = () => {

    const focused = useSubscription(main.window.focus)

    return (
        <div className={`w-screen h-8 flex bg-gray-300 ${platform !== 'darwin' ? 'px-32' : 'px-16'} relative`}>
            <div className="w-full flex items-center drag-region justify-center select-none">Minecraft Server Manager</div>
            {platform !== 'darwin' ?
                <div className="absolute top-0 right-0 h-full flex">
                    <button 
                        className="h-full w-10"
                        onClick={() => main.window.minimize()}
                    >_</button>
                    <button 
                        className="h-full w-10"
                        onClick={() => main.window.maximize()}
                    >[]</button>
                    <button 
                        className="h-full w-10"
                        onClick={() => main.window.close()}
                    >X</button>
                </div>
            :
                <div className="absolute top-0 left-0 h-full flex items-center px-2 gap-2">
                    <button
                        className="h-3 w-3 rounded-full cursor-default focus:outline-none"
                        style={{ backgroundColor: focused ? '#fc615d' : '#777777'}}
                        onClick={() => main.window.close()}
                    ></button>
                    <button
                        className="h-3 w-3 rounded-full cursor-default focus:outline-none"
                        style={{ backgroundColor: focused ? '#fdbc40' : '#777777'}}
                        onClick={() => main.window.minimize()}
                    ></button>
                    <button
                        className="h-3 w-3 rounded-full cursor-default focus:outline-none"
                        style={{ backgroundColor: focused ? '#34c749' : '#777777'}}
                        onClick={() => main.window.maximize()}
                    ></button>
                </div>
            }
        </div>
    )
}

export default TitleBar
