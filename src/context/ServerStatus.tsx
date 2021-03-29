import { ServerStatus } from '../../app/RendererAPI'
import { createContext } from 'react'

export const ServerStatusContext = createContext<ServerStatus | ''>('')