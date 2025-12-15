import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash, Eye, EyeOff, UploadCloud, MapPin } from 'lucide-react';

const daysOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AdminDashboard = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', 
    restaurantName: '', 
    location: '', 
    description: '', 
    phoneNumber: ''
  });
  const [selectedDays, setSelectedDays] = useState([]);

  // Fetch all offers
  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/offers`);
      setOffers(res.data);
    } catch (error) {
      console.error("Error fetching offers", error);
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  // Handle Text Inputs
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle File Input
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Handle Checkboxes
  const handleCheckbox = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Submit Form with FormData
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Please upload an image for the offer.");
    
    setLoading(true);
    
    // Build FormData for multipart/form-data request
    const data = new FormData();
    data.append('title', formData.title);
    data.append('restaurantName', formData.restaurantName);
    data.append('location', formData.location);
    data.append('description', formData.description);
    data.append('phoneNumber', formData.phoneNumber);
    data.append('image', imageFile); // The file object
    data.append('validDays', selectedDays.join(',')); // Convert array to string

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/offers`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Reset Form
      setFormData({ title: '', restaurantName: '', location: '', description: '', phoneNumber: '' });
      setSelectedDays([]);
      setImageFile(null);
      document.getElementById('fileInput').value = ""; // Reset file input UI
      
      fetchOffers(); // Refresh list
    } catch (error) {
      console.error(error);
      alert("Failed to create offer. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Active/Inactive
  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/offers/${id}`, { isActive: !currentStatus });
      fetchOffers();
    } catch (error) {
      alert("Error updating status");
    }
  };

  // Delete Offer
  const deleteOffer = async (id) => {
    if(confirm('Are you sure you want to delete this offer?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/offers/${id}`);
        fetchOffers();
      } catch (error) {
        alert("Error deleting offer");
      }
    }
  };

  const inputStyle = {
    padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%', boxSizing: 'border-box'
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Admin Dashboard</h2>
      
      {/* --- CREATE OFFER FORM --- */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '40px' }}>
        <h3 style={{ marginTop: 0 }}>Create New Offer</h3>
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            <input name="title" placeholder="Offer Title (e.g. 50% OFF)" value={formData.title} onChange={handleChange} required style={inputStyle} />
            <input name="restaurantName" placeholder="Restaurant Name" value={formData.restaurantName} onChange={handleChange} required style={inputStyle} />
            <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required style={inputStyle} />
            <input name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required style={inputStyle} />
          </div>

          <textarea name="description" placeholder="Description & Terms (Emojis supported 🍕)" value={formData.description} onChange={handleChange} style={{ ...inputStyle, minHeight: '80px', marginBottom: '15px' }} />
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Offer Image</label>
            <div style={{ border: '2px dashed #d1d5db', padding: '20px', textAlign: 'center', borderRadius: '8px' }}>
              <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} required />
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <strong style={{ display: 'block', marginBottom: '8px' }}>Valid Days:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {daysOptions.map(day => (
                <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f3f4f6', padding: '5px 10px', borderRadius: '20px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedDays.includes(day)} onChange={() => handleCheckbox(day)} /> 
                  {day}
                </label>
              ))}
            </div>
          </div>
          
          <button type="submit" disabled={loading} style={{ 
            background: loading ? '#9ca3af' : '#2563eb', color: 'white', padding: '12px 24px', 
            border: 'none', borderRadius: '8px', cursor: loading ? 'wait' : 'pointer', 
            fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' 
          }}>
            {loading ? 'Uploading...' : <><UploadCloud size={20}/> Publish Offer</>}
          </button>
        </form>
      </div>

      {/* --- OFFERS LIST --- */}
      <h3>Active Offers Management</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <thead>
            <tr style={{ background: '#f9fafb', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px' }}>Img</th>
              <th style={{ padding: '12px' }}>Title</th>
              <th style={{ padding: '12px' }}>Restaurant</th>
              <th style={{ padding: '12px' }}>Stats</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(offer => (
              <tr key={offer._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px' }}>
                  <img src={offer.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{offer.title}</td>
                <td style={{ padding: '12px' }}>
                  {offer.restaurantName}
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <MapPin size={12}/> {offer.location}
                  </div>
                </td>
                <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                  <div>Claims: <b>{offer.claimsCount}</b></div>
                  <div>Likes: <b>{offer.likes.length}</b></div>
                </td>
                <td style={{ padding: '12px' }}>
                  {offer.isActive 
                    ? <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Active</span> 
                    : <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Inactive</span>
                  }
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => toggleStatus(offer._id, offer.isActive)} title="Toggle Visibility" style={{ background: 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '5px', cursor: 'pointer' }}>
                      {offer.isActive ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                    <button onClick={() => deleteOffer(offer._id)} title="Delete" style={{ background: '#fee2e2', border: 'none', borderRadius: '4px', padding: '5px', cursor: 'pointer', color: '#dc2626' }}>
                      <Trash size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;