import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const isLoggedIn = localStorage.getItem('studentRollNumber');
    const userRole = localStorage.getItem('userRole');
    const location = useLocation();

    if (!isLoggedIn || (allowedRoles && !allowedRoles.includes(userRole))) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
