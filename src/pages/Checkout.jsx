import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { selectCartItems, selectCartTotal, clearCart } from '../features/cart/cartSlice';
import { selectAuth } from '../features/auth/authSlice';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FiCreditCard, FiLock, FiCheckCircle, FiHome, FiPrinter, FiPackage, FiMapPin, FiSmartphone, FiMonitor, FiDollarSign, FiChevronRight } from 'react-icons/fi';
import { useProducts } from '../features/products/useProducts';
// import ProductCard from '../components/ui/ProductCard';

const Checkout = () => {
   const cartItems = useSelector(selectCartItems);
   const cartTotal = useSelector(selectCartTotal);
   const { user } = useSelector(selectAuth);

   const { data: products } = useProducts();

   const dispatch = useDispatch();
   const navigate = useNavigate();
   const location = useLocation();

   const buyNowItem = location.state?.buyNowItem;
   const displayItems = buyNowItem ? [buyNowItem] : cartItems;
   const displayTotal = buyNowItem ? (buyNowItem.product.price * buyNowItem.quantity) : cartTotal;

   const [isProcessing, setIsProcessing] = useState(false);
   const [success, setSuccess] = useState(false);
   const [placedOrder, setPlacedOrder] = useState(null);
   const isRedirecting = useRef(false); 
   useEffect(() => {
      if (success && placedOrder) {
         navigate(`/order-success/${placedOrder.id}`);
      }
   }, [success, placedOrder, navigate]);

   // Form & Selection States
   const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
   const [paymentMethod, setPaymentMethod] = useState('upi');

   const defaultNewAddress = { id: 0, title: "New Address", firstName: user?.name?.split(' ')[0] || "", lastName: user?.name?.split(' ')[1] || "", address: "", city: "", state: "", zip: "" };

   const [addresses, setAddresses] = useState([defaultNewAddress]);
   const [formData, setFormData] = useState(defaultNewAddress);

   useEffect(() => {
      const fetchSavedAddresses = async () => {
         try {
            const { data } = await api.get(`/orders?userId=${user.id}&_sort=date&_order=desc`);
            const seenKeys = new Set();
            const uniqueAddrs = data
               .filter(o => o.shippingAddress)
               .map(o => o.shippingAddress)
               .filter(addr => {
                  if(!addr.address) return false;
                  const key = `${addr.address}|${addr.city}|${addr.zip}`.toLowerCase();
                  if (seenKeys.has(key)) return false;
                  seenKeys.add(key);
                  return true;
               })
               .slice(0, 2)
               .map((addr, index) => {
                  const fName = addr.firstName || addr.name?.split(' ')[0] || user?.name?.split(' ')[0] || "";
                  const lName = addr.lastName || addr.name?.split(' ').slice(1).join(' ') || user?.name?.split(' ')[1] || "";
                  return {
                     ...defaultNewAddress,
                     ...addr,
                     firstName: fName,
                     lastName: lName,
                     state: addr.state || "State",
                     id: index,
                     title: addr.title && addr.title !== 'New Address' ? addr.title : (index === 0 ? "Home" : "Office")
                  };
               });

            let newAddresses = [];
            if (uniqueAddrs.length > 0) {
               newAddresses = [...uniqueAddrs, { ...defaultNewAddress, id: uniqueAddrs.length }];
            } else {
               newAddresses = [defaultNewAddress];
            }

            setAddresses(newAddresses);
            const firstAddr = newAddresses[0];
            setFormData(firstAddr);
            setSelectedAddressIndex(firstAddr.id);

         } catch (error) {
            console.error("Fetch orders/addresses failed", error);
         }
      };
      if (user?.id) {
         fetchSavedAddresses();
      }

   }, [user?.id]);

   // Update form when address selection changes
   useEffect(() => {
      const selectedAddr = addresses.find(a => a.id === selectedAddressIndex);
      if (selectedAddr) {
         setFormData(selectedAddr);
      }
     
   }, [selectedAddressIndex]);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Automatically update the selected address profile with these live edits
      setAddresses((prev) => {
         const newAddresses = [...prev];
         const idx = newAddresses.findIndex(a => a.id === selectedAddressIndex);
         if (idx !== -1) {
            newAddresses[idx] = { ...newAddresses[idx], [name]: value };
         }
         return newAddresses;
      });
   };


   useEffect(() => {
      if (displayItems.length === 0 && !success && !isRedirecting.current) {
         navigate('/cart');
      }
   }, [displayItems.length, success, navigate]);

   if (displayItems.length === 0 && !success && !isRedirecting.current) {
      return null;
   }

   const handlePayment = async (e) => {
      e.preventDefault();
      setIsProcessing(true);

      try {
         // Simulate payment delay
         await new Promise(resolve => setTimeout(resolve, 1500));

         const newOrder = {
            id: Date.now().toString(),
            userId: user.id,
            items: displayItems,
            total: displayTotal + (displayTotal * 0.08),
            status: "Processing",
            date: new Date().toISOString(),
            shippingAddress: formData,
            paymentMethod: paymentMethod
         };
         await api.post('/orders', newOrder);

         // Set ref BEFORE clearing cart — blocks cart-empty useEffect guard
         isRedirecting.current = true;

         // Only clear user's cart if this was a cart checkout
         if (!buyNowItem) {
            const { data: userCarts } = await api.get(`/carts?userId=${user.id}`);
            if (userCarts.length > 0) {
               await api.put(`/carts/${userCarts[0].id}`, { ...userCarts[0], items: [] });
            }
            dispatch(clearCart());
         }

         toast.success("Order placed successfully!");
    
         setPlacedOrder(newOrder);
         setSuccess(true);
      } catch (error) {
         console.error("Payment failed", error);
         isRedirecting.current = false; // Allow guard again on failure
         toast.error("Payment processing failed. Please try again.");
      } finally {
         setIsProcessing(false);
      }
   };

   // Safety fallback UI while the navigate useEffect fires
   if (success && placedOrder) {
      return (
         <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-500 text-sm">Redirecting to your order receipt...</p>
         </div>
      );
   }

   return (
      <div style={{ background: '#F1F3F6', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

         {/* ── Breadcrumb ── */}
         <div style={{ background: '#fff', borderBottom: '1px solid #E8E8E8', padding: '13px clamp(12px,4vw,48px)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}>
               <Link to="/" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
               <FiChevronRight size={11} />
               <Link to="/cart" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Shopping Bag</Link>
               <FiChevronRight size={11} />
               <span style={{ color: '#444' }}>Checkout</span>
            </div>
         </div>

         <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px clamp(12px,4vw,28px)', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18, alignItems: 'start' }}>

            {/* LEFT COLUMN: FORMS & PAYMENT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

               <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                     <FiMapPin className="text-indigo-600" /> Shipping Details
                  </h2>

                  {/* Address Selector */}
                  <div className="mb-6 space-y-3">
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Saved Addresses</p>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {addresses.map((addr) => (
                           <label key={addr.id} className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col ${selectedAddressIndex === addr.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300'}`}>
                              <div className="flex items-center justify-between mb-2">
                                 <span className="font-bold text-slate-800">
                                    {addr.id === addresses[addresses.length - 1]?.id ? (addr.title && addr.title !== 'New Address' ? addr.title : 'New Address') : addr.title}
                                 </span>
                                 <input type="radio" name="addressSelect" checked={selectedAddressIndex === addr.id} onChange={() => setSelectedAddressIndex(addr.id)} className="text-indigo-600 focus:ring-indigo-500" />
                              </div>
                              {addr.id !== addresses[addresses.length - 1]?.id && (
                                 <span className="text-xs text-slate-500 leading-tight">
                                    {addr.address}, {addr.city}
                                 </span>
                              )}
                           </label>
                        ))}
                     </div>
                  </div>

                  <form id="checkout-form" onSubmit={handlePayment}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {selectedAddressIndex === addresses[addresses.length - 1]?.id && (
                           <div className="md:col-span-2 mb-2">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Save Address As</p>
                              <div className="flex gap-3">
                                 {['Home', 'Office', 'Other'].map((type) => (
                                    <label key={type} className={`flex-1 text-center py-2.5 rounded-xl border text-sm font-bold cursor-pointer transition-all duration-200 ${formData.title === type ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-500 hover:bg-slate-50'}`}>
                                       <input type="radio" name="title" value={type} checked={formData.title === type} onChange={handleInputChange} className="sr-only" required />
                                       {type}
                                    </label>
                                 ))}
                              </div>
                           </div>
                        )}
                        <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} placeholder="First Name" className="p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
                        <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} placeholder="Last Name" className="p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
                        <input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} placeholder="Street Address" className="md:col-span-2 p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
                        <input type="text" name="city" value={formData.city || ''} onChange={handleInputChange} placeholder="City" className="p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
                        <div className="grid grid-cols-2 gap-2">
                           <input type="text" name="state" value={formData.state || ''} onChange={handleInputChange} placeholder="State" className="p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
                           <input type="text" name="zip" value={formData.zip || ''} onChange={handleInputChange} placeholder="PIN Code" className="p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
                        </div>
                     </div>
                  </form>
               </div>

               {/* Payment Method */}
               <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                     <FiLock className="text-indigo-600" /> Payment Method
                  </h2>

                  <div className="space-y-4">
                     {/* UPI Option */}
                     <label className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col ${paymentMethod === 'upi' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                           <input type="radio" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-primary-600 focus:ring-primary-500 h-4 w-4" />
                           <FiSmartphone className="text-primary-600 text-xl" />
                           <span className="font-bold text-slate-800">UPI ID / QR</span>
                        </div>
                        {paymentMethod === 'upi' && (
                           <div className="ml-7 mt-3">
                              <input type="text" placeholder="user@upi" className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white max-w-sm text-sm" />
                              <p className="text-xs text-slate-500 mt-2">A payment request will be sent to this UPI ID.</p>
                           </div>
                        )}
                     </label>

                     {/* Card Option */}
                     <label className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col ${paymentMethod === 'card' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                           <input type="radio" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-primary-600 focus:ring-primary-500 h-4 w-4" />
                           <FiCreditCard className="text-primary-600 text-xl" />
                           <span className="font-bold text-slate-800">Credit / Debit Card</span>
                        </div>
                        {paymentMethod === 'card' && (
                           <div className="ml-7 mt-3 space-y-3 max-w-sm">
                              <input type="text" placeholder="Card Number" className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white text-sm" />
                              <div className="flex gap-3">
                                 <input type="text" placeholder="MM/YY" className="w-1/2 p-3 border border-slate-300 rounded-lg outline-none bg-white text-sm" />
                                 <input type="text" placeholder="CVV" className="w-1/2 p-3 border border-slate-300 rounded-lg outline-none bg-white text-sm" />
                              </div>
                           </div>
                        )}
                     </label>

                     {/* Net Banking Option */}
                     <label className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col ${paymentMethod === 'netbanking' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                           <input type="radio" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-primary-600 focus:ring-primary-500 h-4 w-4" />
                           <FiMonitor className="text-primary-600 text-xl" />
                           <span className="font-bold text-slate-800">Net Banking</span>
                        </div>
                        {paymentMethod === 'netbanking' && (
                           <div className="ml-7 mt-3">
                              <select className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white max-w-sm text-sm">
                                 <option>HDFC Bank</option>
                                 <option>SBI</option>
                                 <option>ICICI Bank</option>
                                 <option>Axis Bank</option>
                              </select>
                           </div>
                        )}
                     </label>

                     {/* COD Option */}
                     <label className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                           <input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-primary-600 focus:ring-primary-500 h-4 w-4" />
                           <span className="text-primary-600 text-xl">₹</span>
                           <span className="font-bold text-slate-800">Cash on Delivery</span>
                        </div>
                     </label>
                  </div>
               </div>

            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY */}
            <div>
               <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', position: 'sticky', top: 24 }}>
                  <h2 style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: '0.05em', marginBottom: 20 }}>PRICE DETAILS ({displayItems.length} Items)</h2>

                  {/* Cart Items Summary */}
                  <div className="space-y-4 mb-6 `max-h-[300px]` overflow-y-auto pr-2 custom-scrollbar border-b border-slate-100 pb-6">
                     {displayItems.map((item, index) => (
                        <div key={index} className="flex gap-4 items-center">
                           <img src={item.product.images[0]} alt={item.product.name} style={{ width: 60, height: 75, borderRadius: 4, objectFit: 'cover', background: '#F8F8F8' }} />
                           <div className="flex-1 min-w-0">
                              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.name}</p>
                              <p style={{ fontSize: 12, color: '#777' }}>Qty: {item.quantity}</p>
                           </div>
                           <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: '#111' }}>₹{(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                     ))}
                  </div>

                  {/* Calculation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: '#333', marginBottom: 16 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total MRP</span>
                        <span>₹{displayTotal.toFixed(2)}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tax (8%)</span>
                        <span>₹{(displayTotal * 0.08).toFixed(2)}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Delivery Fee</span>
                        <span style={{ color: '#16A34A' }}>FREE</span>
                     </div>
                  </div>

                  {/* Total & Button */}
                  <div style={{ borderTop: '1px dashed #DDD', paddingTop: 16, borderBottom: '1px dashed #DDD', paddingBottom: 16, marginBottom: 24 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#111' }}>
                        <span>Total Amount</span>
                        <span>₹{(displayTotal + (displayTotal * 0.08)).toFixed(2)}</span>
                     </div>
                  </div>

                  <button
                     type="submit"
                     form="checkout-form"
                     disabled={isProcessing}
                     style={{ width: '100%', border: 'none', background: '#7C3AED', color: '#fff', padding: '14px', borderRadius: 4, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
                     onMouseEnter={e => { if (!isProcessing) e.currentTarget.style.background = '#6D28D9' }}
                     onMouseLeave={e => { if (!isProcessing) e.currentTarget.style.background = '#7C3AED' }}
                  >
                     {isProcessing ? (
                        <>
                           <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                           Processing...
                        </>
                     ) : (
                        <>PLACE ORDER <FiCheckCircle size={16} /></>
                     )}
                  </button>
                  <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: '#888', marginTop: 12 }}>
                     <FiLock /> 100% Secure SSL Payments
                  </p>

               </div>
            </div>

         </div>
      </div>
   );
};

export default Checkout;
