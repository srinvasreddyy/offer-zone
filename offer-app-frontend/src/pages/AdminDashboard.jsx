import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash, Eye, EyeOff } from 'lucide-react';

const daysOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AdminDashboard = () => {
  const [offers, setOffers] = useState([]);
  const [formData, setFormData] = useState({
    title: '', restaurantName: '', location: '', description: '', phoneNumber: '', validDays: []
  });

  const fetchOffers = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/offers`);
    setOffers(res.data);
  };

  useEffect(() => { fetchOffers(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCheckbox = (day) => {
    setFormData(prev => ({
      ...prev,
      validDays: prev.validDays.includes(day) 
        ? prev.validDays.filter(d => d !== day) 
        : [...prev.validDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${import.meta.env.VITE_API_URL}/offers`, formData);
    fetchOffers();
    setFormData({ title: '', restaurantName: '', location: '', description: '', phoneNumber: '', validDays: [] });
  };

  const toggleStatus = async (id, currentStatus) => {
    await axios.put(`${import.meta.env.VITE_API_URL}/offers/${id}`, { isActive: !currentStatus });
    fetchOffers();
  };

  const deleteOffer = async (id) => {
    if(confirm('Are you sure?')) {
      await axios.delete(`${import.meta.env.VITE_API_URL}/offers/${id}`);
      fetchOffers();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      
      {/* Create Offer Form */}
      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', marginBottom: '20px' }}>
        <h3>Add New Offer</h3>
        <input name="title" placeholder="Offer Title (e.g., 25% OFF)" value={formData.title} onChange={handleChange} required style={{ display: 'block', margin: '10px 0', width: '100%' }} />
        <input name="restaurantName" placeholder="Restaurant Name" value={formData.restaurantName} onChange={handleChange} required style={{ display: 'block', margin: '10px 0', width: '100%' }} />
        <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required style={{ display: 'block', margin: '10px 0', width: '100%' }} />
        <input name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required style={{ display: 'block', margin: '10px 0', width: '100%' }} />
        <textarea name="description" placeholder="Description (Emojis supported 🍕)" value={formData.description} onChange={handleChange} style={{ display: 'block', margin: '10px 0', width: '100%' }} />
        
        <div style={{ margin: '10px 0' }}>
          <strong>Valid Days: </strong>
          {daysOptions.map(day => (
            <label key={day} style={{ marginRight: '10px' }}>
              <input type="checkbox" checked={formData.validDays.includes(day)} onChange={() => handleCheckbox(day)} /> {day}
            </label>
          ))}
        </div>
        
        <button type="submit" style={{ background: 'blue', color: 'white', padding: '10px 20px', border: 'none' }}>Add Offer</button>
      </form>

      {/* Offers List */}
      <h3>Manage Offers</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', background: '#eee' }}>
            <th>Title</th>
            <th>Restaurant</th>
            <th>Claims</th>
            <th>Likes</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map(offer => (
            <tr key={offer._id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{offer.title}</td>
              <td>{offer.restaurantName}</td>
              <td>{offer.claimsCount}</td>
              <td>{offer.likes.length}</td>
              <td>{offer.isActive ? <span style={{color:'green'}}>Active</span> : <span style={{color:'red'}}>Inactive</span>}</td>
              <td>
                <button onClick={() => toggleStatus(offer._id, offer.isActive)} style={{ marginRight: '10px' }}>
                  {offer.isActive ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
                <button onClick={() => deleteOffer(offer._id)} style={{ color: 'red' }}><Trash size={16}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;