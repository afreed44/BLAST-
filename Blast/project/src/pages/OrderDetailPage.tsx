import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchOrder } from '../store/slices/orderSlice';
import { Package, Truck, Calendar, MapPin, CheckCircle, Clock, ArrowLeft, Printer, Download } from 'lucide-react';

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentOrder, isLoading, error } = useSelector((state: RootState) => state.orders);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [trackingData, setTrackingData] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (orderId) {
      dispatch(fetchOrder(orderId));
    }
  }, [dispatch, orderId, isAuthenticated, navigate]);

  useEffect(() => {
    if (currentOrder?.trackingNumber) {
      fetchTrackingData(currentOrder.trackingNumber);
    }
  }, [currentOrder]);

  const fetchTrackingData = async (trackingNumber: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/track/${trackingNumber}`);
      const data = await response.json();
      if (data.success) {
        setTrackingData(data.tracking);
      }
    } catch (error) {
      console.error('Failed to fetch tracking data:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    // TODO: Implement invoice download functionality
    alert('Invoice download feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            to="/orders"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Orders</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Invoice</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Order #{currentOrder.orderNumber}</h1>
                  <p className="text-gray-600">Placed on {formatDate(currentOrder.createdAt)}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(currentOrder.orderStatus)}`}>
                  {currentOrder.orderStatus}
                </span>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                {currentOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">{item.product.brand}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                  <div className="text-gray-600">
                    <p>{currentOrder.shippingAddress.firstName} {currentOrder.shippingAddress.lastName}</p>
                    <p>{currentOrder.shippingAddress.street}</p>
                    <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}</p>
                    <p>{currentOrder.shippingAddress.country}</p>
                    <p className="mt-2">Phone: {currentOrder.shippingAddress.phone}</p>
                    <p>Email: {currentOrder.shippingAddress.email}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
                  <div className="text-gray-600">
                    <p>Method: {currentOrder.paymentMethod.toUpperCase()}</p>
                    <p>Status: <span className={`px-2 py-1 rounded text-xs font-medium ${currentOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {currentOrder.paymentStatus}
                    </span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            {trackingData && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h3>
                <div className="space-y-6">
                  {trackingData.timeline.map((step: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {step.completed ? (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.status}
                        </h4>
                        {step.date && (
                          <p className="text-sm text-gray-600">{formatDate(step.date)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(currentOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatPrice(currentOrder.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(currentOrder.tax)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-semibold text-gray-900">{formatPrice(currentOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            {currentOrder.trackingNumber && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-mono text-gray-900">{currentOrder.trackingNumber}</p>
                  </div>
                  {currentOrder.estimatedDelivery && (
                    <div>
                      <p className="text-sm text-gray-600">Estimated Delivery</p>
                      <p className="text-gray-900">{formatDate(currentOrder.estimatedDelivery)}</p>
                    </div>
                  )}
                  <Link
                    to={`/track-order?tracking=${currentOrder.trackingNumber}`}
                    className="block w-full bg-red-600 text-white text-center py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Track Order
                  </Link>
                </div>
              </div>
            )}

            {/* Need Help */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
              <p className="text-blue-800 mb-4">
                If you have any questions about your order, our customer support team is here to help.
              </p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 