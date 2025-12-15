import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedOffers = () => {
  const [savedOffers, setSavedOffers] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`);
      setSavedOffers(res.data.savedOffers);
    };
    fetchProfile();
  }, []);

  return (
    <div className="container animate-fade-in">
      <div style={{ margin: '30px 0' }}>
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
             <div key={offer._id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#FF6B6B' }}>{offer.title}</h3>
                </div>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>{offer.restaurantName}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '0.85rem', marginBottom: '15px', marginTop: '5px' }}>
                  <MapPin size={14}/> {offer.location}
                </div>
                <p style={{ color: '#555', fontSize: '0.9rem', background: '#f5f5f5', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
                  {offer.description}
                </p>
                <Link to={`/offer/${offer._id}`} className="btn btn-outline" style={{ marginTop: 'auto', textAlign: 'center', justifyContent: 'center' }}>
                  View & Redeem <ArrowRight size={16}/>
                </Link>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedOffers;