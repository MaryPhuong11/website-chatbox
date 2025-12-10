import { Fragment, useEffect, useState } from "react";
import Banner from "../components/Banner/Banner";
import { Container } from "react-bootstrap";
import ShopList from "../components/ShopList";
import { useParams } from "react-router-dom";
import ProductDetails from "../components/ProductDetails/ProductDetails";
import ProductReviews from "../components/ProductReviews/ProductReviews";
import useWindowScrollToTop from "../hooks/useWindowScrollToTop";
import { productService } from "../services/productService";
import Loader from "../components/Loader/Loader";
import { toast } from "react-toastify";

const Product = () => {
  const { id } = useParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("ID sản phẩm không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Lấy sản phẩm chi tiết
        const product = await productService.getProductById(id);
        if (!product) {
          throw new Error("Sản phẩm không tồn tại");
        }
        setSelectedProduct(product);

        // Lấy sản phẩm liên quan
         try {
          const all = await productService.getAllProducts();
          const currentCateId = product.categoryId ?? product.category?.id;
          const related = all.filter((p) => {
            const cateId = p.categoryId ?? p.category?.id;
            return (
              cateId === currentCateId && String(p.id) !== String(product.id)
            );
          });
          setRelatedProducts(related);
          }
 catch (err) {
          console.warn("Lỗi khi lấy sản phẩm liên quan:", err);
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
        setError(err.message || "Có lỗi xảy ra khi tải sản phẩm");
        toast.error("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useWindowScrollToTop();

  if (loading) return <Loader />;
  if (error) return <div className="text-danger text-center mt-5">Lỗi: {error}</div>;
  if (!selectedProduct) return <div className="text-center mt-5">Không tìm thấy sản phẩm</div>;

  return (
    <Fragment>
      <Banner title={selectedProduct?.productName || selectedProduct?.name || "Sản phẩm"} />
      <ProductDetails selectedProduct={selectedProduct} />
      <ProductReviews selectedProduct={selectedProduct} />
      <section className="related-products my-5">
        <Container>
          <h3 className="mb-4">Bạn có thể cũng thích</h3>
          <ShopList productItems={relatedProducts} />
        </Container>
      </section>
    </Fragment>
  );
};

export default Product;