import { useEffect } from "react";
import { Col, Container, Row, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  addToCart,
  decreaseQty,
  deleteProduct,
  setCart,
} from "../app/features/cart/cartSlice";
import { addCartItemAPI, removeCartItemAPI, getCartFromServer } from "../app/features/cart/cartApi";

const Cart = () => {
  const { cartList } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalPrice = cartList.reduce(
    (price, item) => price + item.qty * item.price,
    0
  );

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  useEffect(() => {
      if (!user?.id) {
        navigate('/login');
        return;
      }
    })
  // Lưu cartList vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem("cartList", JSON.stringify(cartList));
  }, [cartList]);

  // Khởi tạo cart từ localStorage nếu chưa đăng nhập
  useEffect(() => {
    try {

      const user = localStorage.getItem("user");
      if (!user) {
        const storedCart = JSON.parse(localStorage.getItem("cartList")) || [];
        if (cartList.length === 0 && storedCart.length > 0) {
          storedCart.forEach((item) => {
            dispatch(addToCart({ product: item, num: item.qty }));
          });
        }
      }
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error parsing user or cartList from localStorage:", error);
    }
  }, [dispatch]);

  const handleCheckout = () => {
    if (cartList.length === 0) {
      toast.warning("Giỏ hàng trống!");
      return;
    }
    navigate("/payment");
  };

  const handleIncrease = async (item) => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser?.id) {
          await addCartItemAPI(parsedUser.id, item.id, 1);
          const serverCart = await getCartFromServer(parsedUser.id);
          const mappedCart = (serverCart?.cartList || []).map((i) => ({
            id: i.product?.id,
            productName: i.product?.productName,
            imgUrl: i.product?.imgUrl,
            price: Number(i.product?.price || 0),
            qty: i.quantity || 1,
          }));
          dispatch(setCart(mappedCart));
          localStorage.setItem("cartList", JSON.stringify(mappedCart));
        }
      } else {
        dispatch(addToCart({ product: item, num: 1 }));
      }
    } catch (error) {
      console.error("Error increasing cart item:", error);
      toast.error("Không thể tăng số lượng sản phẩm!");
    }
  };

  const handleDecrease = async (item) => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser?.id) {
          if (item.qty > 1) {
            await addCartItemAPI(parsedUser.id, item.id, -1);
          } else {
            await removeCartItemAPI(parsedUser.id, item.id);
          }
          const serverCart = await getCartFromServer(parsedUser.id);
          const mappedCart = (serverCart?.cartList || []).map((i) => ({
            id: i.product?.id,
            productName: i.product?.productName,
            imgUrl: i.product?.imgUrl,
            price: Number(i.product?.price || 0),
            qty: i.quantity || 1,
          }));
          dispatch(setCart(mappedCart));
          localStorage.setItem("cartList", JSON.stringify(mappedCart));
        }
      } else {
        dispatch(decreaseQty(item));
      }
    } catch (error) {
      console.error("Error decreasing cart item:", error);
      toast.error("Không thể giảm số lượng sản phẩm!");
    }
  };

  const handleDelete = async (item) => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser?.id) {
          await removeCartItemAPI(parsedUser.id, item.id);
          const serverCart = await getCartFromServer(parsedUser.id);
          const mappedCart = (serverCart?.cartList || []).map((i) => ({
            id: i.product?.id,
            productName: i.product?.productName,
            imgUrl: i.product?.imgUrl,
            price: Number(i.product?.price || 0),
            qty: i.quantity || 1,
          }));
          dispatch(setCart(mappedCart));
          localStorage.setItem("cartList", JSON.stringify(mappedCart));
        }
      } else {
        dispatch(deleteProduct(item));
      }
    } catch (error) {
      console.error("Error deleting cart item:", error);
      toast.error("Không thể xóa sản phẩm!");
    }
  };

  return (
    <section className="cart-items">
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            {cartList.length === 0 ? (
              <h1 className="no-items product">No Items are added in Cart</h1>
            ) : (
              cartList.map((item) => {
                const productQty = item.price * item.qty;
                return (
                  <div className="cart-list" key={item.id}>
                    <Row>
                      <Col className="image-holder" sm={4} md={3}>
                        <img src={item.imgUrl} alt={item.productName} />
                      </Col>
                      <Col sm={8} md={9}>
                        <Row className="cart-content justify-content-center">
                          <Col xs={12} sm={9} className="cart-details">
                            <h3 className="mb-3">Tên sản phẩm: {item.productName}</h3>
                            <div className="d-flex mb-2" style={{ gap: "40px" }}>
                              <h5 className="mb-0">
                                <strong>Giá:</strong> {formatCurrency(item.price)}
                              </h5>
                              <h5 className="mb-0">
                                <strong>Số lượng:</strong> {item.qty}
                              </h5>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <h5 className="mb-0">Tổng: {formatCurrency(productQty)}</h5>
                            </div>
                          </Col>
                          <Col xs={12} sm={3} className="cartControl">
                            <button className="incCart" onClick={() => handleIncrease(item)}>
                              <i className="fa-solid fa-plus"></i>
                            </button>
                            <button className="desCart" onClick={() => handleDecrease(item)}>
                              <i className="fa-solid fa-minus"></i>
                            </button>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs={12}>
                            <button className="delete" onClick={() => handleDelete(item)}>
                              <ion-icon name="close"></ion-icon>
                            </button>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </div>
                );
              })
            )}
          </Col>
          <Col md={4}>
            <div className="cart-total">
              <h2>Tổng giá:</h2>
              <div className="d_flex">
                <h3>{formatCurrency(totalPrice)}</h3>
              </div>
              <Button
                variant="primary"
                className="w-100 mt-3"
                onClick={handleCheckout}
                disabled={cartList.length === 0}
              >
                Mua hàng
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Cart;