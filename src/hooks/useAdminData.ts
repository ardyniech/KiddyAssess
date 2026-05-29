import { useState, useEffect } from 'react';
import { db } from '../lib/db';

export function useAdminData<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void, boolean] {
    const [data, setData] = useState<T>(initialValue);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        db.settings.get(key).then(res => {
            if (res && res.value) {
                setData(res.value);
            }
            setIsLoaded(true);
        }).catch(() => {
            setIsLoaded(true);
        });
    }, [key]);

    const saveData = (newData: T | ((prev: T) => T)) => {
        if (typeof newData === 'function') {
            setData((prev) => {
                const next = (newData as any)(prev);
                db.settings.put({ key, value: next }).catch(console.error);
                return next;
            });
        } else {
            setData(newData);
            db.settings.put({ key, value: newData }).catch(console.error);
        }
    };

    return [data, saveData, isLoaded];
}
