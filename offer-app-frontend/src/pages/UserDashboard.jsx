import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Heart, Phone, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null); // Controls Modal
  
  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/offers`);
      setOffers(res.data);
    } catch (error) {
      console.error("Error fetching offers");
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  // Handle Like
  const handleLike = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/offers/${id}/like`);
      // Optimistic update or refetch
      fetchOffers(); 
    } catch (error) {
      console.error("Like failed");
    }
  };

  // Handle Save
  const handleSave = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/offers/${id}/save`);
      fetchOffers(); 
      alert("Saved/Unsaved successfully");
    } catch (error) {
      console.error("Save failed");
    }
  };

  // Final Claim Action
  const handleClaim = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/offers/${id}/claim`);
      alert('Offer Redeemed Successfully!');
      setSelectedOffer(null); // Close modal
      fetchOffers(); // Refresh list to remove the claimed offer
    } catch (error) {
      alert(error.response?.data?.message || 'Error claiming offer');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Grid Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '25px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        
        {offers.map(offer => {
          // 1. Hide if already claimed
          if (offer.isClaimed) return null;

          // 2. Visual state for inactive
          const isGray = !offer.isActive; 

          return (
            <div key={offer._id} style={{ 
              background: 'white', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s',
              filter: isGray ? 'grayscale(100%)' : 'none',
              opacity: isGray ? 0.75 : 1
            }}>
              
              {/* Image Header */}
              <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                <img 
                  src={offer.image} 
                  alt={offer.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, black)', padding: '10px', color: 'white' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{offer.title}</h3>
                </div>
              </div>

              {/* Content Body */}
              <div style={{ padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                   <h4 style={{ margin: 0, color: '#1f2937' }}>{offer.restaurantName}</h4>
                   <button 
                    onClick={() => handleLike(offer._id)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}
                   >
                     <Heart size={20} fill={offer.isLiked ? '#ef4444' : 'none'} color={offer.isLiked ? '#ef4444' : '#9ca3af'} /> 
                     {offer.likes.length}
                   </button>
                </div>

                <div style={{ fontSize: '0.9rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '15px' }}>
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <MapPin size={16} /> {offer.location}
                  </span>
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Calendar size={16} /> {offer.validDays.join(', ')}
                  </span>
                  <p style={{ margin: '5px 0', fontStyle: 'italic', color: '#374151' }}>
                    "{offer.description}"
                  </p>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleSave(offer._id)} 
                    style={{ padding: '8px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', color: '#374151' }}
                  >
                    {offer.isSaved ? 'Unsave' : 'Save'}
                  </button>
                  
                  <button 
                    onClick={() => setSelectedOffer(offer)} 
                    disabled={isGray}
                    style={{ 
                      padding: '8px', 
                      background: isGray ? '#9ca3af' : '#10b981', 
                      color: 'white', border: 'none', borderRadius: '6px', 
                      cursor: isGray ? 'not-allowed' : 'pointer', fontWeight: 'bold' 
                    }}
                  >
                    Use Now
                  </button>
                </div>
                
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <a href={`tel:${offer.phoneNumber}`} style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={14} /> Call Restaurant
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- QR CODE MODAL --- */}
      {selectedOffer && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', textAlign: 'center', maxWidth: '90%', width: '350px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <h3 style={{ marginTop: 0, color: '#166534' }}>{selectedOffer.title}</h3>
            <p style={{ color: '#4b5563' }}>at {selectedOffer.restaurantName}</p>
            
            <div style={{ background: 'white', padding: '15px', display: 'inline-block', border: '2px solid #e5e7eb', borderRadius: '8px', margin: '15px 0' }}>
              <QRCodeSVG 
                value={`OFFER:${selectedOffer._id}-USER:${user._id}`} 
                size={180} 
                level="H"
              />
            </div>
            
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '20px' }}>
              Show this QR code to the staff. <br/> Once they verify, click the button below.
            </p>

            <button 
              onClick={() => handleClaim(selectedOffer._id)} 
              style={{ 
                width: '100%', background: '#166534', color: 'white', padding: '12px', 
                border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', 
                cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' 
              }}
            >
              <CheckCircle size={20} /> Record My Saving
            </button>
            
            <button 
              onClick={() => setSelectedOffer(null)} 
              style={{ marginTop: '15px', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;