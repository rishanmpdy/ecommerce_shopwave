import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Array of cart items: { product, quantity }
  isLoading: false,
};


const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
 
    setCart: (state, action) => {
      // Manglish: server/cart fetch result full aayi state-il replace cheyyan use cheyyum.
      state.items = action.payload || [];
    },
    
    addToCart: (state, action) => {
      const { product, quantity } = action.payload;
      
     
      const existingItem = state.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Manglish: same product already undengil quantity add cheyyum.
        existingItem.quantity += quantity; 
      } else {
        // Manglish: illengil new line item push cheyyum.
        state.items.push({ product, quantity });
      }
    },
    
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      if (item) {
        item.quantity = quantity;
      }
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;
      // Manglish: filter use cheythu aa product remove cheyyum.
      state.items = state.items.filter(item => item.product.id !== productId);
    },
    
    clearCart: (state) => {
      state.items = [];
    }
  },
});

export const { setCart, addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => {
  return state.cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};
export const selectCartCount = (state) => {
  return state.cart.items.reduce((count, item) => count + item.quantity, 0);
};

export default cartSlice.reducer;
