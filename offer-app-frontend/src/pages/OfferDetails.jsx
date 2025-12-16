import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { 
  MapPin, Phone, Heart, ArrowLeft, Ticket, CheckCircle, Utensils, Clock, AlertCircle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const OfferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/offers/${id}`);
        setOffer(res.data);
      } catch (error) {
        console.error("Failed to fetch offer");
        navigate('/dashboard'); 
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id, navigate]);

  const handleClaim = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/offers/${id}/claim`);
      setShowQR(false);
      setShowSuccessPopup(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Error claiming offer');
    }
  };

  const closePopup = () => {
    setShowSuccessPopup(false);
    navigate('/dashboard');
  };

  if (loading) return <div className="container" style={{padding: '40px', textAlign: 'center'}}>Loading delicious details...</div>;
  if (!offer) return null;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* FIX: Removed fixed height (40vh) and cover. 
         Now using auto height to show full image without zooming/cropping.
      */}
      <div style={{ position: 'relative', width: '100%', backgroundColor: '#f0f0f0' }}>
        <img 
          src={offer.image} 
          alt={offer.title} 
          style={{ 
            width: '100%', 
            height: 'auto', 
            maxHeight: '500px', // Prevent overly tall images
            objectFit: 'contain', // Ensure full image is visible
            display: 'block',
            margin: '0 auto' 
          }} 
        />
        
        {/* Back Button Overlay */}
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <button onClick={() => navigate(-1)} className="btn btn-glass" style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}>
            <ArrowLeft size={20} color="#333" />
          </button>
        </div>

        {/* Title Overlay (Adjusted for flexible height) */}
        <div style={{ 
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', 
          padding: '40px 20px 20px', 
          color: 'white',
          marginTop: '-80px', // Pull up into the image area slightly
          position: 'relative',
          zIndex: 5
        }}>
          <div className="container" style={{ padding: 0 }}>
             <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{offer.title}</h1>
             <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
               <Utensils size={18} /> {offer.restaurantName}
             </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 5 }}>
        <div className="glass-card" style={{ background: 'white', padding: '20px', marginTop: '20px' }}>
          
          <div className="details-grid">
            
            {/* Left Column: Description */}
            <div className="details-content">
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', color: '#666', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18} color="#FF6B6B"/> {offer.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Heart size={18} color="#FF6B6B"/> {offer.likes.length} Likes</span>
              </div>

              {offer.importantNote && (
                <div className="important-note-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <AlertCircle size={18} color="#FFC107" /> 
                    <span>Please Note:</span>
                  </div>
                  {offer.importantNote}
                </div>
              )}

              <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginBottom: '15px' }}>About this Deal</h3>
              <p className="details-description" style={{ fontSize: '1rem' }}>{offer.description}</p>

              <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Validity</h3>
              {(offer.startTime || offer.endTime) && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#555', fontWeight: '500' }}>
                    <Clock size={18} color="#2e7d32" />
                    <span>Time: {offer.startTime || 'Open'} - {offer.endTime || 'Close'}</span>
                 </div>
              )}

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
                {offer.validDays.map(day => (
                  <span key={day} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '20px', color: '#475569' }}>
                    {day}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Action Card */}
            <div>
              <div className="action-card">
                {!showQR ? (
                  <>
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Ready to Eat?</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <a 
                        href={`tel:${offer.phoneNumber}`} 
                        className="btn btn-outline action-btn"
                        style={{ borderColor: '#2563eb', color: '#2563eb', textDecoration: 'none' }}
                      >
                        <Phone size={20} /> Call Now
                      </a>

                      <button 
                        onClick={() => setShowQR(true)}
                        className="btn btn-primary action-btn" 
                        disabled={offer.isClaimed}
                      >
                        {offer.isClaimed ? <><CheckCircle /> Already Claimed</> : <><Ticket /> Redeem Offer</>}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ marginBottom: '15px' }}>Scan to Redeem</h4>
                    <div style={{ background: 'white', padding: '15px', borderRadius: '15px', display: 'inline-block', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                       <QRCodeSVG value={`OFFER:${offer._id}-USER:${user._id}`} size={180} />
                    </div>
                    <button 
                      onClick={handleClaim}
                      className="btn btn-primary action-btn"
                      style={{ background: '#10b981', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                    >
                      Verify & Claim
                    </button>
                    <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '10px', fontWeight: 'bold' }}>
                      * Only for restaurant authorities
                    </p>
                    <button onClick={() => setShowQR(false)} style={{ background: 'none', border: 'none', marginTop: '5px', textDecoration: 'underline', cursor: 'pointer', color: '#666' }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {showSuccessPopup && (
        <div className="modal-overlay animate-fade-in">
          <div className="success-popup animate-pop-in">
             <div style={{ background: '#d1fae5', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={40} color="#059669" />
             </div>
             <h2 style={{ color: '#059669', marginBottom: '10px' }}>Success!</h2>
             <p style={{ color: '#666', marginBottom: '20px' }}>
               You have successfully redeemed this offer. Enjoy your meal!
             </p>
             <button onClick={closePopup} className="btn btn-primary" style={{ width: '100%', background: '#059669' }}>
               Back to Home
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferDetails;