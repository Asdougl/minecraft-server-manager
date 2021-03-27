import React from 'react'
import { render } from 'react-dom'
import App from './App'
import './renderer.css'

let root = document.createElement('div')
root.id = 'root'
document.title = "electron-typescript-webpack-react"
document.body.appendChild(root)

render(<App />, document.getElementById('root'))