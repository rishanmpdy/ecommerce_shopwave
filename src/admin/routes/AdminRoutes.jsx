import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../layout/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import AdminProducts from "../pages/AdminProducts";
import AdminOrders from "../pages/AdminOrders";
import AdminUsers from "../pages/AdminUsers";
import AdminCategories from "../pages/AdminCategories";
import AdminCoupons from "../pages/AdminCoupons";

//A21  admin access wrapped
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Navigate to="/login" replace />} />
      <Route element={<AdminProtectedRoute/>}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
