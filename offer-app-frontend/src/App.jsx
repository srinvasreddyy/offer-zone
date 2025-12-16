import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import SavedOffers from './pages/SavedOffers';
import OfferDetails from './pages/OfferDetails';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { Heart } from 'lucide-react';

// Protected Route Component
const PrivateRoute = ({ children, role }) => {
  const { user, token } = useContext(AuthContext);

  if (!token) return <Navigate to="/" />;
  if (!user) return null; 
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

function App() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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

        <Route path="/offer/:id" element={
          <PrivateRoute role="user">
            <OfferDetails />
          </PrivateRoute>
        } />
      </Routes>

      {/* Floating Saved Button (Only for Users) */}
      {user && user.role === 'user' && (
        <button 
          className="fab-saved animate-pop-in" 
          onClick={() => navigate('/saved')}
          title="Saved Offers"
        >
          <Heart fill="white" size={28} />
        </button>
      )}
    </>
  );
}

export default App;