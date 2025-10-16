import React, { useState } from 'react';

const Auth = () => {
  const [isDoctor, setIsDoctor] = useState(true);
  const [isSignIn, setIsSignIn] = useState(true);

  return (
<div className="auth-card">
      <h1>{isDoctor ? 'Doctor' : 'Client'} Authentication</h1>
      <div className="role-selector">
        <button onClick={() => setIsDoctor(true)} className={isDoctor ? 'active' : ''}>Doctor</button>
        <button onClick={() => setIsDoctor(false)} className={!isDoctor ? 'active' : ''}>Client</button>
      </div>

      <h2>{isSignIn ? 'Sign In' : 'Sign Up'}</h2>

      <form className="auth-form">
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
