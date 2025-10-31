import React, { useState, useEffect, createContext } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Get API URL from environment
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = localStorage.getItem('authToken');
                const storedUser = localStorage.getItem('authUser');

                if (storedToken && storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(parsedUser);

                    // Verify token with backend
                    try {
                        const response = await fetch(`${apiUrl}/api/auth/me`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${storedToken}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.success && data.data.user) {
                                setUser(data.data.user);
                                localStorage.setItem('authUser', JSON.stringify(data.data.user));
                            }
                        } else {
                            // Token is invalid, clear it
                            logout();
                        }
                    } catch (error) {
                        console.error('Token verification failed:', error);
                        logout();
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                // Clear invalid stored data
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, [apiUrl]); // Only depend on apiUrl

    // Login function
    const login = async (email, password) => {
        try {
            setIsLoading(true);

            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const { user: userData, token: newToken } = data.data;

                // Store in state
                setUser(userData);
                setToken(newToken);

                // Store in localStorage
                localStorage.setItem('authToken', newToken);
                localStorage.setItem('authUser', JSON.stringify(userData));

                return { success: true };
            } else {
                return {
                    success: false,
                    message: data.message || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        // Clear state
        setUser(null);
        setToken(null);

        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    };

    // Register function (optional, for completeness)
    const register = async (userData) => {
        try {
            setIsLoading(true);

            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const { user: userData, token: newToken } = data.data;

                // Store in state
                setUser(userData);
                setToken(newToken);

                // Store in localStorage
                localStorage.setItem('authToken', newToken);
                localStorage.setItem('authUser', JSON.stringify(userData));

                return { success: true };
            } else {
                return {
                    success: false,
                    message: data.message || 'Registration failed'
                };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        } finally {
            setIsLoading(false);
        }
    };

    // Check if user has specific role
    const hasRole = (role) => {
        return user && user.role === role;
    };

    // Check if user has any of the specified roles
    const hasAnyRole = (roles) => {
        return user && roles.includes(user.role);
    };

    // Check if user is admin (any admin role)
    const isAdmin = () => {
        return user && ['fire_admin', 'flood_admin', 'super_admin'].includes(user.role);
    };

    // Context value
    const value = {
        user,
        token,
        isLoading,
        login,
        logout,
        register,
        hasRole,
        hasAnyRole,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;