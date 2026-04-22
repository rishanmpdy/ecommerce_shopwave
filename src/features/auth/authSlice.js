import { createSlice } from '@reduxjs/toolkit';






const loadUserFromStorage = () => {
  // Manglish: page refresh kazhinjalum user login state pokathe localStorage-il ninnu restore cheyyan helper.
  try {
    const serializedUser = localStorage.getItem('user');
    if (serializedUser === null) {
      return null;
    }
    return JSON.parse(serializedUser);
  } catch (err) {
    console.error("Could not load user", err);
    return null;
  }
};




const initialState = {

  user: loadUserFromStorage(),
  isAuthenticated: !!loadUserFromStorage(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
  
    loginSuccess: (state, action) => {
      // Manglish: login success aayal Redux state + localStorage randum update cheyyum.
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    // Manglish: login fail aayal error message state-il save cheyyum.
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Manglish: logout aayal user data clear cheythu storage clean cheyyum.
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      // Manglish: Admin storage-um clear cheyyunnu to keep sessions in sync.
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
    },
  },
});

export const { loginSuccess, loginFailure, logout } = authSlice.actions;

// Selector to easily grab auth state in components
export const selectAuth = (state) => state.auth;

export default authSlice.reducer;
