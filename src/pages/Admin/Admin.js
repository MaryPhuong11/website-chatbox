//Để tạo và quản lý trạng thái và lifecycle trong component React.
import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

// Components
//thanh menu bên cạnh
import Sidebar from './components/Common/Sidebar';
import ProductList from './components/Products/ProductList';
import ProductForm from './components/Products/ProductForm';
import CategoryList from './components/Categories/CategoryList';
import CategoryForm from './components/Categories/CategoryForm';
import DeleteModal from './components/Common/DeleteModal';
import OrderList from './components/Orders/OrderList';
import OrderDetails from './components/Orders/OrderDetails';
import UserList from './components/Users/UserList';
import UserDetails from './components/Users/UserDetails';

const API_URL = 'http://localhost:5000/api';


const Admin = () => {

  const navigate = useNavigate();

useEffect(() => {
  const userData = localStorage.getItem('user');
  if (!userData) {
    toast.error('Vui lòng đăng nhập');
    return navigate('/login');
  }

  const user = JSON.parse(userData);
  if (user.role !== 'ADMIN') {
    toast.error('Bạn không có quyền truy cập');
    return navigate('/');
  }
}, []);

  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);

 

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, orderStatus, currentPage]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, userSearchQuery, userCurrentPage]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/payments/admin/orders`, {
        params: {
          status: orderStatus || undefined,
          page: currentPage,
          limit: 10
        }
      });
      if (response.data.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/users`, {
        params: {
          search: userSearchQuery || undefined,
          page: userCurrentPage,
          limit: 10
        }
      });
      if (response.data.success) {
        setUsers(response.data.users);
        setUserTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteClick = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteType === 'product') {
        await axios.delete(`${API_URL}/products/${itemToDelete.id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        await axios.delete(`${API_URL}/categories/${itemToDelete.id}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
      setDeleteType('');
    }
  };

  const handleProductSubmit = async (formData) => {
    try {
      if (selectedProduct) {
        //them san pham
        await axios.put(`${API_URL}/products/${selectedProduct.id}`, formData);
        toast.success('Product updated successfully');
      } else {
        //cap nhat sản pham
        await axios.post(`${API_URL}/products`, formData);
        toast.success('Product added successfully');
      }
      //cập nhật lại ds
      fetchProducts();
      //Đóng modal them hoặc xoá
      setShowProductModal(false);
      //Reset giá trị của selectedProduct về null, vì thao tác đã hoàn thành
      setSelectedProduct(null);
    } catch (error) {
      //xử lý lỗi
      console.error('Error saving product:', error);
      toast.error('Operation failed');
    }
  };

  const handleCategorySubmit = async (formData) => {
    try {
      if (selectedCategory) {
        await axios.put(`${API_URL}/categories/${selectedCategory.id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await axios.post(`${API_URL}/categories`, formData);
        toast.success('Category added successfully');
      }
      fetchCategories();
      setShowCategoryModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Operation failed');
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleStatusChange = (e) => {
    setOrderStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewUserDetails = async (user) => {
    try {
      const response = await axios.get(`${API_URL}/users/${user.id}`);
      if (response.data.success) {
        setSelectedUser(response.data.user);
        setShowUserDetails(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      await axios.delete(`${API_URL}/users/${user.id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleUserSearch = (query) => {
    setUserSearchQuery(query);
    setUserCurrentPage(1);
  };

  const handleUserPageChange = (page) => {
    setUserCurrentPage(page);
  };

  const handleProductSearch = (query) => {
    setProductSearchQuery(query);
    setProductCurrentPage(1);
  };

  const handleProductPageChange = (page) => {
    setProductCurrentPage(page);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <div className="products-page">
            <div className="page-header">
              <h2>Product Management</h2>
              <button className="btn-primary" onClick={handleAddProduct}>
                <FaPlus /> Add New Product
              </button>
            </div>
            <ProductList
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteClick}
              isLoading={isLoading}
            />
          </div>
        );

      case 'categories':
        return (
          <div className="categories-page">
            <div className="page-header">
              <h2>Category Management</h2>
              <button className="btn-primary" onClick={handleAddCategory}>
                <FaPlus /> Add New Category
              </button>
            </div>
            <CategoryList
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteClick}
            />
          </div>
        );

      case 'orders':
        return (
          <div className="orders-page">
            <div className="page-header">
              <h2>Quản lý đơn hàng</h2>
              <div className="filters">
                <select
                  value={orderStatus}
                  onChange={handleStatusChange}
                  className="status-filter"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="pending">Đã thanh toán</option>
                  <option value="processing">Chờ thanh toán</option>
                 
                </select>
              </div>
            </div>
            <OrderList
              orders={orders}
              onViewDetails={handleViewOrderDetails}
              isLoading={isLoading}
            />
            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`page-btn ${page === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'users':
        return (
          <div className="users-page">
            <div className="page-header">
              <h2>Quản lý người dùng</h2>
            </div>
            <UserList
              users={users}
              onViewDetails={handleViewUserDetails}
              onDelete={handleDeleteUser}
              isLoading={isLoading}
              searchQuery={userSearchQuery}
              onSearchChange={handleUserSearch}
            />
            {userTotalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: userTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`page-btn ${page === userCurrentPage ? 'active' : ''}`}
                    onClick={() => handleUserPageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="admin-content">
        <header className="content-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          {/* <div className="user-profile">
            <img src="https://via.placeholder.com/40" alt="Admin" />
            <span>Admin User</span>
          </div> */}
        </header>
        <main className="content-main">
          {renderContent()}
        </main>
      </div>

      {showProductModal && (
        <ProductForm
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleProductSubmit}
          product={selectedProduct}
          categories={categories}
        />
      )}

      {showCategoryModal && (
        <CategoryForm
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            setSelectedCategory(null);
          }}
          onSubmit={handleCategorySubmit}
          category={selectedCategory}
        />
      )}

      {showOrderDetails && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {showUserDetails && (
        <UserDetails
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
          }}
        />
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
          setDeleteType('');
        }}
        onConfirm={handleDeleteConfirm}
        itemName={itemToDelete?.name || itemToDelete?.productName}
        type={deleteType}
      />
    </div>
  );
};

export default Admin; 