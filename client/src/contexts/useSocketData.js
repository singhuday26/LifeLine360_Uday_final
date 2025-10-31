import { useContext } from 'react';
import SocketDataContext from './SocketDataContext';

// Custom hook to use the SocketDataContext
export const useSocketData = () => {
  const context = useContext(SocketDataContext);
  if (!context) {
    throw new Error('useSocketData must be used within a SocketDataProvider');
  }
  return context;
};