import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './ProductList.css';

const ProductList = ({ products, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return <div className="loading-spinner">Loading products...</div>;
  }

  return (
    <div className="products-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  {product.imgUrl ? (
                    <img 
                      src={`${product.imgUrl}`} 
                      alt={product.productName}
                      className="product-image"
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </td>
                <td>{product.productName}</td>
                <td>{product.category?.name || 'N/A'}</td>
                <td>${product.price}</td>
                <td>
                  <div className="product-description">
                    {product.shortDesc || 'No description'}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon edit"
                      onClick={() => onEdit(product)}
                      title="Edit Product"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => onDelete(product, 'product')}
                      title="Delete Product"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-data">
                Không tìm thấy sản phẩm nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList; 