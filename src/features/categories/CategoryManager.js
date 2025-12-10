import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from './categorySlice';
import './CategoryManager.css'; // Import file CSS mới

const CategoryManager = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.items);

  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    if (editingId) {
      dispatch(updateCategory({ id: editingId, data: { name } }));
    } else {
      dispatch(addCategory({ name }));
    }

    setName('');
    setEditingId(null);
  };

  const handleEdit = (cat) => {
    setName(cat.name);
    setEditingId(cat.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      dispatch(deleteCategory(id));
    }
  };

  return (
    <div className="category-manager">
      <h2>Quản lý Danh Mục</h2>
      <form className="category-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category-name">Tên danh mục:</label>
          <input
            id="category-name"
            type="text"
            placeholder="Nhập tên danh mục"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          {editingId ? 'Cập nhật' : 'Thêm'}
        </button>
      </form>

      <div className="category-list">
        <h3>Danh sách danh mục</h3>
        <ul>
          {categories.map((cat) => (
            <li key={cat.id} className="category-item">
              <span>{cat.name}</span>
              <div className="category-actions">
                <button onClick={() => handleEdit(cat)} className="edit-button">
                  Sửa
                </button>
                <button onClick={() => handleDelete(cat.id)} className="delete-button">
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryManager;
