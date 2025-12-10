import React, { useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import "./navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useSelector ,useDispatch} from "react-redux";
import {logout} from '../../features/user/userSlice';
const NavBar = () => {
  const { cartList } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const [expand, setExpand] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleClick = () => {
    navigate("/userinfo"); // Chuyển hướng nội bộ
  };
  // Scroll handler
  useEffect(() => {
    const scrollHandler = () => {
      if (window.scrollY >= 100) {
        setIsFixed(true);
      } else if (window.scrollY <= 50) {
        setIsFixed(false);
      }
    };
    window.addEventListener("scroll", scrollHandler);
    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  // Lấy user từ localStorage
  const user2 = JSON.parse(localStorage.getItem("user") || "null");

  // Hàm đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    dispatch(logout(user2));
    window.location.reload();
  };

  return (
    <Navbar fixed="top" expand="md" className={isFixed ? "navbar fixed" : "navbar"}>
      <Container className="navbar-container">
        <Navbar.Brand as={Link} to="/">
          <ion-icon name="bag"></ion-icon>
          <h1 className="logo">IT QNU</h1>
        </Navbar.Brand>

        <div className="d-flex">
          {/* Cart icon */}
          <div className="media-cart">
            <Link
              aria-label="Go to Cart Page"
              to="/cart"
              className="cart"
              data-num={cartList.length}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="nav-icon">
                <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
              </svg>
            </Link>
          </div>

          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            onClick={() => setExpand(expand ? false : "expanded")}
          >
            <span></span>
            <span></span>
            <span></span>
          </Navbar.Toggle>
        </div>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="justify-content-end flex-grow-1 pe-3">
            <Nav.Item>
              <Link className="navbar-link" to="/" onClick={() => setExpand(false)}>
                Home
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link className="navbar-link" to="/shop" onClick={() => setExpand(false)}>
                Shop
              </Link>
            </Nav.Item>            <Nav.Item>
              <Link className="navbar-link" to="/store" onClick={() => setExpand(false)}>
                Store
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                aria-label="Go to Cart Page"
                className="navbar-link"
                to="/cart"
                onClick={() => setExpand(false)}
              >
                <span className="nav-link-label">Cart</span>
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link
                aria-label="Go to Cart Page"
                className="navbar-link"
                to="/orders"
                onClick={() => setExpand(false)}
              >
                <span className="nav-link-label">Orders</span>
              </Link>
            </Nav.Item>
            <Nav.Item className="expanded-cart">
              <Link
                aria-label="Go to Cart Page"
                to="/cart"
                className="cart"
                data-num={user2 ? cartList.length : 0}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="black"
                  className="nav-icon"
                >
                  <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                </svg>
              </Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>

        <div className="navbar-user d-flex align-items-center ms-3" >
          {user2 && user2.name ? (
            <>
              {user2.avatar && (
                <div className="navbar-user-info me-2" onClick={handleClick} style={{ cursor: "pointer" }}>
                  <img src={user2.avatar} alt="Avatar" />
                </div>
              )}
              <div className="navbar-user-info me-2" onClick={handleClick} style={{ cursor: "pointer" }}>
      <div className="user-name">{user2.name}</div>
    </div>
              <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <button className="login-btn" onClick={() => navigate("/login")}>Đăng nhập</button>
          )}
        </div>
      </Container>
    </Navbar>
  );
};

export default NavBar;
