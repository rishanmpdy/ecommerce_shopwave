import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import adminReducer from '../admin/store/adminSlice';


const store = configureStore({
  reducer: {
    auth: authReducer, 
    cart: cartReducer, 
    admin: adminReducer,
  },
});

export default store;