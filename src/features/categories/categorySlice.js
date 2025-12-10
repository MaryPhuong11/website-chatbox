import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/categories';

export const fetchCategories = createAsyncThunk('categories/fetchAll', async () => {
  const res = await axios.get(API_URL);
  return res.data;
});

export const addCategory = createAsyncThunk('categories/add', async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
});

export const updateCategory = createAsyncThunk('categories/update', async ({ id, data }) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
});

export const deleteCategory = createAsyncThunk('categories/delete', async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export default categorySlice.reducer;
