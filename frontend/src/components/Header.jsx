import React from 'react';
import logo from '../assets/jkuat-logo.png';

const Header = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="JKUAT Logo" className="jkuat-logo-img" />
      </div>
      <h1>JKUAT Secure Voting System</h1>
      <p className="subtitle">Face Recognition-Based Authentication | JKUSA Elections</p>
    </header>
  );
};

export default Header;