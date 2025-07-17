import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setSelectedProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { mockProducts } from '../data/mockData';
import { Heart, ShoppingCart, Star, ArrowLeft, Share2, Shield, Truck, RefreshCw } from 'lucide-react';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedProduct } = useSelector((state: RootState) => state.products);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      const product = mockProducts.find(p => p.id === id);
      dispatch(setSelectedProduct(product || null));
    }
  }, [id, dispatch]);

  const isInWishlist = wishlistItems.find(item => item.id === selectedProduct?.id);

  const handleAddToCart = () => {
    if (selectedProduct) {
      for (let i = 0; i < quantity; i++) {
        dispatch(addToCart(selectedProduct));
      }
    }
  };

  const handleToggleWishlist = () => {
    if (selectedProduct) {
      if (isInWishlist) {
        dispatch(removeFromWishlist(selectedProduct.id));
      } else {
        dispatch(addToWishlist(selectedProduct));
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-gray-600 mb-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center space-x-2 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-white rounded-2xl overflow-hidden shadow-lg">
              <img
                src={selectedProduct.images[selectedImage]}
                alt={selectedProduct.name}
                className="w-full h-96 object-cover"
              />
            </div>
            
            {selectedProduct.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {selectedProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-red-600' : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${selectedProduct.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 uppercase tracking-wide">
                  {selectedProduct.brand} • {selectedProduct.category}
                </span>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedProduct.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(selectedProduct.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {selectedProduct.rating} ({selectedProduct.reviews} reviews)
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(selectedProduct.price)}
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(selectedProduct.originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 mb-6">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedProduct.inStock}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    selectedProduct.inStock
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{selectedProduct.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
                
                <button
                  onClick={handleToggleWishlist}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 border-2 ${
                    isInWishlist
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-red-600 border-red-600 hover:bg-red-50'
                  }`}
                >
                  <Heart className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} />
                  <span>{isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Truck className="w-5 h-5" />
                  <span className="text-sm">Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Warranty</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-sm">Easy Returns</span>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">{key}:</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;