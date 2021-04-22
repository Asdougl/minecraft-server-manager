import React from 'react'
import { useSubscription } from '../hooks/useSubscription'
import main, { platform } from '../electron'

const TitleBar = () => {

    const focused = useSubscription(main.window.focus)

    return (
        <div className={`w-screen h-8 flex bg-gray-300 ${platform !== 'darwin' ? 'px-0' : 'px-16'} relative`}>
            <div className={`w-full flex items-center drag-region ${platform !== 'darwin' ? 'justify-between px-2' : 'justify-center'} select-none`}>Minecraft Server Manager</div>
            {platform !== 'darwin' ?
                <div className="h-full flex">
                    <button 
                        className="h-full flex items-center justify-center hover:bg-gray-200 cursor-default focus:outline-none"
                        style={{ width: 48 }}
                        onClick={() => main.window.minimize()}
                    ><svg style={{ height: 10, width: 10 }} x="0px" y="0px" viewBox="0 0 10.2 1"><rect x="0" y="50%" width="10.2" height="1" /></svg></button>
                    <button 
                        className="h-full flex items-center justify-center hover:bg-gray-200 cursor-default focus:outline-none"
                        style={{ width: 48 }}
                        onClick={() => main.window.maximize()}
                    ><svg style={{ height: 10, width: 10 }} viewBox="0 0 10 10"><path d="M0,0v10h10V0H0z M9,9H1V1h8V9z" /></svg></button>
                    <button 
                        className="h-full flex items-center justify-center hover:bg-red-600 hover:text-white fill-current cursor-default focus:outline-none"
                        style={{ width: 48 }}
                        onClick={() => main.window.close()}
                    ><svg style={{ height: 10, width: 10 }} viewBox="0 0 10 10"><polygon points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1" /></svg></button>
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
