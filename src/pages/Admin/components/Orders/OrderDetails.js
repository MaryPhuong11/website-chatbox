import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import './OrderDetails.css';

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

const OrderDetails = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="modal-overlay" style={{ paddingTop: '70px' }}>
      <div className="modal-content order-details">
        <div className="modal-header">
          <h2>Chi tiết đơn hàng #{order.id}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="order-info">
          <div className="info-section">
            <h3>Thông tin khách hàng</h3>
            <p><strong>Tên:</strong> {order.userName}</p>
            <p><strong>Email:</strong> {order.userEmail}</p>
            <p><strong>Số điện thoại:</strong> {order.userPhone}</p>
          </div>

          <div className="info-section">
            <h3>Thông tin đơn hàng</h3>
            <p><strong>Ngày đặt:</strong> {format(new Date(order.createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}</p>
            <p><strong>Trạng thái:</strong> {getStatusBadge(order.status)}</p>
            <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'VNPay'}</p>
          </div>

          <div className="info-section">
            <h3>Địa chỉ giao hàng</h3>
            <p>{order.shippingAddress.fullName} - {order.shippingAddress.phone}</p>
            <p>
              {order.shippingAddress.detail}, {order.shippingAddress.ward},{' '}
              {order.shippingAddress.district}, {order.shippingAddress.province}
            </p>
          </div>
        </div>

        <div className="order-items">
          <h3>Sản phẩm đã đặt</h3>
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th className="text-center">Số lượng</th>
                <th className="text-end">Đơn giá</th>
                <th className="text-end">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="product-info">
                      {item.imgUrl && (
                        <img src={item.imgUrl} alt={item.productName} />
                      )}
                      <span>{item.productName}</span>
                    </div>
                  </td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">{formatCurrency(item.price)}</td>
                  <td className="text-end">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end">
                  <strong>Tổng tiền:</strong>
                </td>
                <td className="text-end">
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
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

export default OrderDetails; 