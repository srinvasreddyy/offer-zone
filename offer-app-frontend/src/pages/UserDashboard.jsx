import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, MapPin, Search, LayoutGrid, List, Bookmark
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [animatingLikes, setAnimatingLikes] = useState({});

  const fetchOffers = async () => {
    try {
      // FIX: /api prefix added
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/offers`);
      setOffers(res.data);
    } catch (error) {
      console.error("Error fetching offers");
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  const handleLike = async (e, id) => {
    e.stopPropagation();
    
    setAnimatingLikes(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setAnimatingLikes(prev => ({ ...prev, [id]: false })), 400);

    try {
      // FIX: /api prefix added
      await axios.put(`${import.meta.env.VITE_API_URL}/api/offers/${id}/like`);
      fetchOffers(); 
    } catch (error) { console.error("Like failed"); }
  };

  const handleSave = async (e, id) => {
    e.stopPropagation();
    try {
      // FIX: /api prefix added
      await axios.put(`${import.meta.env.VITE_API_URL}/api/offers/${id}/save`);
      fetchOffers(); 
    } catch (error) { console.error("Save failed"); }
  };

  const filteredOffers = offers.filter(offer => {
    const term = searchTerm.toLowerCase();
    return (
      offer.title.toLowerCase().includes(term) ||
      offer.restaurantName.toLowerCase().includes(term) ||
      offer.location.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '50px' }}>
      
      <div className="controls-bar animate-slide-up" style={{ marginTop: '30px' }}>
        <div className="search-container">
          <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search deals..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="view-toggles">
          <button 
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} 
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} 
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      <div className={`grid-layout ${viewMode === 'list' ? 'list-view' : ''}`} style={{ marginTop: '30px' }}>
        {filteredOffers.map(offer => {
          if (offer.isClaimed) return null;
          const isGray = !offer.isActive; 

          return (
            <div 
              key={offer._id} 
              className="glass-card" 
              onClick={() => !isGray && navigate(`/offer/${offer._id}`)}
              style={{ 
                cursor: isGray ? 'default' : 'pointer',
                filter: isGray ? 'grayscale(100%) opacity(0.7)' : 'none',
              }}
            >
              
              <div className="card-image-container">
                <img 
                  src={offer.image} 
                  alt={offer.title} 
                  className="card-img"
                />
                
                {viewMode === 'grid' && (
                  <div className="card-overlay">
                    <h3 style={{ margin: 0, fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{offer.title}</h3>
                  </div>
                )}

                <button 
                  className={`like-btn ${animatingLikes[offer._id] ? 'animate-like' : ''}`} 
                  onClick={(e) => handleLike(e, offer._id)}
                >
                  <Heart size={20} fill={offer.isLiked ? '#FF6B6B' : 'none'} color={offer.isLiked ? '#FF6B6B' : '#ccc'} />
                </button>
              </div>

              <div className="card-content">
                
                {viewMode === 'list' && (
                  <h3 className="highlight-title" style={{ fontSize: '1.1rem', margin: '0 0 5px 0', alignSelf: 'flex-start' }}>{offer.title}</h3>
                )}

                <h4 style={{ color: '#333', fontSize: '1rem', margin: '0 0 5px 0', fontWeight: '600' }}>{offer.restaurantName}</h4>
                
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#888', margin: '0 0 10px 0' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14}/> {offer.location}</span>
                  {viewMode === 'grid' && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={14}/> {offer.likes.length}</span>}
                </div>

                {viewMode === 'list' && (
                  <p className="card-desc">
                    {offer.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                   <button 
                    onClick={(e) => handleSave(e, offer._id)} 
                    className="btn btn-outline"
                    style={{ flex: 0.3, padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    title={offer.isSaved ? "Unsave" : "Save"}
                  >
                    <Bookmark size={20} fill={offer.isSaved ? '#333' : 'none'} />
                  </button>

                  <button className="btn btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}>
                    View Deal
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDashboard;