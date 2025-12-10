// src/api/cartApi.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

export const addCartItemAPI = async (userId, productId, quantity) => {
  return api.post("/api/cart/add", { userId, productId, quantity });
};

export const saveCartToServer = async (cartList, userId) => {
  return api.post("/api/cart/sync", { userId, cartList });
};

export const getCartFromServer = async (userId) => {
  const res = await api.get(`/api/cart/${userId}`);
  return res.data;
};

export const removeCartItemAPI = async (userId, productId) => {
  const response = await fetch(`http://localhost:5000/api/cart/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId }),
  });
  if (!response.ok) throw new Error("Failed to remove cart item");
  return response.json();
};
