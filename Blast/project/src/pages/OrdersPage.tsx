import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { fetchUserOrders, cancelOrder } from '../store/slices/orderSlice';
import { Package, Truck, Calendar, Eye, X, AlertCircle, CheckCircle } from 'lucide-react';

const OrdersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { orders, isLoading, error } = useSelector((state: RootState) => state.orders);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchUserOrders());
  }, [dispatch, isAuthenticated, navigate]);

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
      day: 'numeric'
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

  const canCancelOrder = (order: any) => {
    return ['pending', 'confirmed', 'processing'].includes(order.orderStatus);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    setCancellingOrder(orderId);
    try {
      await dispatch(cancelOrder({ orderId, reason: cancelReason })).unwrap();
      setShowCancelModal(null);
      setCancelReason('');
      // Refresh orders
      dispatch(fetchUserOrders());
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setCancellingOrder(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>
          <Link
            to="/products"
            className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            <span>Continue Shopping</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <Link
              to="/products"
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-4 mb-2 md:mb-0">
                      <div>
                        <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                        <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                      </div>
                      <Link
                        to={`/order/${order._id}`}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="px-6 py-4">
                  <div className="flex items-center space-x-4 overflow-x-auto">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex-shrink-0 flex items-center space-x-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-medium text-sm text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex-shrink-0 text-sm text-gray-600">
                        +{order.items.length - 3} more item(s)
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-6 mb-2 md:mb-0">
                      {order.trackingNumber && (
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Tracking: <span className="font-medium">{order.trackingNumber}</span>
                          </span>
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Est. Delivery: <span className="font-medium">{formatDate(order.estimatedDelivery)}</span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {order.trackingNumber && (
                        <Link
                          to={`/track-order?tracking=${order.trackingNumber}`}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Track Order
                        </Link>
                      )}
                      <Link
                        to={`/order/${order._id}`}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        View Details
                      </Link>
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => setShowCancelModal(order._id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Order Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Order</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-none"
                rows={3}
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(null);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={() => handleCancelOrder(showCancelModal)}
                  disabled={cancellingOrder === showCancelModal}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancellingOrder === showCancelModal ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;