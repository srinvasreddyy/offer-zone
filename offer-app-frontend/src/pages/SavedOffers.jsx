import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, ArrowRight, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SavedOffers = () => {
  const [savedOffers, setSavedOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`);
      setSavedOffers(res.data.savedOffers);
    } catch (error) {
      console.error("Error fetching saved offers");
    }
  };

  const removeSaved = async (e, id) => {
    e.preventDefault(); 
    e.stopPropagation();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/offers/${id}/save`);
      fetchProfile(); 
    } catch (error) {
      console.error("Remove failed");
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ margin: '30px 0', textAlign: 'center' }}>
        <h2>Your Saved Collection</h2>
        <p style={{ color: '#666' }}>Don't let these expire!</p>
      </div>

      {savedOffers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
          <h3>No saved offers yet.</h3>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '10px' }}>Browse Offers</Link>
        </div>
      ) : (
        <div className="grid-layout">
          {savedOffers.map(offer => (
             <div 
               key={offer._id} 
               className="glass-card" 
               onClick={() => navigate(`/offer/${offer._id}`)}
               style={{ cursor: 'pointer' }} 
             >
                {/* FIX: Added specific classes so global CSS handles responsiveness 
                   (Image left on mobile, top on desktop)
                */}
                <div className="card-image-container">
                  <img 
                    src={offer.image} 
                    alt={offer.title} 
                    className="card-img"
                  />
                  {/* Remove Button */}
                  <button 
                    onClick={(e) => removeSaved(e, offer._id)}
                    style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'rgba(255,255,255,0.9)', border: 'none',
                      borderRadius: '50%', padding: '8px', cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10
                    }}
                    title="Remove from Saved"
                  >
                    <Trash2 size={16} color="#ff4444"/>
                  </button>
                </div>

                {/* Content Section */}
                <div className="card-content">
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>{offer.title}</h3>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#666', fontWeight: '500' }}>{offer.restaurantName}</h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#888', fontSize: '0.85rem', marginBottom: '15px' }}>
                      <MapPin size={14}/> {offer.location}
                    </div>
                  </div>
                  
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 'auto' }}>
                    View Deal <ArrowRight size={16}/>
                  </button>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedOffers;