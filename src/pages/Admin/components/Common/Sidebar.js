import React from 'react';
import { FaBox, FaShoppingCart, FaUsers, FaSignOutAlt, FaList } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ activeTab, onTabChange }) => {
  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => onTabChange('products')}
        >
          <FaBox /> Products
        </button>
        <button 
          className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => onTabChange('categories')}
        >
          <FaList /> Categories
        </button>
        <button 
          className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => onTabChange('orders')}
        >
          <FaShoppingCart /> Orders
        </button>
        <button 
          className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => onTabChange('users')}
        >
          <FaUsers /> Users
        </button>
        <button className="nav-item logout">
          <FaSignOutAlt /> Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar; 