import React, { useRef, useState } from 'react'

interface Props {
    onUpload: (file: File) => void;
}

const FileUpload = ({ onUpload }: Props) => {

    const id = Math.random().toString(36).substr(2);

    const input = useRef<HTMLInputElement | null>(null) 
    const [filename, setFilename] = useState('');

    const chosen = () => {
        if(input.current && input.current.files && input.current.files[0]) {
            onUpload(input.current.files[0]);
            setFilename(input.current.files[0].name)
        }
    }

    return (
        <div className="relative border-2 border-dashed border-blue-500 rounded-lg px-2 bg-blue-100 hover:bg-blue-200">
            <label 
                htmlFor={id} 
                className="opacity-40"
            >
                {filename || 'Upload Server Java File'}
            </label>
            <input 
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" 
                id={id} 
                type="file" 
                ref={input}
                onChange={chosen}
            />
        </div>
    )
}

export default FileUpload
