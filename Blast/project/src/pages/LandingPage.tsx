import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Award, Shield } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-black overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-500 rounded-full opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full opacity-10 animate-bounce" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-red-400 rounded-full opacity-30" />
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
              BLAST WITH
            </span>
            <br />
            <span className="text-red-400">PODILATO</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Experience the Ultimate Collection of Premium Sports Bikes & Luxury Cars
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
            >
              <span>Enter Store</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              to="/about"
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Collection</h2>
            <p className="text-xl text-gray-600">Discover our handpicked selection of premium vehicles</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Bikes Category */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg">
              <img
                src="https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Sports Bikes"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Sports Bikes</h3>
                <p className="text-gray-200 mb-4">Experience the thrill of speed</p>
                <Link
                  to="/products?category=bikes"
                  className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors"
                >
                  <span>Explore Bikes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Cars Category */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg">
              <img
                src="https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Luxury Cars"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Luxury Cars</h3>
                <p className="text-gray-200 mb-4">Redefine your driving experience</p>
                <Link
                  to="/products?category=cars"
                  className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors"
                >
                  <span>Explore Cars</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* All Products */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg md:col-span-2 lg:col-span-1">
              <img
                src="https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="All Products"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-2xl font-bold mb-2">All Products</h3>
                <p className="text-gray-200 mb-4">Browse our complete collection</p>
                <Link
                  to="/products"
                  className="inline-flex items-center space-x-2 bg-white text-red-600 px-6 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600">We provide the best experience for vehicle enthusiasts</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">Only the finest vehicles make it to our collection</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Service</h3>
              <p className="text-gray-600">Our team provides professional guidance and support</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Brand</h3>
              <p className="text-gray-600">Years of experience in the automotive industry</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Purchase</h3>
              <p className="text-gray-600">Safe and secure transactions with warranty protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of satisfied customers who found their dream vehicle with us
          </p>
          <Link
            to="/products"
            className="bg-white text-red-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>Browse Collection</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;