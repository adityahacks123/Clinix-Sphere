import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor', // Default role
  });
  const navigate = useNavigate();

  const { name, email, password, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const setRole = (newRole) => {
    setFormData({ ...formData, role: newRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignIn) {
      try {
        const res = await axios.post('/api/auth/signin', { email, password });
        localStorage.setItem('token', res.data.token);
        if (res.data.role === 'doctor') {
          navigate('/doctor-dashboard');
        } else {
          navigate('/client-dashboard');
        }
      } catch (err) {
        console.error(err.response.data);
      }
    } else {
      try {
        const res = await axios.post('/api/auth/signup', { name, email, password, role });
        localStorage.setItem('token', res.data.token);
        if (role === 'doctor') {
          navigate('/doctor-dashboard');
        } else {
          navigate('/client-dashboard');
        }
      } catch (err) {
        console.error(err.response.data);
      }
    }
  };

  return (
    <div className="auth-card">
      <h1>{role === 'doctor' ? 'Doctor' : 'Client'} Authentication</h1>
      <div className="role-selector">
        <button onClick={() => setRole('doctor')} className={role === 'doctor' ? 'active' : ''}>Doctor</button>
        <button onClick={() => setRole('client')} className={role === 'client' ? 'active' : ''}>Client</button>
      </div>

      <h2>{isSignIn ? 'Sign In' : 'Sign Up'}</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        {!isSignIn && (
          <input
            type="text"
            placeholder="Full Name"
            name="name"
            value={name}
            onChange={onChange}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={onChange}
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={onChange}
        />
        <button type="submit">{isSignIn ? 'Sign In' : 'Sign Up'}</button>
      </form>

      <p className="toggle-auth">
        {isSignIn ? "Don't have an account?" : 'Already have an account?'}
        <button type="button" onClick={() => setIsSignIn(!isSignIn)}>
          {isSignIn ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  );
};

export default Auth;
