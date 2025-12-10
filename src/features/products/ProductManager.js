import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from './productSlice';
import { fetchCategories } from '../categories/categorySlice';
import axios from 'axios';
import './ProductManager.css'; // Import file CSS mới

const ProductManager = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const categories = useSelector((state) => state.categories.items);

  const [form, setForm] = useState({
    productName: '',
    imgUrl: '',
    price: '',
    shortDesc: '',
    description: '',
    categoryId: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axios.post('http://localhost:5000/api/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.imageUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload ảnh thất bại');
      return '';
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = form.imgUrl;

    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage);
    }

    const data = {
      ...form,
      price: parseFloat(form.price),
      categoryId: parseInt(form.categoryId),
      imgUrl: imageUrl,
    };

    if (editingId) {
      dispatch(updateProduct({ id: editingId, data }));
    } else {
      dispatch(addProduct(data));
    }

    setForm({
      productName: '',
      imgUrl: '',
      price: '',
      shortDesc: '',
      description: '',
      categoryId: '',
    });
    setSelectedImage(null);
    setPreview(null);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setForm({
      productName: product.productName,
      imgUrl: product.imgUrl || '',
      price: product.price,
      shortDesc: product.shortDesc || '',
      description: product.description || '',
      categoryId: product.categoryId.toString(),
    });
    setEditingId(product.id);
    setPreview(product.imgUrl || null);
    setSelectedImage(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      dispatch(deleteProduct(id));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="product-manager">
      <h2>Quản lý sản phẩm</h2>
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="productName">Tên sản phẩm:</label>
          <input
            id="productName"
            name="productName"
            value={form.productName}
            onChange={handleChange}
            placeholder="Tên sản phẩm"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Chọn ảnh:</label>
          <input
            type="file"
            id="image"
            onChange={handleImageChange}
          />
        </div>

        {preview && (
          <div className="image-preview">
            <img
              src={preview.startsWith("blob:") ? preview : `http://localhost:5000${preview}`}
              alt="preview"
              style={{ maxWidth: "150px", maxHeight: "150px" }}
            />
          </div>
        )}


        <div className="form-group">
          <label htmlFor="price">Giá:</label>
          <input
            id="price"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Giá"
            type="number"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="shortDesc">Mô tả ngắn:</label>
          <input
            id="shortDesc"
            name="shortDesc"
            value={form.shortDesc}
            onChange={handleChange}
            placeholder="Mô tả ngắn"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả chi tiết:</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả chi tiết"
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Chọn danh mục:</label>
          <select
            id="categoryId"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="submit-button">
          {editingId ? 'Cập nhật' : 'Thêm'}
        </button>
      </form>

      <div className="product-list">
        <h3>Danh sách sản phẩm</h3>
        <ul>
          {products.map((prod) => (
            <li key={prod.id} className="product-item">
              <div className="product-info">
                <strong>{prod.productName}</strong> - {prod.price}đ
                {prod.imgUrl && (
                  <img
                    src={`http://localhost:5000${prod.imgUrl}`} // Đảm bảo đúng địa chỉ phục vụ ảnh
                    alt={prod.productName}
                    width="100"
                  />
                )}

              </div>
              <div className="product-actions">
                <button onClick={() => handleEdit(prod)}>Sửa</button>
                <button onClick={() => handleDelete(prod.id)} className="delete-button">Xóa</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductManager;