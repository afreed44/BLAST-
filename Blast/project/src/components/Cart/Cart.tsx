import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { toggleCart, removeFromCart, updateQuantity, removeFromCartAsync, showNotification } from '../../store/slices/cartSlice';
import { X, Plus, Minus, ShoppingBag, Loader2, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total, isOpen, isLoading, itemCount } = useSelector((state: RootState) => state.cart);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const handleQuantityChange = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCartAsync(id));
  };

  const handleProceedToCheckout = async () => {
    if (items.length === 0) {
      dispatch(showNotification({
        message: 'Your cart is empty. Add some items first!',
        type: 'error'
      }));
      return;
    }

    setProcessingCheckout(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      dispatch(showNotification({
        message: `🛒 Proceeding to checkout with ${itemCount} item${itemCount > 1 ? 's' : ''}`,
        type: 'success'
      }));

      dispatch(toggleCart());
      navigate('/checkout');
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to proceed to checkout. Please try again.',
        type: 'error'
      }));
    } finally {
      setProcessingCheckout(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => dispatch(toggleCart())} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold">Shopping Cart</h2>
              {itemCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  {itemCount}
                </span>
              )}
            </div>
            <button
              onClick={() => dispatch(toggleCart())}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
                <Link
                  to="/products"
                  className="inline-block mt-4 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors"
                  onClick={() => dispatch(toggleCart())}
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.product.name}</h3>
                      <p className="text-gray-600 text-sm">{formatPrice(item.product.price)}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Items ({itemCount})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={processingCheckout || isLoading}
                className="w-full bg-red-600 text-white py-3 rounded-full text-center font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {processingCheckout ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Secure checkout with 256-bit SSL encryption
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;