import { lazy, Suspense, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Loader from "./components/Loader/Loader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "./app/features/cart/cartSlice";
import { getCartFromServer } from "./app/features/cart/cartApi";
import StoreList from './components/StoreList';
import StoreDetail from './components/StoreDetail';
import Chatbox from "./components/Chatbox/Chatbox";



const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const Cart = lazy(() => import("./pages/Cart"));
const Product = lazy(() => import("./pages/Product"));
const Admin = lazy(() => import("./pages/Admin/Admin"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const Payment = lazy(() => import("./pages/Payment/Payment"));
const VNPayCallback = lazy(() => import("./pages/Payment/VNPayCallback"));
const Orders= lazy(() => import("./pages/Orders/Orders"));
const UserInfo= lazy(()=> import("./components/UserInfo"));

const UserInfoWrapper = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user?.id) return <p className="text-center py-4">Vui lòng đăng nhập.</p>;
  return <UserInfo userId={user.id} />;
};
function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  
  // Lấy userId từ Redux store hoặc localStorage
  const getUserId = () => {
    if (user?.id) return user.id;
    try {
      const localUser = JSON.parse(localStorage.getItem("user") || "null");
      return localUser?.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      if (parsedUser?.id) {
        getCartFromServer(parsedUser.id)
          .then(serverCart => {
            const mappedCart = (serverCart.cartList || []).map(item => ({
              id: item.product.id,
              productName: item.product.productName,
              imgUrl: item.product.imgUrl,
              price: Number(item.product.price),
              qty: item.quantity,
            }));
            dispatch(setCart(mappedCart));
            localStorage.setItem("cartList", JSON.stringify(mappedCart));
          })
          .catch(error => {
            console.error("Failed to fetch cart:", error);
            // Hiển thị thông báo lỗi cho người dùng nếu cần
          });
      }
    } catch (error) {
      console.error("Invalid user data in localStorage:", error);
    }
  }
}, [dispatch]);

  return (
    <Suspense fallback={<Loader />}>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/vnpay-return" element={<VNPayCallback />} />
          <Route path="/store" element={<StoreList />} />
          <Route path="/store/:id" element={<StoreDetail />} />
          <Route path="/orders" element={<Orders />} /> 
          <Route path="/userinfo" element={<UserInfoWrapper />} />
        </Routes>
        <Footer />
        <Chatbox userId={getUserId()} />
      </Router>
    </Suspense>
  );
}

export default App;
