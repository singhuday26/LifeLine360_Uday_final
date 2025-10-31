const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect middleware - JWT authentication
const protect = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Find the user in the database
        User.findById(decoded.id).then(user => {
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Token is not valid. User not found.'
                });
            }

            // Attach user object to request
            req.user = user;
            next();
        }).catch(error => {
            console.error('Protect middleware error:', error);
            return res.status(401).json({
                success: false,
                message: 'Token is not valid.'
            });
        });
    } catch (error) {
        console.error('Protect middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Token is not valid.'
        });
    }
};

// CheckRole middleware - Role-based authorization
const checkRole = (roles) => {
    return (req, res, next) => {
        // This middleware must be used after the protect middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        // Check if user's role is in the allowed roles array
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

module.exports = { protect, checkRole };