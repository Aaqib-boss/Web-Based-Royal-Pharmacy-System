import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Return from './pages/Return';
import Cash from './pages/Cash';
import Cheque from './pages/Cheque';
import Data from './pages/Data';
import Profile from './pages/Profile';

// Loader component
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBg dark:bg-darkBg text-primary">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg transition-colors duration-300">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<Login />} />
        <Route path="/reset-password" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/return"
          element={
            <ProtectedRoute>
              <Return />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cash"
          element={
            <ProtectedRoute>
              <Cash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cheque"
          element={
            <ProtectedRoute>
              <Cheque />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data"
          element={
            <ProtectedRoute>
              <Data />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route
          path="*"
          element={<Navigate to={user ? '/return' : '/login'} replace />}
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
