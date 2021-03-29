import React from 'react'
import { render } from 'react-dom'
import App from './App'
import { BrowserRouter as Router } from 'react-router-dom'
import './renderer.css'

// FontAwesome Configuration
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faTimes, faPowerOff, faFolderOpen, faFileAlt, faTerminal, faUndoAlt, faUsers, faSlidersH } from '@fortawesome/pro-solid-svg-icons'
import { faCircle, faCheckCircle } from '@fortawesome/pro-regular-svg-icons'
import { faSpinnerThird } from '@fortawesome/pro-duotone-svg-icons'
library.add( faCheck, faTimes, faPowerOff, faFolderOpen, faFileAlt, faTerminal, faUndoAlt, faCircle, faCheckCircle, faUsers, faSlidersH, faSpinnerThird )

let root = document.createElement('div')
root.id = 'root'
document.title = "electron-typescript-webpack-react"
document.body.appendChild(root)

render(
    <React.StrictMode>
        <Router>
            <App />
        </Router>
    </React.StrictMode>
, document.getElementById('root'))