import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  wishlistItems: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist(state, action) {
      const { userId, itemId } = action.payload;
      const exists = state.wishlistItems.find(
        (item) => item.userId === userId && item.itemId === itemId
      );
      if (!exists) {
        state.wishlistItems.push({ userId, itemId });
        console.log(state.wishlistItems);
      }
    },
    removeFromWishlist(state, action) {
      state.wishlistItems = state.wishlistItems.filter(
        (item) => item.itemId !== action.payload
      );
    },
    setWishlist(state,action) {
      state.wishlistItems = action.payload;
    }
  },
});

export const { addToWishlist, removeFromWishlist, setWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
