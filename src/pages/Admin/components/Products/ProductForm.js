import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ProductForm.css';

const API_URL = 'http://localhost:5000/api';

const ProductForm = ({ isOpen, onClose, onSubmit, product, categories }) => {
  const [formData, setFormData] = useState({
    productName: '',
    categoryId: '',
    price: '',
    shortDesc: '',
    description: '',
    imgUrl: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName || '',
        categoryId: product.categoryId || '',
        price: product.price || '',
        shortDesc: product.shortDesc || '',
        description: product.description || '',
        imgUrl: product.imgUrl || ''
      });
      setImagePreview(product.imgUrl ? `${product.imgUrl}` : null);
    } else {
      setFormData({
        productName: '',
        categoryId: '',
        price: '',
        shortDesc: '',
        description: '',
        imgUrl: ''
      });
      setImagePreview(null);
    }
  }, [product]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${API_URL}/products/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFormData(prev => ({
        ...prev,
        imgUrl: response.data.imageUrl
      }));
      setImagePreview(`${response.data.imageUrl}`);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ paddingTop: '70px' }}>
      <div className="modal-content product-form">
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({...formData, productName: e.target.value})}
                required
                placeholder="Enter product name"
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
                placeholder="Enter price"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Short Description</label>
              <textarea
                value={formData.shortDesc}
                onChange={(e) => setFormData({...formData, shortDesc: e.target.value})}
                placeholder="Enter short description"
                rows="2"
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter full description"
                rows="4"
              />
            </div>

            <div className="form-group full-width">
              <label>Product Image</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="image-upload"
                  className="image-upload-input"
                />
                <label htmlFor="image-upload" className="image-upload-label">
                  {isUploading ? (
                    <span>Uploading...</span>
                  ) : (
                    <span>Choose Image</span>
                  )}
                </label>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button 
                      type="button" 
                      className="remove-image"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({...prev, imgUrl: ''}));
                      }}
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {product ? 'Update Product' : 'Add Product'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 