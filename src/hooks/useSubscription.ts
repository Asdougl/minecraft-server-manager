import { useState, useEffect } from 'react'
import { Hook } from '../../app/types'

interface SubscriptionOptions<T> {
    onNull?: () => void;
    onUpdate?: (change: T) => void;
}

export function useSubscription<T, U = T>(
    hook: Hook<T>,
    options?: SubscriptionOptions<T>
): T | null {
    const [data, setData] = useState<T | null>(null)

    useEffect(() => {
        const listener = (change: T) => {
            setData(change)
            options?.onUpdate?.(change);
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

    return data;
}