import React, { useState, useEffect } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const API_URL = 'http://localhost:5000/api';

const AddressSelector = ({ onSelectAddress }) => {
  const { user } = useSelector((state) => state.user);
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detail: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/addresses/${user.id}`);
      const fetchedAddresses = response.data || [];
      setAddresses(fetchedAddresses);

      const defaultAddr = fetchedAddresses.find((addr) => addr.isDefault) || 
                         (fetchedAddresses.length > 0 ? fetchedAddresses[0] : null);
      setDefaultAddress(defaultAddr);
      onSelectAddress(defaultAddr);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      if (
        !newAddress.fullName.trim() ||
        !newAddress.phone.trim() ||
        !newAddress.province.trim() ||
        !newAddress.district.trim() ||
        !newAddress.ward.trim() ||
        !newAddress.detail.trim()
      ) {
        toast.warning('Vui lòng điền đầy đủ thông tin');
        return;
      }

      if (!/^\d{10}$/.test(newAddress.phone.trim())) {
        toast.warning('Số điện thoại phải có đúng 10 chữ số');
        return;
      }

      const response = await axios.post(`${API_URL}/addresses`, {
        ...newAddress,
        userId: user.id,
      });

      setAddresses([...addresses, response.data]);
      setShowAddModal(false);
      setNewAddress({
        fullName: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        detail: '',
      });
      toast.success('Thêm địa chỉ thành công');
      await fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thêm địa chỉ mới');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await axios.put(`${API_URL}/addresses/${addressId}/default`, {
        userId: user.id,
      });
      await fetchAddresses();
      toast.success('Đã cập nhật địa chỉ mặc định');
      setShowAllModal(false);
    } catch (error) {
      toast.error('Không thể cập nhật địa chỉ mặc định');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await axios.delete(`${API_URL}/addresses/${addressId}`);
      const updatedAddresses = addresses.filter((addr) => addr.id !== addressId);
      setAddresses(updatedAddresses);
      if (defaultAddress?.id === addressId) {
        const newDefault = updatedAddresses.length > 0 ? updatedAddresses[0] : null;
        setDefaultAddress(newDefault);
        onSelectAddress(newDefault);
      }
      toast.success('Xóa địa chỉ thành công');
    } catch (error) {
      toast.error('Không thể xóa địa chỉ');
    }
  };

  if (!user || !user.id) {
    return <div className="text-center mt-4">Vui lòng đăng nhập để quản lý địa chỉ</div>;
  }

  return (
    <div className="address-selector mb-4">
      <h4>Địa chỉ nhận hàng</h4>
      {loading ? (
        <div className="text-center mt-3">Đang tải địa chỉ...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center mt-3">
          <p>Bạn chưa có địa chỉ nhận hàng.</p>
          <Button
            variant="primary"
            onClick={() => {
              console.log('Opening add address modal');
              setShowAddModal(true);
            }}
          >
            + Thêm địa chỉ mới
          </Button>
        </div>
      ) : (
        <>
          {defaultAddress && (
            <div className="default-address p-3 mb-3 border rounded">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center">
                    <strong>{defaultAddress.fullName}</strong>
                    <span className="mx-2">-</span>
                    <span>{defaultAddress.phone}</span>
                    <span className="badge bg-primary ms-2">Mặc định</span>
                  </div>
                  <div className="text-muted mt-1">
                    {defaultAddress.detail}, {defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.province}
                  </div>
                </div>
              </div>
              <div className="mt-3 d-flex gap-2">
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    console.log('Opening add address modal');
                    setShowAddModal(true);
                  }}
                >
                  + Thêm địa chỉ mới
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal to add new address */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm địa chỉ mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control
                type="text"
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value.trim() })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="tel"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.trim() })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tỉnh/Thành phố</Form.Label>
              <Form.Control
                type="text"
                value={newAddress.province}
                onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value.trim() })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quận/Huyện</Form.Label>
              <Form.Control
                type="text"
                value={newAddress.district}
                onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value.trim() })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phường/Xã</Form.Label>
              <Form.Control
                type="text"
                value={newAddress.ward}
                onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value.trim() })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ chi tiết</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newAddress.detail}
                onChange={(e) => setNewAddress({ ...newAddress, detail: e.target.value.trim() })}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddAddress}>
            Thêm địa chỉ
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal to show all addresses */}
      <Modal show={showAllModal} onHide={() => setShowAllModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tất cả địa chỉ của bạn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="address-list">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`address-item p-3 mb-3 border rounded ${address.isDefault ? 'border-primary' : ''}`}
              >
                {/* ... Address item content ... */}
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAllModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Thêm địa chỉ mới
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddressSelector;