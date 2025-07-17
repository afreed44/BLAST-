import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { getCurrentUser } from './store/slices/authSlice';
import Layout from './components/Layout/Layout';
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import TrackingPage from './pages/TrackingPage';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(getCurrentUser());
    }
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/order/:orderId" element={<OrderDetailPage />} />
          <Route path="/track-order" element={<TrackingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;