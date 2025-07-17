import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ordersAPI } from '../../services/api';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface TrackingHistoryEntry {
  status: string;
  description: string;
  location: string;
  timestamp: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  trackingNumber: string;
  estimatedDelivery: string;
  deliveredAt?: string;
  createdAt: string;
  trackingHistory: TrackingHistoryEntry[];
  shippingCarrier: string;
  shippingMethod: string;
  notes?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundStatus: string;
}

interface OrderData {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  orderPlaced: boolean;
  trackingData: any | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  orderPlaced: false,
  trackingData: null,
};

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData: OrderData, { rejectWithValue }) => {
    try {
      console.log('Creating order with data:', orderData);
      const response = await ordersAPI.createOrder(orderData);
      console.log('Order creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Order creation error:', error);

      let errorMessage = 'Failed to place order';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getUserOrders();
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchOrder = createAsyncThunk(
  'orders/fetchOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getOrder(orderId);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
      return rejectWithValue(errorMessage);
    }
  }
);

export const trackOrder = createAsyncThunk(
  'orders/trackOrder',
  async (trackingNumber: string, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.trackOrder(trackingNumber);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to track order';
      return rejectWithValue(errorMessage);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, reason }: { orderId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.cancelOrder(orderId, { reason });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
      return rejectWithValue(errorMessage);
    }
  }
);

export const requestRefund = createAsyncThunk(
  'orders/requestRefund',
  async ({ orderId, reason, amount }: { orderId: string; reason: string; amount?: number }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.requestRefund(orderId, { reason, amount });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request refund';
      return rejectWithValue(errorMessage);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderPlaced: (state) => {
      state.orderPlaced = false;
      state.currentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearTrackingData: (state) => {
      state.trackingData = null;
    },
    resetOrderState: (state) => {
      state.orderPlaced = false;
      state.currentOrder = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.orderPlaced = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderPlaced = true;
        state.currentOrder = action.payload.order;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.orderPlaced = false;
      });

    // Fetch user orders
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.error = null;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single order
    builder
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.order;
        state.error = null;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Track order
    builder
      .addCase(trackOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trackingData = action.payload.tracking;
        state.error = null;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.trackingData = null;
      });

    // Cancel order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the order in the list
        const orderIndex = state.orders.findIndex(order => order._id === action.payload.order.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex].orderStatus = action.payload.order.status;
        }
        // Update current order if it's the same
        if (state.currentOrder && state.currentOrder._id === action.payload.order.id) {
          state.currentOrder.orderStatus = action.payload.order.status;
        }
        state.error = null;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Request refund
    builder
      .addCase(requestRefund.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestRefund.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the order in the list
        const orderIndex = state.orders.findIndex(order => order._id === action.payload.order.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex].refundStatus = action.payload.order.refundStatus;
          state.orders[orderIndex].refundAmount = action.payload.order.refundAmount;
        }
        // Update current order if it's the same
        if (state.currentOrder && state.currentOrder._id === action.payload.order.id) {
          state.currentOrder.refundStatus = action.payload.order.refundStatus;
          state.currentOrder.refundAmount = action.payload.order.refundAmount;
        }
        state.error = null;
      })
      .addCase(requestRefund.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrderPlaced, clearError, clearTrackingData, resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;