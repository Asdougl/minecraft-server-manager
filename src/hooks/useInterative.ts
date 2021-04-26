import { useState, useEffect } from 'react'
import { InteractiveHook } from '../../app/types'

interface InteractiveOptions<T> {
    onNull?: () => void;
    onUpdate?: (change: T) => void;
}

export function useInteractive<T>(
    hook: InteractiveHook<T>,
    options?: InteractiveOptions<T>
): [T | null, (value: T) => void] {
    const [data, setData] = useState<T | null>(null)

    const editor = (value: T) => {
        hook.set(value);
    }

    useEffect(() => {

        const listener = (change: T) => {
            setData(change)
            options?.onUpdate?.(change)
        }
        
        hook.get()
        .then(data => {
            if(data === undefined) {
                setData(null);
                options?.onNull?.();
            } else {
                setData(data)
                options?.onUpdate?.(data);
            }
        })

        const unlisten = hook.listen(listener);

        return () => {
            unlisten();
        }

    },[])

    return [data, editor]
}