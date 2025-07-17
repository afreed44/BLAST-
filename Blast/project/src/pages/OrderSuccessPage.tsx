import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearOrderPlaced } from '../store/slices/orderSlice';
import { CheckCircle, Package, Truck, Calendar, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';

interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    brand: string;
  };
  quantity: number;
  price: number;
}

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/');
      return;
    }

    // Clear order placed state
    dispatch(clearOrderPlaced());
  }, [order, navigate, dispatch]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Order Placed Successfully!</h1>
            <p className="text-green-100 text-lg">
              Thank you for your purchase. Your order has been confirmed and is being processed.
            </p>
          </div>

          {/* Order Details */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Order Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Information</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-semibold">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-semibold text-red-600">{order.trackingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold text-lg">{formatPrice(order.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold capitalize">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Information</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-gray-600">Estimated Delivery</p>
                      <p className="font-semibold">{formatDate(order.estimatedDelivery)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-gray-600">Shipping Method</p>
                      <p className="font-semibold">Standard Delivery (5-7 business days)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-gray-600">Package Status</p>
                      <p className="font-semibold">Being Prepared</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                      <p className="text-gray-600">{order.shippingAddress.street}</p>
                      <p className="text-gray-600">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      <p className="text-gray-600">{order.shippingAddress.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">{order.shippingAddress.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">{order.shippingAddress.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-4">
                  {order.items.map((item: OrderItem, index: number) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                        <p className="text-gray-600 text-sm">{item.product.brand}</p>
                        <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span>{formatPrice(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax:</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Confirmation Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Confirmation Email Sent!</h3>
                  <p className="text-green-800">
                    We've sent a detailed order confirmation to your email address.
                    Please check your inbox (and spam folder) for order details and tracking information.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h3>
              <div className="space-y-2 text-blue-800">
                <p>• Check your email for detailed order confirmation</p>
                <p>• We'll send you tracking updates as your order progresses</p>
                <p>• Your order will be delivered to the address you provided</p>
                <p>• You can track your order anytime using the tracking number above</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/orders"
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Package className="w-5 h-5" />
                <span>View My Orders</span>
              </Link>
              
              <Link
                to={`/track-order?tracking=${order.trackingNumber}`}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Truck className="w-5 h-5" />
                <span>Track Order</span>
              </Link>
              
              <Link
                to="/products"
                className="border-2 border-red-600 text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">Need help with your order?</p>
          <Link
            to="/contact"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Contact our support team
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;