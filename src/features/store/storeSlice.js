import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchStores = createAsyncThunk('stores/fetchStores', async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await axios.get(`http://localhost:5000/api/stores?${query}`);
  return response.data;
});

const storeSlice = createSlice({
  name: 'stores',
  initialState: { list: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      });
  },
});

export default storeSlice.reducer;