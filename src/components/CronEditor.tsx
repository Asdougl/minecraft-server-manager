import React, { useEffect, useState } from 'react'
import electron from '../electron';

const makeId = () => Math.random().toString(36).substr(2, 7);

interface CronElementProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const CronElement = ({ label, value, onChange }: CronElementProps) => {

    const id = makeId();

    return (
        <div className="w-full grid grid-cols-2">   
            <label 
                htmlFor={id}
                className="font-mono text-xs text-center"
            >
                {label}
            </label>
            <input 
                id={id}
                className="w-full rounded text-center font-mono focus:outline-none focus:ring focus:ring-blue-300 bg-gray-200"
                type="text" 
                value={value} 
                onChange={e => onChange(e.currentTarget.value)} 
            />
        </div>
    )
}

interface Props {
    cron: string;
    onSave: (cron: string) => void;
    onCancel: () => void;
}

const CronEditor = ({ cron, onSave, onCancel }: Props) => {
    
    const [minute, setMinute] = useState('*')
    const [hour, setHour] = useState('*')
    const [dayOfMonth, setDayOfMonth] = useState('*')
    const [month, setMonth] = useState('*')
    const [dayOfWeek, setDayOfWeek] = useState('*')

    useEffect(() => {
        console.log("Do i take forever?");
        const cronified = cron.replaceAll(/[^\*,0-9 ]/g, '').split(' ');
        setMinute(cronified[0] || '*')
        setHour(cronified[1] || '*')
        setDayOfMonth(cronified[2] || '*')
        setMonth(cronified[3] || '*')
        setDayOfWeek(cronified[4] || '*')
        console.log("Lets find out!")

    },[cron])
    
    const setCronElement = (value: string, set: (nval: string) => void) => {
        const cronified = value.replaceAll(/[^\*,0-9]/g, '');
        set(cronified)
    }
    
    return (
        <div className="flex flex-col gap-2 w-full px-2">
            <div className="flex flex-col gap-1 w-full">
                <CronElement 
                    label="Minutes"
                    value={minute}
                    onChange={ val => setCronElement(val, setMinute)}
                />
                <CronElement 
                    label="Hours"
                    value={hour}
                    onChange={ val => setCronElement(val, setHour)}
                />
                <CronElement 
                    label="Month Day"
                    value={dayOfMonth}
                    onChange={ val => setCronElement(val, setDayOfMonth)}
                />
                <CronElement 
                    label="Month"
                    value={month}
                    onChange={ val => setCronElement(val, setMonth)}
                />
                <CronElement 
                    label="Week Day"
                    value={dayOfWeek}
                    onChange={ val => setCronElement(val, setDayOfWeek)}
                />
            </div>
            <div className="flex gap-1 w-full">
                <button 
                    className="flex-1 bg-blue-100 text-blue-500 hover:opacity-75 rounded-lg focus:outline-none focus:ring focus:ring-blue-200 flex items-center justify-center gap-1"
                    onClick={() => onSave(`${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`)}
                >Save</button>
                <button 
                    className="flex-1 bg-blue-100 text-blue-500 hover:opacity-75 rounded-lg focus:outline-none focus:ring focus:ring-blue-200 flex items-center justify-center gap-1"
                    onClick={() => onCancel()}
                >Cancel</button>
                <button
                    className="flex-1 bg-blue-100 text-blue-500 hover:opacity-75 rounded-lg focus:outline-none focus:ring focus:ring-blue-200 flex items-center justify-center gap-1"
                    onClick={() => electron.application.openExternal(`https://crontab.guru/#${minute}_${hour}_${dayOfMonth}_${month}_${dayOfWeek}`)}
                >Help</button>
            </div>
        </div>
    )
}

export default CronEditor
