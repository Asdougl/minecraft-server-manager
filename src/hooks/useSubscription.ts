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

        let isSubscribed = true;

        hook.get()
        .then(data => {
            if(!isSubscribed) return;

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
            isSubscribed = false;
            unlisten();
        }
    },[])

    return data;
}