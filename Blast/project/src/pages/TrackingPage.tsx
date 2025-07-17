import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, Truck, Calendar, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ordersAPI } from '../services/api';

interface TrackingData {
  orderNumber: string;
  trackingNumber: string;
  currentStatus: string;
  estimatedDelivery: string;
  timeline: Array<{
    status: string;
    date: string | null;
    completed: boolean;
  }>;
}

const TrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('tracking') || '');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackingNumber) {
      trackOrder(trackingNumber);
    }
  }, [trackingNumber]);

  const trackOrder = async (trackingNum: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ordersAPI.trackOrder(trackingNum);
      setTrackingData(response.data.tracking);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to track order');
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      trackOrder(trackingNumber.trim());
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your tracking number to get real-time updates</p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (e.g., BWP123456)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !trackingNumber.trim()}
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Tracking your order...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Tracking Error</h3>
            </div>
            <p className="text-gray-700">{error}</p>
            <p className="text-sm text-gray-600 mt-2">
              Please check your tracking number and try again.
            </p>
          </div>
        )}

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Order Number</h3>
                  <p className="text-gray-600">{trackingData.orderNumber}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Tracking Number</h3>
                  <p className="text-gray-600 font-mono">{trackingData.trackingNumber}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Estimated Delivery</h3>
                  <p className="text-gray-600">{formatDate(trackingData.estimatedDelivery)}</p>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h3>
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(trackingData.currentStatus)}`}>
                  {trackingData.currentStatus}
                </span>
                <span className="text-gray-600">
                  {trackingData.currentStatus === 'delivered' ? 'Order has been delivered' : 'Order is being processed'}
                </span>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Timeline</h3>
              <div className="space-y-6">
                {trackingData.timeline.map((step, index) => (
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

            {/* Help Section */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
              <p className="text-blue-800 mb-4">
                If you have any questions about your order or need assistance, please contact our customer support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Contact Support
                </button>
                <button className="bg-white text-blue-600 px-6 py-2 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors">
                  View Order Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage; 