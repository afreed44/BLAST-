import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { hideNotification } from '../store/slices/cartSlice';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const CartNotification: React.FC = () => {
  const dispatch = useDispatch();
  const { notification } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [notification.show, dispatch]);

  if (!notification.show) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-green-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`
        flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm
        ${getBackgroundColor()} ${getTextColor()}
        transform transition-all duration-300 ease-in-out
      `}>
        {getIcon()}
        <span className="flex-1 text-sm font-medium">
          {notification.message}
        </span>
        <button
          onClick={() => dispatch(hideNotification())}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartNotification;
