import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Heart, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '0.8rem 0'
    }}>
      <div className="container navbar-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to={user.role === 'admin' ? "/admin" : "/dashboard"} style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(45deg, #FF6B6B, #FFD93D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
            OfferZone
          </span>
        </Link>
        
        <div className="navbar-links" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {user.role === 'admin' ? (
            <Link to="/admin" className="btn btn-outline" style={{ border: 'none', padding: '8px' }}>
              <Shield size={18}/> <span style={{ marginLeft: '5px' }}>Admin</span>
            </Link>
          ) : (
            <>
              <Link to="/dashboard" style={{ color: '#555', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                <LayoutDashboard size={18}/> <span>Offers</span>
              </Link>
              <Link to="/saved" style={{ color: '#555', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                <Heart size={18}/> <span>Saved</span>
              </Link>
            </>
          )}
          <button onClick={handleLogout} className="btn" style={{ background: '#eee', color: '#333', padding: '8px 12px', fontSize: '0.85rem' }}>
            <LogOut size={16}/>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;