import React from 'react';
import { useSelector } from 'react-redux';

const OrderSummary = ({ voucher, shippingFee = 0 }) => {
  const { cartList } = useSelector((state) => state.cart);

  const subtotal = cartList.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const discount = voucher
    ? voucher.discountType === 'percentage'
      ? (subtotal * voucher.value) / 100
      : voucher.value
    : 0;

  const total = subtotal - discount + shippingFee;

  return (
    <div className="order-summary">
      <h4>Tổng đơn hàng</h4>
      <div className="summary-item d-flex justify-content-between mb-2">
        <span>Tạm tính:</span>
        <span>{subtotal.toLocaleString('vi-VN')}đ</span>
      </div>
      {voucher && (
        <div className="summary-item d-flex justify-content-between mb-2 text-success">
          <span>Giảm giá:</span>
          <span>-{discount.toLocaleString('vi-VN')}đ</span>
        </div>
      )}
      <div className="summary-item d-flex justify-content-between mb-2">
        <span>Phí vận chuyển:</span>
        <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
      </div>
      <hr />
      <div className="summary-item d-flex justify-content-between mb-2">
        <strong>Tổng cộng:</strong>
        <strong className="text-primary">
          {total.toLocaleString('vi-VN')}đ
        </strong>
      </div>
    </div>
  );
};

export default OrderSummary; 