import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useProducts } from '../features/products/useProducts';
import ProductCard from '../Components/ui/ProductCard';

import { FiCheckCircle, FiHome, FiPrinter, FiPackage, FiAlertCircle, FiClipboard, FiBox, FiTruck } from 'react-icons/fi';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data: products } = useProducts();
  
  const [placedOrder, setPlacedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Note: orderId might be a string, json-server matches strings reliably
        const { data } = await api.get(`/orders/${orderId}`);
        setPlacedOrder(data);
      } catch (err) {
        console.error("Failed to load order receipt", err);
        setError("We couldn't load your order details. The order ID might be invalid.");
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !placedOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn px-4">
         <FiAlertCircle className="w-16 h-16 text-red-500 mb-4" />
         <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Not Found</h2>
         <p className="text-slate-500 max-w-md mb-8">{error}</p>
         <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition">Return Home</button>
      </div>
    );
  }

  const recommendedProducts = products ? products.slice(0, 4) : [];

  return (
    <div className="flex flex-col items-center justify-center py-8 animate-fadeIn w-full max-w-5xl mx-auto px-4 print:py-0 print:px-0">
       
       <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10 mb-12 w-full max-w-2xl flex flex-col items-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-4 shadow-sm border border-green-200 print:hidden">
              <FiCheckCircle className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">Payment Successful!</h2>
          <p className="text-slate-500 mb-8 text-center text-sm sm:text-base">
            Thank you! Your order has been securely placed.
          </p>

          {/* ORDER TRACKING SYSTEM */}
          <div className="w-full mb-12 px-2 sm:px-6 print:hidden">
             <div className="flex items-center justify-between w-full relative mb-10">
                {[
                   { title: 'Order Placed', icon: FiClipboard, status: 'Placed' },
                   { title: 'Processing', icon: FiBox, status: 'Processing' },
                   { title: 'Shipped', icon: FiTruck, status: 'Shipped' },
                   { title: 'Delivered', icon: FiCheckCircle, status: 'Delivered' }
                ].map((step, index, arr) => {
                   // Calculate current status index
                   const statuses = ['Placed', 'Processing', 'Shipped', 'Delivered'];
                   let currentIndex = statuses.indexOf(placedOrder.status || 'Processing');
                   if (currentIndex === -1 && placedOrder.status === 'Processing') currentIndex = 1;
                   if (placedOrder.status === 'Delivered') currentIndex = 3;

                   const isActive = index <= currentIndex;
                   const Icon = step.icon;
                   const isLast = index === arr.length - 1;
                   return (
                      <React.Fragment key={index}>
                         {/* Step Circle */}
                         <div className="relative flex flex-col items-center">
                            <div className={`z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-sm transition-colors duration-500 border-[3px] border-white ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                               <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <p className={`mt-2 text-[10px] sm:text-xs font-bold absolute top-12 sm:top-14 w-24 text-center ${isActive ? 'text-indigo-700' : 'text-slate-400'}`}>
                               {step.title}
                            </p>
                         </div>
                         {/* Connecting Line */}
                         {!isLast && (
                            <div className="flex-1 h-1 bg-slate-200 `mx-[-4px]` z-0 relative">
                               <div className={`absolute left-0 top-0 h-full bg-indigo-600 transition-all duration-500 ${index < currentIndex ? 'w-full' : 'w-0'}`}></div>
                            </div>
                         )}
                      </React.Fragment>
                   );
                })}
             </div>
          </div>

          {/* ORDER RECEIPT TICKET */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-7 mb-8 text-left shadow-inner">
               <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-4">
                  <div>
                     <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><FiPackage className="text-indigo-600"/> Order #{placedOrder.id}</h3>
                     <p className="text-xs text-slate-500 mt-1">{new Date(placedOrder.date).toLocaleString()}</p>
                  </div>
                  <button onClick={() => window.print()} className="text-sky-600 bg-sky-50 px-3 py-1.5 rounded hover:bg-sky-100 hover:text-sky-800 flex items-center gap-2 text-sm font-bold transition-colors print:hidden">
                    <FiPrinter/> Print
                  </button>
               </div>

               <div className="space-y-4 `max-h-[300px]` overflow-y-auto pr-2 custom-scrollbar print:max-h-none print:overflow-visible">
                  {placedOrder.items.map((item, index) => (
                      <div key={index} className="flex gap-4 items-center bg-white p-3 rounded border border-slate-100 shadow-sm">
                         <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 rounded object-cover border border-slate-200 shrink-0" />
                         <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{item.product.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Quantity: <span className="font-bold text-slate-700">{item.quantity}</span></p>
                         </div>
                         <div className="text-right shrink-0">
                            <p className="font-bold text-slate-900 text-sm">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                         </div>
                      </div>
                  ))}
               </div>

               <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200">
                  {placedOrder.shippingAddress && (
                     <div className="mb-4 bg-white p-3 rounded border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Shipping To</p>
                        <p className="text-sm font-medium text-slate-800">{placedOrder.shippingAddress.address}, {placedOrder.shippingAddress.city}, {placedOrder.shippingAddress.state} {placedOrder.shippingAddress.zip}</p>
                     </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                     <span>Subtotal</span>
                     <span>₹{(placedOrder.total / 1.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 mb-3">
                     <span>Tax (8%)</span>
                     <span>₹{(placedOrder.total - (placedOrder.total / 1.08)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-lg text-slate-900 pt-3 border-t border-slate-200">
                     <span>Total Paid</span>
                     <span className="text-indigo-700">₹{placedOrder.total.toFixed(2)}</span>
                  </div>
               </div>
          </div>

          <div className="flex gap-3 w-full justify-center print:hidden">
            <button onClick={() => navigate('/profile')} className="border border-slate-300 text-slate-700 bg-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition shadow-sm text-sm">
              Track Order
            </button>
            <button onClick={() => navigate('/')} className="flex justify-center items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition shadow-sm text-sm">
              <FiHome /> Back to Store
            </button>
          </div>
       </div>

       {/* Keep Shopping - */}
       <div className="w-full print:hidden">
          <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-2">
            <h3 className="text-2xl font-bold text-slate-900">Recommended for You</h3>
            <button onClick={() => navigate('/')} className="text-sky-600 font-medium hover:underline text-sm">See all products</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {recommendedProducts.map(product => (
               <ProductCard key={product.id} product={product} />
             ))}
          </div>
       </div>
    </div>
  );
};

export default OrderSuccess;
