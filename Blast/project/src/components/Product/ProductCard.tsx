import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Product } from '../../store/slices/productSlice';
import { addToCartAsync } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { RootState } from '../../store/store';
import { Heart, ShoppingCart, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  
  const isInWishlist = wishlistItems.find(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(addToCartAsync(product));
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isInWishlist
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <Heart className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Out of Stock
          </div>
        )}

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 capitalize">{product.category}</span>
          <span className="text-sm text-gray-500">{product.brand}</span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">({product.reviews})</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full py-3 rounded-full font-semibold transition-colors flex items-center justify-center space-x-2 ${
            product.inStock
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;