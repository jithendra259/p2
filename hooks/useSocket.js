import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const socketInstance = io('http://localhost:5000', {
            transports: ['websocket'],
            cors: {
                origin: "http://localhost:3000"
            }
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected');
            setConnected(true);
            setMessage('Connected to Flask backend');
        });

        socketInstance.on('connection_status', (data) => {
            console.log('Received status:', data.status);
            setMessage(data.status);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
            setMessage('Disconnected from Flask backend');
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return { socket, connected, message };
};