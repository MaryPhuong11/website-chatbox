import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import cartSlice, { cartMiddleware } from './features/cart/cartSlice';
import productReducer from '../features/products/productSlice';
import categoryReducer from '../features/categories/categorySlice';
import userReducer from '../features/user/userSlice';
import storeReducer from '../features/store/storeSlice';
// Kết hợp các reducer thành một root reducer
const rootReducer = combineReducers({
  cart: cartSlice,
  products: productReducer,
  categories: categoryReducer,
  user: userReducer,
  stores: storeReducer,
});

// Cấu hình persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart', 'user'], // Chỉ persist cart và user slices
};

// Wrap root reducer với persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo store với persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions for serializable check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(cartMiddleware),
});

// Tạo persistor object
export const persistor = persistStore(store);

export default store;