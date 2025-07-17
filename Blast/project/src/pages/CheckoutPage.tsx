import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { clearCart } from '../store/slices/cartSlice';
import { createOrder, clearError, resetOrderState } from '../store/slices/orderSlice';
import { getCurrentLocation } from '../services/api';
import { CreditCard, Truck, Shield, ArrowLeft, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import Toast from '../components/Toast';

const CheckoutPage: React.FC = () => {
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isLoading, error, orderPlaced, currentOrder } = useSelector((state: RootState) => state.orders);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    coordinates: {
      latitude: 0,
      longitude: 0
    },
    // Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    paymentMethod: 'card',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (orderPlaced && currentOrder) {
      // Show toast notification
      setToastMessage(`🎉 Order #${currentOrder.orderNumber} successfully placed! Total: ₹${formatPrice(currentOrder.total)}`);
      setToastType('success');
      setShowToast(true);

      // Show success message for a moment before redirecting
      setTimeout(() => {
        // Clear cart and redirect to success page
        dispatch(clearCart());
        navigate('/order-success', {
          state: {
            order: currentOrder
          }
        });
      }, 2000); // Show success state for 2 seconds
    }
  }, [orderPlaced, currentOrder, dispatch, navigate]);

  // Handle order creation errors
  useEffect(() => {
    if (error) {
      setToastMessage(`❌ Order failed: ${error}`);
      setToastType('error');
      setShowToast(true);
    }
  }, [error]);

  // Cleanup effect - clear order state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        coordinates: location
      }));
      alert('Location detected successfully!');
    } catch (error) {
      console.error('Location error:', error);
      alert('Unable to get location. Please ensure location services are enabled.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    // Create order
    const orderData = {
      items: items.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          brand: item.product.brand
        },
        quantity: item.quantity,
        price: item.product.price * item.quantity
      })),
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        coordinates: formData.coordinates
      },
      paymentMethod: formData.paymentMethod,
      subtotal: total,
      shipping: shipping,
      tax: tax,
      total: finalTotal
    };

    dispatch(createOrder(orderData));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const shipping = 5000;
  const tax = Math.round(total * 0.18);
  const finalTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={4000}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Shopping</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {orderPlaced && currentOrder && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl flex items-center space-x-4 shadow-lg">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-800 mb-1">
                🎉 Order Successfully Placed!
              </h3>
              <p className="text-green-700 mb-2">
                Thank you for your purchase! Your order has been confirmed and is being processed.
              </p>
              <div className="text-sm text-green-600 space-y-1">
                <p><strong>Order Number:</strong> {currentOrder.orderNumber}</p>
                <p><strong>Total Amount:</strong> ₹{formatPrice(currentOrder.total)}</p>
                <p><strong>Estimated Delivery:</strong> {new Date(currentOrder.estimatedDelivery).toLocaleDateString()}</p>
              </div>
              <p className="text-green-600 text-sm mt-2 italic">
                Redirecting to order details in a moment...
              </p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step <= currentStep
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                <span className="ml-2 text-gray-600">
                  {step === 1 ? 'Shipping' : 'Payment'}
                </span>
                {step < 2 && (
                  <div className="w-16 h-0.5 bg-gray-300 ml-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Information */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter your address"
                        />
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={locationLoading}
                          className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          {locationLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <MapPin className="w-5 h-5" />
                          )}
                          <span className="hidden sm:inline">
                            {locationLoading ? 'Getting...' : 'Use Location'}
                          </span>
                        </button>
                      </div>
                      {formData.coordinates.latitude !== 0 && (
                        <p className="mt-2 text-sm text-green-600 flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Location detected successfully</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </div>
                )}

                {/* Payment Information */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Payment Method
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="card"
                              checked={formData.paymentMethod === 'card'}
                              onChange={handleInputChange}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <CreditCard className="w-5 h-5 text-gray-600" />
                            <span>Credit/Debit Card</span>
                          </label>
                          
                          <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="upi"
                              checked={formData.paymentMethod === 'upi'}
                              onChange={handleInputChange}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <span>UPI</span>
                          </label>
                          
                          <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              checked={formData.paymentMethod === 'cod'}
                              onChange={handleInputChange}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <span>Cash on Delivery</span>
                          </label>
                        </div>
                      </div>

                      {formData.paymentMethod === 'card' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Card Number
                            </label>
                            <input
                              type="text"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              placeholder="1234 5678 9012 3456"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expiry Date
                              </label>
                              <input
                                type="text"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                placeholder="MM/YY"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                CVV
                              </label>
                              <input
                                type="text"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                placeholder="123"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Name on Card
                            </label>
                            <input
                              type="text"
                              name="cardName"
                              value={formData.cardName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Placing Order...</span>
                          </div>
                        ) : (
                          'Place Order'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.product.name}</h4>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18%):</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4" />
                  <span>Free Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;