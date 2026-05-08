import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

function Header() {
  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <span className="logo-x">X</span><span className="logo-m">M</span>
        </Link>
      </div>
      <div className="header-right">
        <a href="#" className="nav-link">XM Trang web</a>
        <LanguageSelector />
      </div>
    </header>
  );
}

export default Header;
