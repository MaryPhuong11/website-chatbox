import { useState, useEffect } from "react";
import "./searchbar.css";
import { products } from "../../utils/products";
// import useDebounce from "../../hooks/useDebounce";

const SearchBar = ({ setFilterList, products }) => {
  const [searchWord, setSearchWord] = useState("");
  // const debounceSearchWord = useDebounce(searchWord, 300);

  const handleChange = (input) => {
    const value = input.target.value;
    setSearchWord(value);

    if (!value.trim()) {
      setFilterList(products); // Hiển thị tất cả sản phẩm nếu không có từ khóa
      return;
    }

    // Tìm kiếm theo tên sản phẩm và mô tả
    const filteredProducts = products.filter((item) => {
      const searchTerm = value.toLowerCase();
      return (
        item.productName?.toLowerCase().includes(searchTerm) ||
        item.shortDesc?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
      );
    });

    setFilterList(filteredProducts);
  };

  return (
    <div className="search-container">
      <input 
        type="text" 
        placeholder="Search products..." 
        value={searchWord}
        onChange={handleChange} 
      />
      <ion-icon name="search-outline" className="search-icon"></ion-icon>
    </div>
  );
};

export default SearchBar;
