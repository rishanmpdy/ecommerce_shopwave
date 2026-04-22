import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/layout/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';
import 'react-toastify/dist/ReactToastify.css';

import { useSelector, useDispatch } from 'react-redux';
import { selectAuth } from './features/auth/authSlice';
import { setCart } from './features/cart/cartSlice';
import api from './api/axios';


import AdminRoutes from './admin/routes/AdminRoutes';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Profile = lazy(() => import('./pages/Profile'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));

function App() {
  const location = useLocation();
  // Manglish: /admin enna path aanu enkil public navbar/footer hide cheyyum.
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Manglish: auth slice-il ninnu current userum login status-um read cheyyunnu.
  const { user, isAuthenticated } = useSelector(selectAuth);
  const dispatch = useDispatch();

  // Manglish: login aayal server-il ulla cart Redux-il sync cheyyum.
  // logout aayal local Redux cart clear cheyyum.
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated && user) {
        try {
          const { data } = await api.get(`/carts?userId=${user.id}`);
          if (data.length > 0) {
            dispatch(setCart(data[0].items));
          } else {
            dispatch(setCart([]));
          }
        } catch (error) {
          console.error("Failed to load cart", error);
        }
      } else {
        //clean redux cart if logout
        dispatch(setCart([]));
      }
    };
    fetchCart();
  }, [isAuthenticated, user, dispatch]);

  return (
    <div className={`min-h-screen flex flex-col ${!isAdminRoute ? 'pt-16' : ''}`}>

      {/* Manglish: public pages-il mathram navbar kaanikku. */}
      {!isAdminRoute && <Navbar />}

      <main className="grow flex flex-col w-full p-0 lg:p-0">

        <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>


          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />


            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            </Route>

            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && (
        <footer className="bg-white border-t py-6 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} ShopWave. All rights reserved.


        </footer>
      )}
    </div>
  );
}

export default App;
