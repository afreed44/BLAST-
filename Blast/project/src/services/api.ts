import axios from 'axios';

const API_BASE_URL = 'http://localhost:5004/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface UserData {
  name: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface OrderData {
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      image: string;
      brand: string;
    };
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
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
  };
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface OrderStatusUpdate {
  status: string;
  description?: string;
  location?: string;
}

interface CancelOrderData {
  reason: string;
}

interface RefundRequestData {
  reason: string;
  amount?: number;
}

// Auth API
export const authAPI = {
  register: (userData: UserData) =>
    api.post('/auth/register', userData),
  
  login: (credentials: LoginCredentials) =>
    api.post('/auth/login', credentials),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData: OrderData) =>
    api.post('/orders', orderData),
  
  getUserOrders: () =>
    api.get('/orders/my-orders'),
  
  getOrder: (orderId: string) =>
    api.get(`/orders/${orderId}`),
  
  trackOrder: (trackingNumber: string) =>
    api.get(`/orders/track/${trackingNumber}`),
  
  updateOrderStatus: (orderId: string, statusData: OrderStatusUpdate) =>
    api.patch(`/orders/${orderId}/status`, statusData),
  
  cancelOrder: (orderId: string, cancelData: CancelOrderData) =>
    api.patch(`/orders/${orderId}/cancel`, cancelData),
  
  requestRefund: (orderId: string, refundData: RefundRequestData) =>
    api.post(`/orders/${orderId}/refund`, refundData),
};

// Users API
export const usersAPI = {
  updateProfile: (profileData: ProfileData) =>
    api.put('/users/profile', profileData),
};

// Location API
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

// Health check function
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch {
    throw new Error('Server is not responding');
  }
};

export default api;