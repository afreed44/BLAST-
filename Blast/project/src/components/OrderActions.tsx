import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { cancelOrder } from '../store/slices/orderSlice';
import { X, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';

interface OrderActionsProps {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({
  orderId,
  orderNumber,
  orderStatus,
  onSuccess,
  onError
}) => {
  const dispatch = useDispatch();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const canCancel = ['pending', 'confirmed', 'processing'].includes(orderStatus.toLowerCase());

  const cancelReasons = [
    'Changed my mind',
    'Found a better price elsewhere',
    'Ordered by mistake',
    'Delivery taking too long',
    'Product no longer needed',
    'Other'
  ];

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      onError?.('Please select a cancellation reason');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(cancelOrder({ orderId, reason: cancelReason })).unwrap();
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowCancelModal(false);
        setShowSuccess(false);
        onSuccess?.();
      }, 2000);
      
    } catch (error) {
      onError?.(error as string || 'Failed to cancel order');
    } finally {
      setIsLoading(false);
    }
  };

  if (!canCancel) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowCancelModal(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
      >
        <X className="w-4 h-4" />
        <span>Cancel Order</span>
      </button>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowCancelModal(false)} />

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              {showSuccess ? (
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Order Cancelled Successfully!
                  </h3>
                  <p className="text-gray-600">
                    Order #{orderNumber} has been cancelled. You will receive a confirmation email shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Cancel Order #{orderNumber}
                    </h3>
                  </div>

                  <p className="text-gray-600 mb-6">
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </p>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for cancellation *
                    </label>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="">Select a reason</option>
                      {cancelReasons.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowCancelModal(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                      disabled={isLoading}
                    >
                      Keep Order
                    </button>
                    <button
                      onClick={handleCancelOrder}
                      disabled={isLoading || !cancelReason.trim()}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          <span>Cancel Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderActions;
