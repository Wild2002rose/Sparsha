import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  items: [], 
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const { userId, itemId, quantity } = action.payload;
      state.items.push({ userId, itemId, quantity });
    },
    setCartItems(state, action) {
      state.items = action.payload; 
    },
    removeFromCart(state, action) {
      const itemId = action.payload;
      state.items = state.items.filter(item => item.itemId !== itemId); // ✅ Use `items`
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, setCartItems, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
