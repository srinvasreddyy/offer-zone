import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Heart, Phone } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null); // For QR Modal

  const fetchOffers = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/offers`);
    setOffers(res.data);
  };

  useEffect(() => { fetchOffers(); }, []);

  const handleLike = async (id) => {
    await axios.put(`${import.meta.env.VITE_API_URL}/offers/${id}/like`);
    fetchOffers(); // Refresh to update like count
  };

  const handleSave = async (id) => {
    await axios.put(`${import.meta.env.VITE_API_URL}/offers/${id}/save`);
    // Ideally update local state to avoid refetch, but fetching is easier
    alert('Offer Saved/Unsaved!');
    fetchOffers();
  };

  const handleClaim = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/offers/${id}/claim`);
      alert('Offer Claimed! It will now disappear.');
      setSelectedOffer(null);
      fetchOffers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error claiming');
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
      {offers.map(offer => {
        // Condition: Hide if already claimed
        if (offer.isClaimed) return null;

        const isGray = !offer.isActive; // Inactive offers

        return (
          <div key={offer._id} style={{ 
            border: '1px solid #ccc', borderRadius: '10px', padding: '15px', width: '300px',
            filter: isGray ? 'grayscale(100%)' : 'none',
            opacity: isGray ? 0.7 : 1,
            position: 'relative'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{offer.title}</h3>
            <p><strong>{offer.restaurantName}</strong> - {offer.location}</p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{offer.description}</p>
            <p><small>Valid: {offer.validDays.join(', ')}</small></p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
              <button onClick={() => handleLike(offer._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Heart fill={offer.isLiked ? 'red' : 'none'} color='red' /> {offer.likes.length}
              </button>
              
              <a href={`tel:${offer.phoneNumber}`} style={{ textDecoration: 'none', color: 'black', display: 'flex', alignItems: 'center' }}>
                <Phone size={20} /> Call
              </a>
            </div>

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
               <button onClick={() => handleSave(offer._id)} style={{ flex: 1 }}>Save</button>
               <button 
                onClick={() => setSelectedOffer(offer)} 
                disabled={isGray}
                style={{ flex: 1, background: isGray ? '#ccc' : 'green', color: 'white', border: 'none' }}
               >
                 Use Now
               </button>
            </div>
          </div>
        );
      })}

      {/* QR Code Modal */}
      {selectedOffer && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center' 
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', maxWidth: '90%' }}>
            <h3>Use Offer at {selectedOffer.restaurantName}</h3>
            <div style={{ margin: '20px 0' }}>
              <QRCodeSVG value={`OFFER-${selectedOffer._id}-USER-${user._id}`} size={200} />
            </div>
            <p>Show this to the counter</p>
            <button 
              onClick={() => handleClaim(selectedOffer._id)} 
              style={{ background: 'green', color: 'white', padding: '10px 20px', border: 'none', fontSize: '1.2rem', marginTop: '10px' }}
            >
              Record My Saving
            </button>
            <br/>
            <button onClick={() => setSelectedOffer(null)} style={{ marginTop: '10px', background: 'transparent', border: 'none', textDecoration: 'underline' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;