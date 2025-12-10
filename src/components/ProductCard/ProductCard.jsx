import { Col } from "react-bootstrap";
import "./product-card.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addToCart, setCart } from "../../app/features/cart/cartSlice";
import { addCartItemAPI, getCartFromServer } from "../../app/features/cart/cartApi";

const ProductCard = ({ title, productItem }) => {
  const dispatch = useDispatch();
  const router = useNavigate();

  const handelClick = () => {
    router(`/shop/${productItem.id}`);
  };

  const handelAdd = async (productItem) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      // Nếu đã đăng nhập, gọi API backend
      try {
        await addCartItemAPI(user.id, productItem.id, 1);
        const serverCart = await getCartFromServer(user.id);
        const mappedCart = (serverCart.cartList || []).map(item => ({
          id: item.product.id,
          productName: item.product.productName,
          imgUrl: item.product.imgUrl,
          price: Number(item.product.price),
          qty: item.quantity,
        }));
        dispatch(setCart(mappedCart));
        localStorage.setItem("cartList", JSON.stringify(mappedCart));
        toast.success("Product has been added to cart!");
      } catch (err) {
        toast.error("Add to cart failed!");
      }
    } else {
      // Nếu chưa đăng nhập, dùng Redux/localStorage như cũ
      dispatch(addToCart({ product: productItem, num: 1 }));
      toast.success("Product has been added to cart!");
    }
  };

  if (!productItem) return null;

  return (
    <Col md={3} sm={5} xs={10} className="product mtop">
      {title === "Big Discount" && productItem.discount ? (
        <span className="discount">{productItem.discount}% Off</span>
      ) : null}
      <img
        loading="lazy"
        onClick={handelClick}
        src={productItem.imgUrl || '/placeholder.png'}
        alt={productItem.productName}
      />
      <div className="product-like">
        <ion-icon name="heart-outline"></ion-icon>
      </div>
      <div className="product-details">
        <h3 onClick={handelClick}>{productItem.productName}</h3>
        <div className="rate">
          {[...Array(5)].map((_, index) => (
            <i 
              key={index} 
              className={`fa fa-star ${index < Math.round(productItem.avgRating) ? 'active' : ''}`}
            ></i>
          ))}
        </div>
        <div className="price">
          <h4>{Number(productItem.price).toFixed(2)} VNĐ</h4>
          <button
            aria-label="Add"
            type="submit"
            className="add"
            onClick={() => handelAdd(productItem)}
          >
            <ion-icon name="add"></ion-icon>
          </button>
        </div>
      </div>
    </Col>
  );
};

export default ProductCard;
