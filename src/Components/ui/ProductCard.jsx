import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';


const ProductCard = ({ product }) => {
 
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="group glass rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full bg-white relative">
      
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {discount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            {discount}% OFF
          </span>
        )}
        {product.featured && (
           <span className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
             Featured
           </span>
        )}
      </div>

      {/* Image Container with hover zoom effect */}
      <Link to={`/product/${product.id}`} className="block relative h-40 sm:h-56 overflow-hidden bg-slate-50">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Content Area */}
      <div className="p-3 sm:p-4 flex flex-col grow">
        <div className="flex justify-between items-start mb-1 sm:mb-2">
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide uppercase mb-0.5 sm:mb-1">{product.category}</p>
            <Link to={`/product/${product.id}`}>
              <h3 className="text-sm sm:font-semibold text-slate-800 line-clamp-2 hover:text-primary-600 transition-colors leading-tight">
                {product.name}
              </h3>
            </Link>
          </div>
        </div>

        {/* Ratings */}
        <div className="flex items-center gap-1 mb-3">
          <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-slate-700">{product.rating}</span>
          <span className="text-xs text-slate-400">({product.reviews})</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-1">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-slate-900">₹{product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-sm text-slate-400 line-through">₹{product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          
          <button 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary-600 hover:text-white transition-colors shrink-0"
            title="Add to Cart"
          >
            <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
