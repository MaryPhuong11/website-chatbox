import React from 'react';
import { Form } from 'react-bootstrap';

const PaymentMethodSelector = ({ selectedMethod, onSelectMethod }) => {
  return (
    <div className="payment-method-selector mb-4">
      <h4>Phương thức thanh toán</h4>
      <div className="payment-methods">
        <div className="payment-method-item mb-2">
          <Form.Check
            type="radio"
            id="cod"
            name="paymentMethod"
            label="Thanh toán khi nhận hàng (COD)"
            checked={selectedMethod === 'cod'}
            onChange={() => onSelectMethod('cod')}
          />
        </div>
        <div className="payment-method-item">
          <Form.Check
            type="radio"
            id="vnpay"
            name="paymentMethod"
            label="Thanh toán online qua VNPAY"
            checked={selectedMethod === 'vnpay'}
            onChange={() => onSelectMethod('vnpay')}
          />
          {selectedMethod === 'vnpay' && (
            <div className="vnpay-info mt-2 p-2 bg-light rounded">
              <small className="text-muted">
                Bạn sẽ được chuyển đến trang thanh toán VNPAY để hoàn tất giao dịch
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector; 