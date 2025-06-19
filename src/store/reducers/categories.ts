import { createApi } from '@reduxjs/toolkit/query'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState: any = {
  loading: false,
  categories: []
};

// ==============================|| SLICE - SNACKBAR ||============================== //
// Define an async thunk
export const fetchCategories = createAsyncThunk('', async () => {
    const response = await axios.get('http://localhost:4000/api/users');
    return response.data;
  });

const snackbar = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchCategories.pending, (state: any) => {
        state.loading = true;
    }).addCase(fetchCategories.fulfilled, (state: any, action: any) => {
        state.categories = action.payload;
        state.loading = false;
    }).addCase(fetchCategories.rejected, (state: any, action: any) => {
        state.loading = false;
    });
  },
});

export default snackbar.reducer;

export const {  } = snackbar.actions;
