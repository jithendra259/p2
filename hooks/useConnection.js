import { useState, useCallback } from 'react';
import { useSocket } from './useSocket';

export const useConnection = () => {
    const { socket, connected, message } = useSocket();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateBackendIdx = useCallback(async (idx) => {
        try {
            const response = await fetch('http://localhost:5000/api/current-idx', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idx })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update location index');
            }
            return true;
        } catch (error) {
            console.error('Error updating backend idx:', error);
            throw error;
        }
    }, []);

    const fetchData = useCallback(async (endpoint) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/${endpoint}`);
            if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
            const data = await response.json();
            setError(null);
            return data;
        } catch (error) {
            setError(`Error fetching ${endpoint}: ${error.message}`);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        socket,
        connected,
        message,
        loading,
        error,
        setError,
        updateBackendIdx,
        fetchData
    };
};