import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const VoucherInput = ({ onVoucherApplied }) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.warning('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/vouchers/apply', {
        code: voucherCode
      });
      
      setAppliedVoucher(response.data);
      onVoucherApplied(response.data);
      toast.success('Áp dụng mã giảm giá thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    onVoucherApplied(null);
  };

  return (
    <div className="voucher-input mb-4">
      <h4>Mã giảm giá</h4>
      {appliedVoucher ? (
        <Alert variant="success" className="d-flex justify-content-between align-items-center">
          <div>
            <strong>{appliedVoucher.code}</strong> - 
            {appliedVoucher.discountType === 'percentage' 
              ? `Giảm ${appliedVoucher.value}%`
              : `Giảm ${appliedVoucher.value.toLocaleString('vi-VN')}đ`}
          </div>
          <Button variant="outline-danger" size="sm" onClick={handleRemoveVoucher}>
            Xóa
          </Button>
        </Alert>
      ) : (
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="Nhập mã giảm giá"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
          />
          <Button
            variant="primary"
            onClick={handleApplyVoucher}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Áp dụng'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoucherInput; 