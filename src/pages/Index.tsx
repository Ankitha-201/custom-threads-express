
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Home from '@/components/Home';
import Products from '@/components/Products';
import ProductDetail from '@/components/ProductDetail';
import Cart from '@/components/Cart';
import Login from '@/components/Login';
import Register from '@/components/Register';
import Profile from '@/components/Profile';
import AdminDashboard from '@/components/AdminDashboard';
import Checkout from '@/components/Checkout';
import OrderSuccess from '@/components/OrderSuccess';
import ProtectedRoute from '@/components/ProtectedRoute';

const Index = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </AuthProvider>
  );
};

export default Index;
