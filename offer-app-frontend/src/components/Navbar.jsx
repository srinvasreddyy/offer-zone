import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null; // Don't show navbar on login page

  return (
    <nav style={{ padding: '1rem', background: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>OfferApp</span>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {user.role === 'admin' ? (
          <span>Admin Panel</span>
        ) : (
          <>
            <Link to="/dashboard" style={{ color: '#fff' }}>All Offers</Link>
            <Link to="/saved" style={{ color: '#fff' }}>Saved Offers</Link>
          </>
        )}
        <button onClick={handleLogout} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;