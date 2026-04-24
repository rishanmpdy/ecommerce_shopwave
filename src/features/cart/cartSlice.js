import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Cart items store cheyyunna array. Oro item-lum product object-um quantity-um undaakum.
  items: [],
  isLoading: false,
};


//A6 (Cart State: Client-side product selection, quantity updates, and total price calculation logic handle cheyyunnu)
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {

    setCart: (state, action) => {
      // server/cart fetch result full aayi state-il replace cheyyan use cheyyum.
      state.items = action.payload || [];
    },

    addToCart: (state, action) => {
      // Payload-il ninnu product-um quantity-um destruct cheyyunnu.
      const { product, quantity } = action.payload;

      // Ee product cart-il already undo ennu check cheyyunnu.
      const existingItem = state.items.find(item => item.product.id === product.id);

      if (existingItem) {
        // Product already undengil quantity mathram increment cheyyunnu.
        existingItem.quantity += quantity;
      } else {
        // Puthiya product aanengil array-ilekku push cheyyunnu.
        state.items.push({ product, quantity });
      }
    },

    updateQuantity: (state, action) => {
      // Oru specific product-inte quantity update cheyyunnu.
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      if (item) {
        item.quantity = quantity; // New quantity set cheyyunnu.
      }
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;
      // filter use cheythu aa product remove cheyyum.
      state.items = state.items.filter(item => item.product.id !== productId);
    },

    clearCart: (state) => {
      state.items = [];
    }
  },
});

export const { setCart, addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;

// Selectors
// UI components-nu cart data edukkanulla helper functions.
export const selectCartItems = (state) => state.cart.items;

export const selectCartTotal = (state) => {
  // Items array-iloode loop cheythu (price * quantity) sum calculate cheyyunnu.
  return state.cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

export const selectCartCount = (state) => {
  // Cart-il total ethra quantity items undennu calculate cheyyunnu (Navbar badge-nu vendi).
  return state.cart.items.reduce((count, item) => count + item.quantity, 0);
};

export default cartSlice.reducer;
