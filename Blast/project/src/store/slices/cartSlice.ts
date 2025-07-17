import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Product } from './productSlice';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartNotification {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

interface CartState {
  items: CartItem[];
  total: number;
  isOpen: boolean;
  isLoading: boolean;
  notification: CartNotification;
  itemCount: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
  isOpen: false,
  isLoading: false,
  notification: {
    message: '',
    type: 'success',
    show: false
  },
  itemCount: 0,
};

// Async thunks for cart operations
export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (product: Product, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return product;
    } catch (error) {
      return rejectWithValue('Failed to add item to cart');
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCartAsync',
  async (productId: string, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return productId;
    } catch (error) {
      return rejectWithValue('Failed to remove item from cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find(item => item.product.id === action.payload.id);

      if (existingItem) {
        existingItem.quantity += 1;
        state.notification = {
          message: `Updated ${action.payload.name} quantity in cart`,
          type: 'success',
          show: true
        };
      } else {
        state.items.push({ product: action.payload, quantity: 1 });
        state.notification = {
          message: `${action.payload.name} added to cart successfully!`,
          type: 'success',
          show: true
        };
      }

      state.total = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.product.id === action.payload);
      const productName = item?.product.name || 'Item';

      state.items = state.items.filter(item => item.product.id !== action.payload);
      state.total = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

      state.notification = {
        message: `${productName} removed from cart`,
        type: 'info',
        show: true
      };
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.product.id === action.payload.id);
      if (item) {
        const oldQuantity = item.quantity;
        item.quantity = action.payload.quantity;

        if (item.quantity <= 0) {
          state.items = state.items.filter(item => item.product.id !== action.payload.id);
          state.notification = {
            message: `${item.product.name} removed from cart`,
            type: 'info',
            show: true
          };
        } else {
          state.notification = {
            message: `${item.product.name} quantity updated`,
            type: 'success',
            show: true
          };
        }
      }

      state.total = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    clearCart: (state) => {
      const itemCount = state.items.length;
      state.items = [];
      state.total = 0;
      state.itemCount = 0;

      if (itemCount > 0) {
        state.notification = {
          message: 'Cart cleared successfully',
          type: 'info',
          show: true
        };
      }
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    hideNotification: (state) => {
      state.notification.show = false;
    },
    showNotification: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
      state.notification = {
        message: action.payload.message,
        type: action.payload.type,
        show: true
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to cart async
      .addCase(addToCartAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const existingItem = state.items.find(item => item.product.id === action.payload.id);

        if (existingItem) {
          existingItem.quantity += 1;
          state.notification = {
            message: `Updated ${action.payload.name} quantity in cart`,
            type: 'success',
            show: true
          };
        } else {
          state.items.push({ product: action.payload, quantity: 1 });
          state.notification = {
            message: `🛒 ${action.payload.name} added to cart successfully!`,
            type: 'success',
            show: true
          };
        }

        state.total = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.notification = {
          message: action.payload as string || 'Failed to add item to cart',
          type: 'error',
          show: true
        };
      })
      // Remove from cart async
      .addCase(removeFromCartAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const item = state.items.find(item => item.product.id === action.payload);
        const productName = item?.product.name || 'Item';

        state.items = state.items.filter(item => item.product.id !== action.payload);
        state.total = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

        state.notification = {
          message: `${productName} removed from cart`,
          type: 'info',
          show: true
        };
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.notification = {
          message: action.payload as string || 'Failed to remove item from cart',
          type: 'error',
          show: true
        };
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  hideNotification,
  showNotification
} = cartSlice.actions;

export default cartSlice.reducer;