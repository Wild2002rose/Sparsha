import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = "https://localhost:7269/api/Notification";

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (userId) => {
    const response = await axios.get(`${API_URL}/GetNotification/${userId}`);
    return response.data;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (userId, { dispatch }) => {
    await axios.put(`${API_URL}/MarkAllAsRead/${userId}`);
    dispatch(fetchNotifications(userId));
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async ({ userId, id }, { dispatch }) => {
    await axios.put(`${API_URL}/MarkNotificationAsRead/${id}`);
    dispatch(fetchNotifications(userId));
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async ({ userId, id }, { dispatch }) => {
    await axios.delete(`${API_URL}/DeleteNotification/${id}`);
    dispatch(fetchNotifications(userId));
  }
);

export const deleteAllNotifications = createAsyncThunk(
  'notifications/deleteAll',
  async (userId, { dispatch }) => {
    await axios.delete(`${API_URL}/DeleteAllNotifications/${userId}`);
    dispatch(fetchNotifications(userId));
  }
);

// Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {clearNotifications: (state) => {
      state.items = [];
    },},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
