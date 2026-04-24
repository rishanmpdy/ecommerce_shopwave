import { createSlice } from '@reduxjs/toolkit';






const loadUserFromStorage = () => {
  // LocalStorage-il ninnu user data read cheyyunnu.
  try {
    const serializedUser = localStorage.getItem('user');
    // Data illengil null return cheyyunnu.
    if (serializedUser === null) {
      return null;
    }
    // String data-ye JSON object-lekku convert cheyyunnu.
    return JSON.parse(serializedUser);
  } catch (err) {
    console.error("Could not load user", err);
    return null;
  }
};




const initialState = {
  // App start cheyyumpol storage-il ninnu user-ne load cheyyunnu.
  user: loadUserFromStorage(),
  // User undengil isAuthenticated true aakum.
  isAuthenticated: !!loadUserFromStorage(),
  loading: false,
  error: null,
};

//A5 (User Auth State: Normal user login status, persistence (localStorage), and session management handle cheyyunnu)
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

    loginSuccess: (state, action) => {
      // Payload-il ulla user object state-il set cheyyunnu.
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      // Persistent session-u vendi localStorage-ilum store cheyyunnu.
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    loginFailure: (state, action) => {
      // Error message store cheyyunnu (UI-il feedback kaanikkan).
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      // Ella user details-um Redux-il ninnu remove cheyyunnu.
      state.user = null;
      state.isAuthenticated = false;
      // Storage tokens clear cheyyunnu.
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
    },
  },
});

export const { loginSuccess, loginFailure, logout } = authSlice.actions;

// Selector to easily grab auth state in components
export const selectAuth = (state) => state.auth;

export default authSlice.reducer;
