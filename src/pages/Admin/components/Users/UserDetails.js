import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import './UserDetails.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { variant: 'warning', text: 'Chờ thanh toán' },
    processing: { variant: 'info', text: 'Đang xử lý' },
    shipping: { variant: 'primary', text: 'Đang giao hàng' },
    completed: { variant: 'success', text: 'Hoàn thành' },
    cancelled: { variant: 'danger', text: 'Đã hủy' }
  };

  const config = statusConfig[status] || { variant: 'secondary', text: status };
  return <span className={`status-badge ${config.variant}`}>{config.text}</span>;
};

const UserDetails = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="modal-overlay" style={{ paddingTop: '70px' }}>
      <div className="modal-content user-details">
        <div className="modal-header">
          <h2>Chi tiết người dùng</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="user-info">
          <div className="user-header">
            <div className="user-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-basic-info">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <p>{user.phone || 'Chưa có số điện thoại'}</p>
            </div>
          </div>

          <div className="info-section">
            <h3>Thông tin chung</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Vai trò:</span>
                <span className="value">{user.role === 'admin' ? 'Admin' : 'Người dùng'}</span>
              </div>
              <div className="info-item">
                <span className="label">Ngày tạo:</span>
                <span className="value">
                  {format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Số đơn hàng:</span>
                <span className="value">{user.orderCount}</span>
              </div>
              <div className="info-item">
                <span className="label">Số đánh giá:</span>
                <span className="value">{user.reviewCount}</span>
              </div>
              <div className="info-item">
                <span className="label">Sản phẩm yêu thích:</span>
                <span className="value">{user.wishlistCount}</span>
              </div>
            </div>
          </div>

          {user.addresses && user.addresses.length > 0 && (
            <div className="info-section">
              <h3>Địa chỉ</h3>
              <div className="addresses-list">
                {user.addresses.map((address) => (
                  <div key={address.id} className="address-item">
                    <p><strong>{address.fullName}</strong> - {address.phone}</p>
                    <p>
                      {address.detail}, {address.ward}, {address.district}, {address.province}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.orders && user.orders.length > 0 && (
            <div className="info-section">
              <h3>Đơn hàng gần đây</h3>
              <div className="recent-orders">
                <table>
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                      <th>Ngày đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td>{formatCurrency(order.totalAmount)}</td>
                        <td>
                          {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: vi })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails; 