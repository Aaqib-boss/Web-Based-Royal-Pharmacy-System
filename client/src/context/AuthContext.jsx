import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

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
