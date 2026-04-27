import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { selectCartItems, selectCartTotal, clearCart } from '../features/cart/cartSlice';
import { selectAuth } from '../features/auth/authSlice';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FiCreditCard, FiLock, FiCheckCircle, FiMapPin, FiSmartphone, FiMonitor, FiChevronRight } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';

// Products list fetch cheyyanulla shared hook.
const useProducts = () => {
   return useQuery({
      queryKey: ['products'],
      queryFn: async () => {
         const { data } = await api.get('/products');
         return data;
      },
      staleTime: 10 * 60 * 1000,
   });
};

// A18 (Checkout Workflow: Finalizes the purchasing process by validating shipping credentials, facilitating payment method selection, and executing secure order placement with backend persistence)
const Checkout = () => {
   const cartItems = useSelector(selectCartItems);
   const cartTotal = useSelector(selectCartTotal);
   const { user } = useSelector(selectAuth);
   const { data: products } = useProducts();
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const location = useLocation();

   // Buy now option or direct cart items check cheyyunnu.
   const buyNowItem = location.state?.buyNowItem;
   const displayItems = buyNowItem ? [buyNowItem] : cartItems;
   const displayTotal = buyNowItem ? (buyNowItem.product.price * buyNowItem.quantity) : cartTotal;

   // Order processing and success states.
   const [isProcessing, setIsProcessing] = useState(false);
   const [success, setSuccess] = useState(false);
   const [placedOrder, setPlacedOrder] = useState(null);
   const isRedirecting = useRef(false);

   // Order success aayaal success page-ilekku redirect cheyyunnu.
   useEffect(() => {
      if (success && placedOrder) navigate(`/order-success/${placedOrder.id}`);
   }, [success, placedOrder, navigate]);

   // Shipping addresses management states.
   const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
   const [paymentMethod, setPaymentMethod] = useState('upi');
   const defaultNewAddress = { id: 0, title: "New Address", firstName: user?.name?.split(' ')[0] || "", lastName: user?.name?.split(' ')[1] || "", address: "", city: "", state: "", zip: "" };
   const [addresses, setAddresses] = useState([defaultNewAddress]);
   const [formData, setFormData] = useState(defaultNewAddress);

   // User-e munpe order cheytha addresses backend-il ninnu fetch cheyyunnu.
   useEffect(() => {
      const fetchSavedAddresses = async () => {
         try {
            const { data } = await api.get(`/orders?userId=${user.id}&_sort=date&_order=desc`);
            const seenKeys = new Set();
            const uniqueAddrs = data.filter(o => o.shippingAddress).map(o => o.shippingAddress).filter(addr => {
               if (!addr.address) return false;
               const key = `${addr.address}|${addr.city}|${addr.zip}`.toLowerCase();
               if (seenKeys.has(key)) return false;
               seenKeys.add(key);
               return true;
            }).slice(0, 2).map((addr, index) => ({
               ...defaultNewAddress, ...addr,
               firstName: addr.firstName || addr.name?.split(' ')[0] || user?.name?.split(' ')[0] || "",
               lastName: addr.lastName || addr.name?.split(' ').slice(1).join(' ') || user?.name?.split(' ')[1] || "",
               state: addr.state || "State", id: index,
               title: addr.title && addr.title !== 'New Address' ? addr.title : (index === 0 ? "Home" : "Office")
            }));
            const newAddresses = uniqueAddrs.length > 0 ? [...uniqueAddrs, { ...defaultNewAddress, id: uniqueAddrs.length }] : [defaultNewAddress];
            setAddresses(newAddresses);
            setFormData(newAddresses[0]);
            setSelectedAddressIndex(newAddresses[0].id);
         } catch (error) { console.error("Address fetch failed", error); }
      };
      if (user?.id) fetchSavedAddresses();
   }, [user?.id]);

   // Select cheytha address form-ilekku load cheyyunnu.
   useEffect(() => {
      const selectedAddr = addresses.find(a => a.id === selectedAddressIndex);
      if (selectedAddr) setFormData(selectedAddr);
   }, [selectedAddressIndex, addresses]);

   // Form fields change cheyyumpol logic handle cheyyunnu.
   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setAddresses(prev => prev.map(a => a.id === selectedAddressIndex ? { ...a, [name]: value } : a));
   };

   // Cart empty aayal checkout page-il irikkaan pattilla.
   useEffect(() => {
      if (displayItems.length === 0 && !success && !isRedirecting.current) navigate('/cart');
   }, [displayItems.length, success, navigate]);

   // Final payment click logic and order creation.
   const handlePayment = async (e) => {
      e.preventDefault();
      setIsProcessing(true);
      try {
         // Artificial delay for processing effect.
         await new Promise(resolve => setTimeout(resolve, 1500));

         // Order object prepare cheyyunnu with tax and status.
         const newOrder = { id: Date.now().toString(), userId: user.id, items: displayItems, total: displayTotal + (displayTotal * 0.08), status: "Processing", date: new Date().toISOString(), shippingAddress: formData, paymentMethod };

         // Backend-ilekku order data push cheyyunnu.
         await api.post('/orders', newOrder);

         isRedirecting.current = true;
         // Buy now allenkil cart clear cheyyunnu.
         if (!buyNowItem) {
            const { data: userCarts } = await api.get(`/carts?userId=${user.id}`);
            if (userCarts.length > 0) await api.put(`/carts/${userCarts[0].id}`, { ...userCarts[0], items: [] });
            dispatch(clearCart());
         }

         toast.success("Order placed!");
         setPlacedOrder(newOrder);
         setSuccess(true);
      } catch (error) { toast.error("Payment failed"); }
      finally { setIsProcessing(false); }
   };

   // Success aayaal loading spinner kaanikkunnu.
   if (success && placedOrder) return (<div className="flex flex-col items-center justify-center min-h-screen gap-4"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div><p className="text-slate-500 text-sm">Redirecting...</p></div>);

   return (
      <div style={{ background: '#F1F3F6', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
         {/* Navigation breadcrumb section. */}
         <div style={{ background: '#fff', borderBottom: '1px solid #E8E8E8', padding: '13px 48px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}><Link to="/" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Home</Link><FiChevronRight size={11} /><Link to="/cart" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Bag</Link><FiChevronRight size={11} /><span style={{ color: '#444' }}>Checkout</span></div>
         </div>
         <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
               {/* Shipping address entry and selection area. */}
               <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FiMapPin className="text-indigo-600" /> Shipping</h2>
                  <div className="mb-6 space-y-3"><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{addresses.map((addr) => (<label key={addr.id} className={`border rounded-lg p-4 cursor-pointer transition-all flex flex-col ${selectedAddressIndex === addr.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-100 hover:border-slate-200'}`}><div className="flex items-center justify-between mb-2"><span className="font-bold text-slate-800">{addr.title}</span><input type="radio" checked={selectedAddressIndex === addr.id} onChange={() => setSelectedAddressIndex(addr.id)} className="text-indigo-600" /></div>{addr.address && <span className="text-xs text-slate-500 truncate">{addr.address}</span>}</label>))}</div></div>
                  <form id="checkout-form" onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                     {/* Address form fields (Auto-populated if saved address selected). */}
                     {selectedAddressIndex === addresses[addresses.length - 1]?.id && (<div className="md:col-span-2 mb-2"><div className="flex gap-3">{['Home', 'Office', 'Other'].map((type) => (<label key={type} className={`flex-1 text-center py-2.5 rounded-lg border text-sm font-bold cursor-pointer transition-all ${formData.title === type ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200'}`}><input type="radio" name="title" value={type} checked={formData.title === type} onChange={handleInputChange} className="sr-only" required />{type}</label>))}</div></div>)}
                     <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} placeholder="First Name" className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 outline-none focus:border-indigo-500 transition-colors" /><input type="text" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} placeholder="Last Name" className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 outline-none focus:border-indigo-500 transition-colors" /><input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} placeholder="Address" className="md:col-span-2 p-3 border border-slate-200 rounded-lg bg-slate-50/50 outline-none focus:border-indigo-500 transition-colors" /><input type="text" name="city" value={formData.city || ''} onChange={handleInputChange} placeholder="City" className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 outline-none focus:border-indigo-500 transition-colors" /><div className="grid grid-cols-2 gap-2"><input type="text" name="state" value={formData.state || ''} onChange={handleInputChange} placeholder="State" className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 outline-none focus:border-indigo-500 transition-colors" /><input type="text" name="zip" value={formData.zip || ''} onChange={handleInputChange} placeholder="PIN" className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 outline-none focus:border-indigo-500 transition-colors" /></div>
                  </form>
               </div>
               {/* Payment method selection area. */}
               <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FiLock className="text-indigo-600" /> Payment</h2>
                  <div className="space-y-4">
                     {['upi', 'card', 'netbanking', 'cod'].map(method => (
                        <label key={method} className={`border rounded-lg p-4 cursor-pointer transition-all flex flex-col ${paymentMethod === method ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-100 hover:border-slate-200'}`}>
                           <div className="flex items-center gap-3"><input type="radio" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} className="text-indigo-600" />{method === 'upi' && <FiSmartphone className="text-indigo-600" />}{method === 'card' && <FiCreditCard className="text-indigo-600" />}{method === 'netbanking' && <FiMonitor className="text-indigo-600" />}<span className="font-bold text-slate-800 uppercase">{method}</span></div>
                        </label>
                     ))}
                  </div>
               </div>
            </div>
            {/* Sidebar containing final summary and Place Order button. */}
            <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', position: 'sticky', top: 24 }}>
               <h2 style={{ fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 20 }}>ORDER SUMMARY</h2>
               <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto border-b border-slate-100 pb-6">{displayItems.map((item, i) => (<div key={i} className="flex gap-4 items-center"><img src={item.product.images[0]} style={{ width: 60, height: 75, objectFit: 'cover', borderRadius: 6, border: '1px solid #F1F3F6' }} /><div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{item.product.name}</p><p className="text-xs text-slate-500">Qty: {item.quantity}</p></div><p className="font-bold text-sm">₹{(item.product.price * item.quantity).toFixed(2)}</p></div>))}</div>
               <div className="flex flex-col gap-2 text-sm mb-6"><div className="flex justify-between"><span>MRP</span><span>₹{displayTotal.toFixed(2)}</span></div><div className="flex justify-between"><span>Tax (8%)</span><span>₹{(displayTotal * 0.08).toFixed(2)}</span></div></div>
               <div className="border-y border-slate-100 py-4 mb-6 font-bold flex justify-between"><span>Total</span><span>₹{(displayTotal + (displayTotal * 0.08)).toFixed(2)}</span></div>
               <button form="checkout-form" disabled={isProcessing} className="w-full bg-indigo-600 text-white p-4 rounded font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2">{isProcessing ? 'Processing...' : (<>PLACE ORDER <FiCheckCircle /></>)}</button>
            </div>
         </div>
      </div>
   );
};

export default Checkout;
