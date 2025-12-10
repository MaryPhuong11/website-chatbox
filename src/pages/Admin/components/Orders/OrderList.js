import React from 'react';
import { FaEye } from 'react-icons/fa';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import './OrderList.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { variant: 'warning', text: 'Đã thanh toán' },
    processing: { variant: 'info', text: 'Chờ thanh toán' },
   
  };

  const config = statusConfig[status] || { variant: 'secondary', text: status };
  return <span className={`status-badge ${config.variant}`}>{config.text}</span>;
};

const OrderList = ({ orders, onViewDetails, isLoading }) => {
  if (isLoading) {
    return <div className="loading-spinner">Loading orders...</div>;
  }

  return (
    <div className="orders-table">
      <table>
        <thead>
          <tr>
            <th>Mã đơn hàng</th>
            <th>Khách hàng</th>
            <th>Tổng tiền</th>
            <th>Thanh toán</th>
            <th>Trạng thái</th>
            <th>Ngày đặt</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  <div className="customer-info">
                    <div>{order.userName}</div>
                    <small>{order.userEmail}</small>
                  </div>
                </td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td>
                  {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'VNPay'}
                </td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  {format(new Date(order.createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon view"
                      onClick={() => onViewDetails(order)}
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-data">
                Không có đơn hàng nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList; 