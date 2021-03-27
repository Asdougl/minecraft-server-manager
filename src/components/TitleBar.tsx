import React from 'react'
import electronapi, { platform } from '../electron'

const TitleBar = () => {
    return (
        <div className="w-screen h-8 flex bg-gray-300">
            {platform === 'darwin' &&
                <div className="flex items-center px-2 gap-2">
                    <button
                        className="h-3 w-3 rounded-full cursor-default"
                        style={{ backgroundColor: '#ff605c'}}
                        onClick={() => electronapi.window.minimize()}
                    ></button>
                    <button
                        className="h-3 w-3 rounded-full cursor-default"
                        style={{ backgroundColor: '#ffbd44'}}
                        onClick={() => electronapi.window.maximize()}
                    ></button>
                    <button
                        className="h-3 w-3 rounded-full cursor-default"
                        style={{ backgroundColor: '#00ca4e'}}
                        onClick={() => electronapi.window.close()}
                    ></button>
                </div>
            }
            <div className="flex-grow flex items-center">Minecraft Server Manager</div>
            {platform !== 'darwin' &&
                <div className="flex">
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
            }
        </div>
    )
}

export default TitleBar
