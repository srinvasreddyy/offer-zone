import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import SavedOffers from './pages/SavedOffers';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Protected Route Component
const PrivateRoute = ({ children, role }) => {
  const { user, token } = useContext(AuthContext);

  if (!token) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />; // Redirect if wrong role

  return children;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />

        {/* User Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute role="user">
            <UserDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/saved" element={
          <PrivateRoute role="user">
            <SavedOffers />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
}

export default App;