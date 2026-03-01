import { useState } from 'react';

/**
 * Hook personalizado para manejar el estado sincronizado con LocalStorage.
 * @param {string} key - Clave de almacenamiento.
 * @param {any} initialValue - Valor inicial si no existe en storage.
 */
export function useLocalStorage(key, initialValue) {
    // Estado para almacenar nuestro valor
    // Pasamos la función de inicialización a useState para que la lógica solo se ejecute una vez
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            // Obtener del local storage por key
            const item = window.localStorage.getItem(key);
            // Parsear el JSON o devolver initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    // Retorna una versión encapsulada de la función setter de useState que ...
    // ... persiste el nuevo valor en localStorage.
    const setValue = (value) => {
        try {
            // Permitir que el valor sea una función para tener la misma API que useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            // Guardar estado
            setStoredValue(valueToStore);
            // Guardar en local storage
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}
