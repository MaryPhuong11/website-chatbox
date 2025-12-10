import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const API_URL = 'http://localhost:5000/api';

const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { variant: 'warning', text: 'Đã thanh toán' },
    processing: { variant: 'info', text: 'Chờ thanh toán' },
  };

  const config = statusConfig[status] || { variant: 'secondary', text: status };
  return <Badge bg={config.variant}>{config.text}</Badge>;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/payments/orders/${user.id}`);
        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          console.error('Failed to fetch orders:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">Đang tải...</div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Đơn hàng của tôi</h2>
      {orders.length === 0 ? (
        <div className="text-center">Bạn chưa có đơn hàng nào</div>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Mã đơn hàng:</strong> {order.id}
                <br />
                <small>
                  {format(new Date(order.createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}
                </small>
              </div>
              <div className="text-end">
                <div>{getStatusBadge(order.status)}</div>
                <small>
                  {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'VNPay'}
                </small>
              </div>
            </Card.Header>
            <Card.Body>
              <Table responsive>
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
                        <div className="d-flex align-items-center">
                          {item.imgUrl && (
                            <img
                              src={item.imgUrl}
                              alt={item.productName}
                              style={{ width: '50px', marginRight: '10px' }}
                            />
                          )}
                          {item.productName}
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
              </Table>
              <div className="mt-3">
                <strong>Địa chỉ giao hàng:</strong>
                <br />
                {order.shippingAddress.fullName} - {order.shippingAddress.phone}
                <br />
                {order.shippingAddress.detail}, {order.shippingAddress.ward},{' '}
                {order.shippingAddress.district}, {order.shippingAddress.province}
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default Orders;