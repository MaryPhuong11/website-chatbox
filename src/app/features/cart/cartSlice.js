// src/features/cart/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartList: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.cartList = action.payload;
    },
    addToCart: (state, action) => {
      const { product, num } = action.payload;
      const exist = state.cartList.find((item) => item.id === product.id);
      if (exist) {
        exist.qty += num;
      } else {
        state.cartList.push({ ...product, qty: num });
      }
    },
    decreaseQty: (state, action) => {
      const item = state.cartList.find((i) => i.id === action.payload.id);
      if (item && item.qty > 1) item.qty -= 1;
    },
    deleteProduct: (state, action) => {
      state.cartList = state.cartList.filter((i) => i.id !== action.payload.id);
    },
  },
});

export const { setCart, addToCart, decreaseQty, deleteProduct } = cartSlice.actions;
export default cartSlice.reducer;

// ✅ Export middleware nếu bạn cần lưu vào localStorage
export const cartMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  localStorage.setItem("cartList", JSON.stringify(state.cart.cartList));
  return result;
};
