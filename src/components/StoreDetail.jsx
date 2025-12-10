import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaMapMarkerAlt, FaPhoneAlt, FaClock, FaArrowLeft } from 'react-icons/fa';

// ─────────────────────────────────────────────────────────────────────────────
// Fix Leaflet default marker icon paths (sẽ lỗi icon khi build production)
// ─────────────────────────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl; // eslint-disable-line camelcase
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


const StoreDetail = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Fetch store info ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/stores/${id}`);
        setStore(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Lỗi khi load dữ liệu cửa hàng:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ─── Loading indicator ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container py-5 text-center">
        <h5 className="text-danger">Không tìm thấy cửa hàng 😥</h5>
        <Link to="/store" className="btn btn-outline-primary mt-3">
          <FaArrowLeft className="me-1" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  // ─── Gradient header style & map frame style ───────────────────────────────
  const headerGradient = {
  background:
    'linear-gradient(90deg, #34d399 0%, #10b981 40%, #059669 70%, #047857 100%)',
};
  const mapFrameStyle = {
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 0.5rem 1.2rem rgba(0,0,0,0.15)',
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container py-4">
      {/* Back */}
      <Link
        to="/store"
        className="btn btn-link px-0 mb-3 text-decoration-none fw-semibold"
      >
        <FaArrowLeft className="me-1" /> Quay lại danh sách
      </Link>

      {/* Card */}
      <div className="card border-0 shadow-lg rounded-4 mb-4">
        <div className="card-header text-white rounded-top-4" style={headerGradient}>
          <h2 className="mb-0 fw-bold">{store.name}</h2>
        </div>
        <div className="card-body bg-light-subtle rounded-bottom-4">
          <p className="mb-2">
            <FaMapMarkerAlt className="text-primary me-2" />
            <strong>Địa chỉ:</strong> {store.address}, {store.ward}, {store.district},{' '}
            {store.city}
          </p>
          <p className="mb-2">
            <FaClock className="text-warning me-2" />
            <strong>Giờ mở cửa:</strong> {store.openTime} – {store.closeTime}
          </p>
          <p className="mb-0">
            <FaPhoneAlt className="text-success me-2" />
            <strong>SĐT:</strong>{' '}
            <a href={`tel:${store.phone}`} className="text-decoration-none fw-medium">
              {store.phone}
            </a>
          </p>
        </div>
      </div>

      {/* Map */}
      {store.latitude && store.longitude && (
        <div style={mapFrameStyle}>
          <MapContainer
            center={[store.latitude, store.longitude]}
            zoom={16}
            scrollWheelZoom={false}
            style={{ height: '420px', width: '100%' }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[store.latitude, store.longitude]}>
              <Popup>
                <strong>{store.name}</strong>
                <br />
                {store.address}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default StoreDetail;
