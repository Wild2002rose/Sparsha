import {configureStore} from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import notificationReducer from './slices/notificationSlice';

const store = configureStore({
    reducer: {
        cart: cartReducer,
        wishlist: wishlistReducer,
        notification: notificationReducer,
    },
});

export default store;