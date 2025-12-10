import React, { useEffect, useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const VNPayCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [tranSactionStatus, setTranSactionStatus] = useState("");
  useEffect(() => {
    const query= new URLSearchParams(location.search)
    const processPaymentResult = async () => {
      try {
        // Lấy tất cả params từ URL
        
        // Gọi API để xác thực kết quả thanh toán
        // const response = await axios.get(`${API_URL}/payments/vnpay-return`, {
        //   params
        // });

        // setPaymentResult(response.data);
         
        setTranSactionStatus(query.get("vnp_TransactionStatus"));
      } catch (error) {
        console.error('Error processing payment result:', error);
        setPaymentResult({
          success: false,
          message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán'
        });
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [])

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h3>Đang xử lý kết quả thanh toán...</h3>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="mx-auto" style={{ maxWidth: '600px' }}>
        <Card.Body className="text-center">
          {tranSactionStatus == "00" ? (
            <>
              <div className="mb-4">
                <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
              </div>
              <h3 className="text-success mb-3">Thanh toán thành công!</h3>
              <p className="mb-4">
                Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
              </p>
              <div className="d-grid gap-2">
                <Button variant="primary" onClick={() => navigate('/orders')}>
                  Xem đơn hàng
                </Button>
                <Button variant="outline-primary" onClick={() => navigate('/')}>
                  Tiếp tục mua sắm
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <i className="fas fa-times-circle text-danger" style={{ fontSize: '4rem' }}></i>
              </div>
              <h3 className="text-danger mb-3">Thanh toán thất bại</h3>
              <p className="mb-4">
                {paymentResult?.message || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.'}
              </p>
              <div className="d-grid gap-2">
                <Button variant="primary" onClick={() => navigate('/payment')}>
                  Thử lại
                </Button>
                <Button variant="outline-primary" onClick={() => navigate('/')}>
                  Về trang chủ
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VNPayCallback; 