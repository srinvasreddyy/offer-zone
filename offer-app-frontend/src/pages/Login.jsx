import { useState, useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
        token: credentialResponse.credential
      });
      login(res.data, res.data.token);
      navigate(res.data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      alert('Google Login Failed');
    }
  };

  const sendOtp = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/send-otp`, { email });
      setStep(2);
    } catch (error) {
      alert('Error sending OTP');
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login-otp`, { email, otp });
      login(res.data, res.data.token);
      navigate(res.data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      alert('Invalid OTP');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card animate-slide-up" style={{ padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <UtensilsCrossed size={30} color="#FF6B6B" />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#333' }}>Welcome Back</h2>
          <p style={{ color: '#666' }}>Login to grab the tastiest offers around.</p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} theme="filled_blue" shape="pill" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0', color: '#aaa' }}>
          <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
          <span style={{ fontSize: '0.8rem' }}>OR CONTINUE WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
        </div>

        {step === 1 ? (
          <div className="animate-fade-in">
            <input 
              type="email" 
              className="input-field"
              placeholder="name@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: '15px' }}
            />
            <button className="btn btn-primary" onClick={sendOtp} style={{ width: '100%' }}>
              Send OTP <ArrowRight size={18}/>
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <input 
              type="text" 
              className="input-field"
              placeholder="Enter 6-digit OTP" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)}
              style={{ marginBottom: '15px', letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
            />
            <button className="btn btn-primary" onClick={verifyOtp} style={{ width: '100%' }}>
              Verify & Login
            </button>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', marginTop: '15px', color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}>
              Change Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;