import { useEffect, useState } from 'react';
import Select from 'react-select';
import { productService } from '../services/productService';

const customStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: "#0f3460",
        color: "white",
        borderRadius: "5px",
        border: "none",
        boxShadow: "none",
        width: "200px",
        height: "40px",
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? "#0f3460" : "white",
        color: state.isSelected ? "white" : "#0f3460",
        "&:hover": {
            backgroundColor: "#0f3460",
            color: "white",
        },
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "white",
    }),
};

const FilterSelect = ({ setFilterList, products }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Lấy danh sách danh mục từ API
                const response = await productService.getAllCategories();
                const categoryOptions = response.map(category => ({
                    value: category.id,
                    label: category.name
                }));
                setCategories(categoryOptions);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (selectedOption) => {
        if (!selectedOption) {
            setFilterList(products); // Hiển thị tất cả sản phẩm nếu không chọn danh mục
            return;
        }
        
        // Lọc sản phẩm theo categoryId
        const filteredProducts = products.filter(
            item => item.categoryId === selectedOption.value
        );
        setFilterList(filteredProducts);
    };

    if (loading) return <div>Loading categories...</div>;

    return (
        <Select
            options={categories}
            defaultValue={{ value: "", label: "Filter By Category" }}
            styles={customStyles}
            onChange={handleChange}
            isClearable
        />
    );
};

export default FilterSelect;
