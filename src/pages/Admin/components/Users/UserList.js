import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import './UserList.css';
import { FaEye, FaTrash } from 'react-icons/fa';

const getRoleBadge = (role) => {
  const roleConfig = {
    admin: { variant: 'danger', text: 'Admin' },
    user: { variant: 'info', text: 'User' }
  };

  const config = roleConfig[role] || { variant: 'secondary', text: role };
  return <span className={`role-badge ${config.variant}`}>{config.text}</span>;
};

const UserList = ({ users, onViewDetails, onDelete, isLoading, searchQuery, onSearchChange }) => {
  if (isLoading) {
    return <div className="loading-spinner">Loading users...</div>;
  }

  return (
    <div className="users-page">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Số đơn hàng</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{user.orderCount}</td>
                  <td>
                    {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon view"
                        onClick={() => onViewDetails(user)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          className="btn-delete"
                          onClick={() => onDelete(user)}
                          title="Xóa người dùng"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList; 