import { useState, useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP

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
      alert('OTP sent to your email');
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
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '20px', border: '1px solid #ddd' }}>
      <h2>Welcome Back</h2>
      
      {/* Google Login */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} />
      </div>

      <p>OR</p>

      {/* OTP Login */}
      {step === 1 ? (
        <div>
          <input 
            type="email" 
            placeholder="Enter Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '8px', width: '80%', marginBottom: '10px' }}
          />
          <br/>
          <button onClick={sendOtp} style={{ padding: '8px 20px', cursor: 'pointer' }}>Get OTP</button>
        </div>
      ) : (
        <div>
          <input 
            type="text" 
            placeholder="Enter OTP" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)}
            style={{ padding: '8px', width: '80%', marginBottom: '10px' }}
          />
          <br/>
          <button onClick={verifyOtp} style={{ padding: '8px 20px', cursor: 'pointer' }}>Login</button>
        </div>
      )}
    </div>
  );
};

export default Login;