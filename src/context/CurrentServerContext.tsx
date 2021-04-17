import { ServerInfo, ServerStatus } from '../../app/types'
import { createContext } from 'react'

export const CurrentServerContext = createContext<ServerInfo | null>(null)