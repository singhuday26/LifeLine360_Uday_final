import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Temporary check - set to true when authentication is implemented
const isAuthenticated = false;

const ProtectedRoute = () => {
    // If authenticated, render the protected content
    if (isAuthenticated) {
        return <Outlet />;
    }

    // If not authenticated, redirect to login
    return <Navigate to="/login" />;
};

export default ProtectedRoute;