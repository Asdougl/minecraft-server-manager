import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tree } from 'dot-properties'
import React, { useState } from 'react'
import { StringEditable, NumberEditable, BooleanEditable } from '../../components/Editable';

interface Props {
    properties: Tree;
    onSave: (label: string, value: string) => void;
}

const propblacklist = ['level-name']

const Properties = ({ properties, onSave }: Props) => {

    let rows: JSX.Element[] = [];

    const [filter, setFilter] = useState('')

    for(const label in properties) {

        if(filter && !label.toLowerCase().includes(filter.toLowerCase())) continue;

        if(propblacklist.includes(label)) continue;

        const value = properties[label]

        const labelspan = <span key={`key-${label}`} className="text-xs font-mono flex items-center">{label.replace(/-/g, ' ')}</span>

        let editable;
        if(value === 'true' || value === 'false') {
            editable = <BooleanEditable 
                key={`value-${label}`}
                value={value === 'true'}
                onSave={value => onSave(label, value.toString())}
            />
        } else if(!isNaN(+value)) {
            editable = <NumberEditable 
                key={`value-${label}`}
                value={+value}
                onSave={value => onSave(label, value.toString())}
            />
        } else if(typeof value === 'string') {
            editable = <StringEditable 
                key={`value-${label}`}
                value={value}
                onSave={value => onSave(label, value.toString())}
            />
        } else {
            editable = <div>Uneditable Format</div>
        }

        rows = [...rows, labelspan, editable]
    }

    return (
        <div className="grid grid-cols-2 gap-1">
            <div className="col-span-2 flex border focus-within:border-blue-400 bg-white rounded-lg">
                <input className="w-full px-2 flex-grow bg-transparent focus:outline-none" type="text" value={filter} onChange={e => setFilter(e.currentTarget.value)} placeholder="Filter" />
                {filter &&
                <button className="focus:outline-none w-8">
                    <FontAwesomeIcon className="opacity-50 hover:opacity-80" icon="times" onClick={() => setFilter('')} />
                </button>}
            </div>
            {rows}
        </div>
    )
}

export default Properties