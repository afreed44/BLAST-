import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { toggleCart } from '../../store/slices/cartSlice';
import { logout } from '../../store/slices/authSlice';
import { clearOrderPlaced } from '../../store/slices/orderSlice';
import { Search, ShoppingCart, Heart, User, Menu, X, CheckCircle, Bell } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { orderPlaced, currentOrder } = useSelector((state: RootState) => state.orders);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (orderPlaced && currentOrder) {
      setShowNotification(true);
      setNotificationCount(prev => prev + 1);
      
      // Auto-hide notification after 8 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
        dispatch(clearOrderPlaced());
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [orderPlaced, currentOrder, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    setShowUserMenu(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
    dispatch(clearOrderPlaced());
  };

  const handleViewOrderDetails = () => {
    setShowNotification(false);
    dispatch(clearOrderPlaced());
    navigate('/order-success', { 
      state: { 
        order: currentOrder 
      } 
    });
  };

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold text-black">BLAST WITH PODILATO</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-600 transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-red-600 transition-colors">
              Products
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Heart className="w-5 h-5 text-gray-600" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Order Success Notification */}
            {showNotification && currentOrder && (
              <div className="fixed top-20 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm transform transition-all duration-300 ease-out">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-800">Order Placed Successfully! 🎉</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Order #{currentOrder.orderNumber} has been confirmed.
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Tracking: {currentOrder.trackingNumber}
                    </p>
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={handleViewOrderDetails}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        View Details →
                      </button>
                      <button
                        onClick={() => navigate('/orders')}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        My Orders →
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleNotificationClose}
                    className="text-green-400 hover:text-green-600 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="hidden md:inline text-gray-700">{user?.name}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                    <Link 
                      to="/orders" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors"
              >
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-red-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-red-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              
              {/* Mobile user menu */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-500 mb-2">Welcome, {user?.name}</div>
                    <Link 
                      to="/orders" 
                      className="block text-gray-700 hover:text-red-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="block text-gray-700 hover:text-red-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left text-gray-700 hover:text-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;