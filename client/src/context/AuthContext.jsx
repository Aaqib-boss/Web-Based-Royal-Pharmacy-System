import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          // Fetch latest user details (like updated profile photo) from database
          const { data } = await api.get('/auth/profile');
          const mergedUser = { ...userData, ...data };
          setUser(mergedUser);
          localStorage.setItem('userInfo', JSON.stringify(mergedUser));
        } catch (e) {
          console.error('Error refreshing session:', e);
        }
      }
      setLoading(false);
    };
    checkUserSession();
  }, []);

  // Real-time synchronization loop (polls database every 3 seconds for photo updates)
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(async () => {
      try {
        const { data } = await api.get('/auth/profile');
        if (user.profilePhoto !== data.profilePhoto) {
          setUser((currentUser) => {
            if (currentUser) {
              const updated = { ...currentUser, ...data };
              localStorage.setItem('userInfo', JSON.stringify(updated));
              return updated;
            }
            return currentUser;
          });
        }
      } catch (err) {
        // Silent catch for session expiry/logout
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const updateProfilePhoto = async (file) => {
    const formData = new FormData();
    formData.append('profilePhoto', file);

    const { data } = await api.put('/auth/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Merge new photo into existing user state and storage
    const updatedUser = { ...user, profilePhoto: data.profilePhoto };
    setUser(updatedUser);
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const deleteProfilePhoto = async () => {
    const { data } = await api.delete('/auth/profile/photo');
    const updatedUser = { ...user, profilePhoto: '' };
    setUser(updatedUser);
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateProfilePhoto,
        deleteProfilePhoto,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
