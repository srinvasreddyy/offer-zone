import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { 
  MapPin, Phone, Calendar, Heart, Share2, ArrowLeft, Ticket, CheckCircle, Utensils
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const OfferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

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
      alert("Offer Redeemed Successfully!");
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Error claiming offer');
    }
  };

  if (loading) return <div className="container" style={{padding: '40px', textAlign: 'center'}}>Loading delicious details...</div>;
  if (!offer) return null;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Hero Image Section */}
      <div style={{ position: 'relative', height: '40vh', minHeight: '300px', width: '100%' }}>
        <img 
          src={offer.image} 
          alt={offer.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <button onClick={() => navigate(-1)} className="btn btn-glass" style={{ background: 'white', borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}>
            <ArrowLeft size={20} color="#333" />
          </button>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '40px 20px 20px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
          <div className="container">
             <h1 style={{ color: 'white', margin: 0, fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{offer.title}</h1>
             <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
               <Utensils size={18} /> {offer.restaurantName}
             </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-30px', position: 'relative', zIndex: 5 }}>
        <div className="glass-card" style={{ background: 'white', padding: '30px' }}>
          
          {/* Main Content Grid */}
          <div className="details-grid">
            
            {/* Left Column: Description */}
            <div className="details-content">
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', color: '#666', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18} color="#FF6B6B"/> {offer.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Heart size={18} color="#FF6B6B"/> {offer.likes.length} Likes</span>
              </div>

              <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginBottom: '15px' }}>About this Deal</h3>
              <p className="details-description">
                {offer.description}
              </p>

              <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Valid Days</h3>
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
                    
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#999', marginTop: '15px' }}>
                      Show QR code at the counter to redeem.
                    </p>
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
                      style={{ background: '#10b981' }}
                    >
                      Verify & Claim
                    </button>
                    <button onClick={() => setShowQR(false)} style={{ background: 'none', border: 'none', marginTop: '10px', textDecoration: 'underline', cursor: 'pointer', color: '#666' }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetails;