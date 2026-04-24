import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, selectCartItems } from '../features/cart/cartSlice';
import { selectAuth } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { FiMinus, FiPlus, FiStar, FiArrowLeft, FiCheck } from 'react-icons/fi';

// Single product fetch cheyyanulla shared hook.
const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      // Particular product ID vechu backend-il ninnu details edukkunnu.
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

// A13 (Product Detail Workflow: Displays individual product specifications, manages dynamic quantity selection, and facilitates secure cart synchronization and direct checkout transitions)
const ProductDetail = () => {
  // URL-il ninnu ID edukkunnu.
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Query hook call cheythu data handle cheyyunnu.
  const { data: product, isLoading, isError } = useProduct(id);
  const { user, isAuthenticated } = useSelector(selectAuth);
  const cartItems = useSelector(selectCartItems) || [];

  // Product cart-il already undo ennu check cheyyunnu.
  const isItemInCart = product ? cartItems.some(item => item.product.id === product.id) : false;

  // Quantity and Image states management.
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  // Quantity increase/decrease logic with stock check.
  const handleQuantityChange = (type) => {
    if (type === 'inc' && quantity < (product?.stock || 1)) setQuantity(q => q + 1);
    else if (type === 'dec' && quantity > 1) setQuantity(q => q - 1);
  };

  // Buy now button click cheyyumpol direct checkout-ilekku vidunnu.
  const handleBuyNow = () => {
    if (!isAuthenticated) { toast.warning('Please log in to purchase'); navigate('/login'); return; }
    navigate('/checkout', { state: { buyNowItem: { product, quantity } } });
  };

  // Add to cart logic and backend synchronization.
  const handleAddToCart = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) { toast.warning('Please log in to add items'); navigate('/login'); return; }

    setIsAdding(true);
    // Redux state-il item add cheyyunnu.
    dispatch(addToCart({ product, quantity }));
    toast.success(`${product.name} added to cart!`);

    try {
      // Database-il (backend) cart details sync cheyyunnu.
      const { data: userCarts } = await api.get(`/carts?userId=${user.id}`);
      if (userCarts.length > 0) {
        const userCart = userCarts[0];
        const existingItemIndex = userCart.items.findIndex(item => item.product.id === product.id);
        let newItems = [...userCart.items];
        if (existingItemIndex > -1) newItems[existingItemIndex].quantity += quantity;
        else newItems.push({ product, quantity });
        await api.put(`/carts/${userCart.id}`, { ...userCart, items: newItems });
      } else {
        await api.post(`/carts`, { id: Date.now().toString(), userId: user.id, items: [{ product, quantity }] });
      }
    } catch (error) { console.error("Failed to sync cart", error); }
    finally { setIsAdding(false); }
  };

  // Loading and Error states.
  if (isLoading && !product) return (<div className="flex flex-col items-center justify-center h-[60vh] text-indigo-600"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div></div>);
  if (isError || !product) return (<div className="bg-red-50 text-red-500 p-8 flex flex-col items-center justify-center mt-10"><h2 className="text-xl font-bold mb-2">Product Not Found</h2><Link to="/" className="text-indigo-600 font-medium hover:underline flex items-center gap-2"><FiArrowLeft /> Back to Home</Link></div>);

  // Discount calculation logic.
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="animate-fadeIn w-full bg-white pb-10">
      {/* Navigation breadcrumb. */}
      <div className="w-full flex justify-between items-center px-4 pt-4 pb-2 border-b border-slate-100"><Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm"><FiArrowLeft /> Back to results</Link><span className="text-slate-400 text-xs uppercase tracking-wider">{product.category} {'>'} {product.subCategory}</span></div>

      <div className="w-full max-w-screen-2xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8 pt-4 px-4">
        {/* Left side - Image gallery section. */}
        <div className="w-full lg:w-4/12 xl:w-1/3 flex flex-col gap-4 sticky top-24">
          <div className="relative border border-slate-200 bg-white"><div className="aspect-square w-full flex justify-center items-center"><img src={product.images[activeImage]} alt={product.name} className="max-w-full max-h-full object-contain p-2" /></div>{discount > 0 && (<div className="absolute top-2 left-2 bg-red-600 text-white font-bold py-1 px-2 text-xs shadow-sm">{discount}% OFF</div>)}</div>
          {product.images.length > 1 && (<div className="flex gap-2 overflow-x-auto hide-scrollbar">{product.images.map((img, index) => (<button key={index} onClick={() => setActiveImage(index)} className={`w-16 h-16 border-2 shrink-0 ${activeImage === index ? 'border-sky-500 shadow-sm' : 'border-slate-200 hover:border-slate-400'}`}><img src={img} alt={`${product.name} thumbnail`} className="w-full h-full object-contain p-1" /></button>))}</div>)}
        </div>

        {/* Center - Product details and specifications. */}
        <div className="w-full lg:w-5/12 xl:w-5/12 flex flex-col"><a href="#" className="mb-1 text-sm font-bold text-sky-700 hover:underline">Visit the {product.brand} Store</a><h1 className="text-xl sm:text-2xl lg:text-[28px] font-normal text-slate-900 mb-2 leading-snug">{product.name}</h1><div className="flex items-center gap-3 mb-3 border-b border-slate-200 pb-3"><div className="flex items-center gap-1 text-yellow-500 text-sm"><span className="flex text-amber-500"><FiStar className="fill-current" /><FiStar className="fill-current" /><FiStar className="fill-current" /><FiStar className="fill-current" /><FiStar /></span><span className="text-sky-700 font-medium hover:underline">{product.rating}</span></div><span className="text-sky-700 text-sm hover:underline">{product.reviews} ratings</span></div><div className="mb-4"><div className="flex items-baseline gap-2"><span className="text-3xl font-medium text-slate-900">₹{product.price.toFixed(2)}</span></div>{product.originalPrice && (<div className="text-sm text-slate-500 mt-1">M.R.P.: <span className="line-through">₹{Math.round(product.originalPrice)}</span></div>)}<p className="text-sm font-medium mt-2">Inclusive of all taxes</p></div><div className="mb-6 pt-4 border-t border-slate-200"><h3 className="text-base font-bold text-slate-900 mb-2">About this item</h3><ul className="list-disc pl-5 space-y-1 text-slate-800 text-sm"><li>{product.description}</li><li>Premium {product.brand} {product.subCategory}</li><li>Daily usage comfort design</li></ul></div></div>

        {/* Right side - Purchase actions and summary. */}
        <div className="w-full lg:w-3/12 xl:w-3/12">
          <div className="border border-slate-300 rounded-lg p-5 bg-white shadow-sm sticky top-24"><div className="text-2xl font-bold text-slate-900 mb-3 block">₹{product.price.toFixed(2)}</div><div className="text-sm mb-4"><span className="text-sky-700 font-medium">FREE Returns</span><br /><span className="text-sky-700 font-medium">FREE delivery</span> <b>Tomorrow</b></div>{product.stock > 0 ? (<h4 className="text-green-700 text-lg font-medium mb-3">In Stock</h4>) : (<h4 className="text-red-700 text-lg font-medium mb-3">Out of Stock</h4>)}<div className="mb-5 flex flex-col gap-1"><label className="text-sm font-bold text-slate-800">Quantity:</label><div className="flex bg-slate-100 rounded-md border border-slate-300 w-[100px] shadow-sm"><button type="button" onClick={() => handleQuantityChange('dec')} disabled={quantity <= 1} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 disabled:opacity-50 text-slate-700"><FiMinus size={14} /></button><span className="flex-1 flex justify-center items-center text-sm font-medium bg-white border-x border-slate-300">{quantity}</span><button type="button" onClick={() => handleQuantityChange('inc')} disabled={quantity >= product.stock} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 disabled:opacity-50 text-slate-700"><FiPlus size={14} /></button></div></div>
            <div className="flex flex-col gap-3">
              {/* Item cart-il undo ennu check cheythu button change cheyyunnu. */}
              {isItemInCart ? (<button type="button" onClick={() => navigate('/cart')} className="w-full bg-slate-900 hover:bg-black text-white text-sm font-bold h-11 rounded-full shadow-md flex justify-center items-center gap-2 transform active:scale-95"><FiCheck className="text-green-400 w-5 h-5" />Go to Cart</button>) : (<button type="button" onClick={handleAddToCart} disabled={product.stock === 0 || isAdding} className={`w-full text-white text-sm font-bold h-11 rounded-full shadow-md transition-all flex justify-center items-center gap-2 transform active:scale-95 ${isAdding ? 'bg-indigo-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}>{isAdding ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white"></div>Adding...</>) : (product.stock === 0 ? 'Unavailable' : 'Add to Cart')}</button>)}
              <button type="button" onClick={handleBuyNow} disabled={product.stock === 0} className="w-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold h-10 rounded-full shadow-md transition-colors disabled:opacity-50">Buy Now</button>
              <div className="flex gap-2 text-xs text-slate-500 mt-2 flex-col"><div className="flex justify-between"><span>Ships from</span> <span>ShopWave</span></div><div className="flex justify-between"><span>Sold by</span> <span>ShopWave Ltd</span></div><div className="flex justify-between"><span>Returns</span> <span className="text-sky-700 underline">Eligible</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
