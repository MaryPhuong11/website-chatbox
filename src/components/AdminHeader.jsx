// src/components/AdminHeader.js
import React from 'react';
import { Link } from 'react-router-dom';
import './AdminHeader.css';

const AdminHeader = () => {
  return (
    <header className="admin-header">
      <div className="logo">🛒 Admin Panel</div>
      <nav className="admin-nav">
        <Link to="/admin">Trang chủ</Link>
        <Link to="/admin/categories">Danh mục</Link>
        <Link to="/admin/products">Sản phẩm</Link>
        <button onClick={() => alert('Đăng xuất')}>Đăng xuất</button>
      </nav>
    </header>
  );
};

export default AdminHeader;
