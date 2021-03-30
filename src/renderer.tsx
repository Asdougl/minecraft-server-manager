import React from 'react'
import { render } from 'react-dom'
import App from './App'
import './renderer.css'

// FontAwesome Configuration
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faTimes, faPowerOff, faFolderOpen, faFolder, faFileAlt, faTerminal, faUndoAlt, faUsers, faSlidersH, faSyncAlt } from '@fortawesome/pro-solid-svg-icons'
import { faCircle, faCheckCircle, faFileCheck } from '@fortawesome/pro-regular-svg-icons'
import { faSpinnerThird } from '@fortawesome/pro-duotone-svg-icons'
library.add( faCheck, faTimes, faPowerOff, faFolderOpen, faFolder, faFileAlt, faTerminal, faUndoAlt, faCircle, faCheckCircle, faUsers, faSlidersH, faSpinnerThird, faFileCheck, faSyncAlt )

let root = document.createElement('div')
root.id = 'root'
document.title = "electron-typescript-webpack-react"
document.body.appendChild(root)

render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
, document.getElementById('root'))