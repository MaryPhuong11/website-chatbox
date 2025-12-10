import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './CategoryList.css';

const CategoryList = ({ categories, onEdit, onDelete }) => {
  return (
    <div className="categories-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 ? (
            categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon edit"
                      onClick={() => onEdit(category)}
                      title="Edit Category"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => onDelete(category)}
                      title="Delete Category"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="no-data">
                No categories found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList; 