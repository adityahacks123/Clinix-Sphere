import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isDoctor, setIsDoctor] = useState(true);
  const [isSignIn, setIsSignIn] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isSignIn) {
      if (isDoctor) {
        navigate('/doctor-dashboard');
      } else {
        navigate('/client-dashboard');
      }
    }
    // We will add sign-in logic later
  };

  return (
    <div className="auth-card">
      <h1>{isDoctor ? 'Doctor' : 'Client'} Authentication</h1>
      <div className="role-selector">
        <button onClick={() => setIsDoctor(true)} className={isDoctor ? 'active' : ''}>Doctor</button>
        <button onClick={() => setIsDoctor(false)} className={!isDoctor ? 'active' : ''}>Client</button>
      </div>

      <h2>{isSignIn ? 'Sign In' : 'Sign Up'}</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        {!isSignIn && (
          <>
            <input type="text" placeholder="Full Name" />
            <input type="text" placeholder="Phone Number" />
          </>
        )}
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">{isSignIn ? 'Sign In' : 'Sign Up'}</button>
      </form>

      <p className="toggle-auth">
        {isSignIn ? "Don't have an account?" : 'Already have an account?'}
        <button onClick={() => setIsSignIn(!isSignIn)}>
          {isSignIn ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  );
};

export default Auth;
