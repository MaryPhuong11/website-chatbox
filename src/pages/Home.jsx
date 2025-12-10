import { Fragment, useEffect, useState } from "react";
import Wrapper from "../components/wrapper/Wrapper";
import Section from "../components/Section";
//import { products, discoutProducts } from "../utils/products";
import SliderHome from "../components/Slider";
import useWindowScrollToTop from "../hooks/useWindowScrollToTop";
import { productService } from "../services/productService";
import Loader from "../components/Loader/Loader";
import { toast } from "react-toastify";

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        console.log("Fetched products:", data); // Debug log
        setAllProducts(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err); // Debug log
        setError(err.message);
        setLoading(false);
        toast.error("Failed to load products");
      }
    };

    fetchProducts();
  }, []);

  // Lọc sản phẩm mới (có thể dựa vào trường createdAt hoặc isNew)
  const newArrivalData = allProducts
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 10);

  const bestSales = allProducts
  .sort((a, b) => (b.orderItems?.length || 0) - (a.orderItems?.length || 0))
  .slice(0, 10);
  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <Fragment>
      <SliderHome />
      <Wrapper />
      {/* <Section
        title="Big Discount"
        bgColor="white"
        productItems={discoutProducts}
      /> */}
      <Section 
        title="New Arrivals" 
        bgColor="white" 
        productItems={newArrivalData} 
      />
      <Section 
        title="Best Sales" 
        bgColor="white" 
        productItems={bestSales} 
      />
    </Fragment>
  );
};

export default Home;
