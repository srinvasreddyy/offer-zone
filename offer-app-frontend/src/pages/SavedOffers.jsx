import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

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
    <div style={{ padding: '20px' }}>
      <h2>My Saved Offers</h2>
      {savedOffers.length === 0 ? <p>No saved offers.</p> : (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {savedOffers.map(offer => (
             <div key={offer._id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '10px', width: '300px' }}>
                <h3>{offer.title}</h3>
                <p>{offer.restaurantName}</p>
                <p>{offer.description}</p>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedOffers;