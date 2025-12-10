import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import axios from "axios";
import "./product-review.css";

const ProductReviews = () => {
  const { id } = useParams(); // Lấy productId từ URL
  const [listSelected, setListSelected] = useState("desc");
  const [comments, setComments] = useState([]);
  const [text, setText] = useState(""); // Đổi từ content -> text
  const [description, setDescription] = useState("");

  // Lấy mô tả sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setDescription(res.data.description);
      } catch (err) {
        console.error("❌ Failed to fetch product description:", err);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Lấy danh sách comment
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/comments/product/${id}`);
        setComments(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch comments:", err);
      }
    };

    if (id) fetch();
  }, [id]);

  // Gửi comment
  const handleCommentSubmit = async () => {
    try {
      if (!text.trim()) {
        alert("Vui lòng nhập nội dung bình luận.");
        return;
      }

      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      const userId = user?.id ? String(user.id) : null;

      const payload = {
        text,
        productId: parseInt(id),
        ...(userId ? { userId } : {}),
      };

      console.log("🧾 Gửi bình luận:", payload);

      const res = await axios.post("/api/comments", payload);
      const newComment = res.data;
      setComments((prev) => [newComment, ...prev]);
      setText("");
    } catch (err) {
      console.error("❌ Failed to submit comment:", err.response?.data || err.message);
      alert("Đã xảy ra lỗi khi gửi bình luận. Xem console để biết thêm chi tiết.");
    }
  };

  return (
    <section className="product-reviews">
      <Container>
        <ul>
          <li
            style={{ color: listSelected === "desc" ? "black" : "#9c9b9b" }}
            onClick={() => setListSelected("desc")}
          >
            Description
          </li>
          <li
            style={{ color: listSelected === "rev" ? "black" : "#9c9b9b" }}
            onClick={() => setListSelected("rev")}
          >
            Reviews ({comments.length})
          </li>
        </ul>

        {listSelected === "desc" ? (
          <p>{description || "Không có mô tả"}</p>
        ) : (
          <>
            <div className="comment-input-box">
              <textarea
                placeholder="Viết bình luận..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button onClick={handleCommentSubmit}>Gửi</button>
            </div>

            <div className="rates">
              {comments.map((comment) => (
                <div className="rate-comment" key={comment.id}>
                  <span><b>{comment.user?.name || "Ẩn danh"}</b></span>
                  <p>{comment.text}</p> {/* Đổi từ content → text */}
                  <small>{new Date(comment.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </>
        )}
      </Container>
    </section>
  );
};

export default ProductReviews;
