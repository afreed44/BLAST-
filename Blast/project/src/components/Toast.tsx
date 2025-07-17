import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-600',
          closeButton: 'text-green-600 hover:text-green-800'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-600',
          closeButton: 'text-red-600 hover:text-red-800'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-600',
          closeButton: 'text-blue-600 hover:text-blue-800'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: 'text-gray-600',
          closeButton: 'text-gray-600 hover:text-gray-800'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`max-w-sm w-full bg-white border-2 rounded-lg shadow-lg p-4 ${styles.container}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className={`w-6 h-6 ${styles.icon}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`flex-shrink-0 p-1 rounded-full hover:bg-opacity-20 ${styles.closeButton}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast; 