import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash, Eye, EyeOff, UploadCloud, MapPin, Plus, Image as ImageIcon } from 'lucide-react';

const daysOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AdminDashboard = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', restaurantName: '', location: '', description: '', phoneNumber: ''
  });
  const [selectedDays, setSelectedDays] = useState([]);

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/offers`);
      setOffers(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchOffers(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setImageFile(e.target.files[0]);
  const handleCheckbox = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Please upload an image.");
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('image', imageFile);
    data.append('validDays', selectedDays.join(','));

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/offers`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
      setFormData({ title: '', restaurantName: '', location: '', description: '', phoneNumber: '' });
      setSelectedDays([]); setImageFile(null);
      document.getElementById('fileInput').value = "";
      fetchOffers();
    } catch (error) { alert("Failed to create offer."); } 
    finally { setLoading(false); }
  };

  const toggleStatus = async (id, currentStatus) => {
    try { await axios.put(`${import.meta.env.VITE_API_URL}/offers/${id}`, { isActive: !currentStatus }); fetchOffers(); } catch (e) {}
  };

  const deleteOffer = async (id) => {
    if(confirm('Delete offer?')) { try { await axios.delete(`${import.meta.env.VITE_API_URL}/offers/${id}`); fetchOffers(); } catch (e) {} }
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
        <h2>Admin Dashboard</h2>
        <span className="badge badge-active" style={{ fontSize: '0.9rem' }}>{offers.length} Offers Live</span>
      </div>
      
      {/* Create Form */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '40px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
          <div style={{ background: '#FF6B6B', color: 'white', padding: '5px', borderRadius: '8px' }}><Plus size={20}/></div>
          Create New Offer
        </h3>
        
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <input name="title" className="input-field" placeholder="Offer Title (e.g. 50% OFF)" value={formData.title} onChange={handleChange} required />
            <input name="restaurantName" className="input-field" placeholder="Restaurant Name" value={formData.restaurantName} onChange={handleChange} required />
            <input name="location" className="input-field" placeholder="Location" value={formData.location} onChange={handleChange} required />
            <input name="phoneNumber" className="input-field" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required />
          </div>

          <textarea name="description" className="input-field" placeholder="Description..." value={formData.description} onChange={handleChange} style={{ minHeight: '100px', marginBottom: '20px', fontFamily: 'inherit' }} />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ border: '2px dashed #ccc', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }} onClick={() => document.getElementById('fileInput').click()}>
              <ImageIcon size={30} color="#ccc" />
              <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#666' }}>{imageFile ? imageFile.name : "Click to Upload Image"}</p>
              <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} required />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '0.9rem' }}>Valid Days</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {daysOptions.map(day => (
                  <label key={day} style={{ 
                    cursor: 'pointer', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', 
                    background: selectedDays.includes(day) ? '#FFD93D' : '#eee',
                    color: selectedDays.includes(day) ? '#333' : '#666',
                    transition: 'all 0.2s', fontWeight: '500'
                  }}>
                    <input type="checkbox" checked={selectedDays.includes(day)} onChange={() => handleCheckbox(day)} style={{ display: 'none' }} /> 
                    {day.slice(0,3)}
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Uploading...' : <><UploadCloud size={20}/> Publish Offer</>}
          </button>
        </form>
      </div>

      {/* Offers Table */}
      <h3 style={{ marginBottom: '15px' }}>Active Offers</h3>
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee', color: '#666', textAlign: 'left' }}>
                <th style={{ padding: '15px' }}>Offer</th>
                <th style={{ padding: '15px' }}>Stats</th>
                <th style={{ padding: '15px' }}>Status</th>
                <th style={{ padding: '15px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(offer => (
                <tr key={offer._id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={offer.image} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{offer.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{offer.restaurantName}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px', color: '#666' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <span style={{ whiteSpace: 'nowrap' }}>Redeemed: <b>{offer.claimsCount}</b></span>
                      <span style={{ whiteSpace: 'nowrap' }}>Liked: <b>{offer.likes.length}</b></span>
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span className={offer.isActive ? "badge badge-active" : "badge badge-inactive"}>
                      {offer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => toggleStatus(offer._id, offer.isActive)} className="btn btn-outline" style={{ padding: '6px', borderRadius: '8px' }}>
                        {offer.isActive ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                      <button onClick={() => deleteOffer(offer._id)} className="btn btn-outline" style={{ padding: '6px', borderRadius: '8px', color: '#ff4444', borderColor: '#ff4444' }}>
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
    </div>
  );
};

export default AdminDashboard;