import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: 'bikes' | 'cars';
  brand: string;
  description: string;
  specifications: Record<string, string>;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
}

interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  filters: {
    category: string;
    priceRange: [number, number];
    brand: string;
    search: string;
  };
  sortBy: string;
  isLoading: boolean;
}

const initialState: ProductState = {
  products: [],
  filteredProducts: [],
  selectedProduct: null,
  filters: {
    category: 'all',
    priceRange: [0, 50000000],
    brand: 'all',
    search: '',
  },
  sortBy: 'featured',
  isLoading: false,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.filteredProducts = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ProductState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    applyFilters: (state) => {
      let filtered = [...state.products];

      if (state.filters.category !== 'all') {
        filtered = filtered.filter(product => product.category === state.filters.category);
      }

      if (state.filters.brand !== 'all') {
        filtered = filtered.filter(product => product.brand === state.filters.brand);
      }

      if (state.filters.search) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
          product.brand.toLowerCase().includes(state.filters.search.toLowerCase())
        );
      }

      filtered = filtered.filter(product =>
        product.price >= state.filters.priceRange[0] &&
        product.price <= state.filters.priceRange[1]
      );

      // Apply sorting
      switch (state.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      }

      state.filteredProducts = filtered;
    },
  },
});

export const { setProducts, setSelectedProduct, setFilters, setSortBy, applyFilters } = productSlice.actions;
export default productSlice.reducer;