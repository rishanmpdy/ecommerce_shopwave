import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotal, removeFromCart, updateQuantity, clearCart } from '../features/cart/cartSlice';
import { selectAuth } from '../features/auth/authSlice';
import api from '../api/axios';
import { FiTrash2, FiShoppingBag, FiChevronRight, FiTag, FiShield, FiTruck, FiRefreshCw, FiArrowRight, FiMinus, FiPlus, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

// A14 (Cart Workflow: Orchestrates the shopping bag experience, facilitating real-time quantity adjustments, item removals, and a comprehensive coupon validation engine with multi-tier eligibility checks)
const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux-il ninnu cart items-um user details-um edukkunnu.
  const items = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const { user } = useSelector(selectAuth);

  // Coupon management state.
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Item remove cheyyumpol.
  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
    toast.info('item removed', { icon: '🗑️' });
  };

  // Quantity adjust cheyyumpol.
  const handleQty = (id, qty) => {
    if (qty < 1) return;
    dispatch(updateQuantity({ productId: id, quantity: qty }));
  };

  // Coupon apply cheyyanulla main logic.
  const handleCoupon = async () => {
    const codeEntered = couponCode.trim().toUpperCase();
    if (!codeEntered) return;

    // Login cheythilla enkil coupon apply cheyyaan pattilla.
    if (!user) { toast.error('Please login to apply coupons'); return; }

    try {
      // Backend-il coupon undo ennu check cheyyunnu.
      const { data } = await api.get(`/coupons?code=${codeEntered}`);
      if (data.length === 0) { toast.error('Invalid coupon code'); return; }

      const coupon = data[0];

      // Everyone can use the coupon now as per requirement.
      // We still require login to apply coupons (checked above).

      // Expiry date check cheyyunnu.
      if (new Date(coupon.expiry) < new Date()) { toast.error('Coupon expired'); return; }

      // Minimum order value condition check cheyyunnu.
      if (coupon.minOrder && cartTotal < coupon.minOrder) { toast.error(`Min order: ₹${coupon.minOrder}`); return; }

      // Discount amount calculate cheyyunnu (Percentage or Flat).
      let discount = coupon.type === 'percent' ? Math.round(cartTotal * (coupon.discount / 100)) : Number(coupon.discount);
      if (discount > cartTotal) discount = cartTotal;

      setCouponDiscount(discount);
      setCouponApplied(coupon);
      toast.success('Coupon applied!');
    } catch (error) { toast.error('Error applying coupon'); }
  };

  // Coupon remove cheyyumpol details reset cheyyunnu.
  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  // Final calculations prepare cheyyunnu.
  const originalTotal = items.reduce((sum, item) => (sum + (item.product.originalPrice || item.product.price * 1.2) * item.quantity), 0);
  const savedAmount = originalTotal - cartTotal;
  const deliveryCharge = cartTotal >= 3000 ? 0 : 99;
  const finalTotal = cartTotal - couponDiscount + deliveryCharge;

  // Trust indicators for UI.
  const trustItems = [
    { icon: <FiTruck />, text: 'Free Delivery on ₹3000+' },
    { icon: <FiRefreshCw />, text: '10-Day Easy Returns' },
    { icon: <FiShield />, text: '100% Secure Payments' },
  ];

  // Cart empty aayaal kaanikkanulla UI.
  if (items.length === 0) {
    return (
      <div style={{ background: '#F1F3F6', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '56px 40px', textAlign: 'center', maxWidth: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 90, height: 90, background: '#F5F3FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>🛒</div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 20, color: '#111', margin: '0 0 8px' }}>Your cart is empty</h2>
          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#7C3AED', color: '#fff', padding: '12px 32px', borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}><FiShoppingBag size={15} /> Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F1F3F6', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Breadcrumb area. */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8E8E8', padding: '13px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}><Link to="/" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Home</Link><FiChevronRight size={11} /><span style={{ color: '#444' }}>Shopping Bag</span><span style={{ marginLeft: 4, background: '#7C3AED', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>{items.length}</span></div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18, alignItems: 'start' }}>
        <div>
          {/* Cart header with clear all button. */}
          <div style={{ background: '#fff', borderRadius: 8, padding: '14px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#111' }}>Shopping Bag</span><span style={{ fontSize: 13, color: '#AAA', marginLeft: 10 }}>({items.length} {items.length === 1 ? 'item' : 'items'})</span></div>
            <button onClick={() => { dispatch(clearCart()); toast.info('cart cleared'); }} style={{ border: 'none', background: 'transparent', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><FiTrash2 size={12} /> Clear All</button>
          </div>
          {/* Cart items list rendering area. */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item) => {
              const product = item.product;
              const mrp = product.originalPrice || product.price * 1.2;
              const saved = Math.round(((mrp - product.price) / mrp) * 100);
              return (
                <div key={item.product.id} style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', gap: 16, position: 'relative' }}>
                  {/* Product image and discount tag. */}
                  <div style={{ position: 'relative', flexShrink: 0 }}><Link to={`/product/${product.id}`}><div style={{ width: 110, height: 130, borderRadius: 8, overflow: 'hidden', border: '1px solid #E8E8E8', background: '#F8F8F8' }}><img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div></Link>{saved > 0 && (<span style={{ position: 'absolute', top: 8, left: 8, background: '#16A34A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>{saved}% OFF</span>)}</div>
                  {/* Product details (Brand, Name, Price, Qty). */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}><p style={{ fontSize: 11, fontWeight: 700, color: '#AAA', textTransform: 'uppercase', margin: 0 }}>{product.brand}</p><Link to={`/product/${product.id}`} style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: '#111', textDecoration: 'none' }}>{product.name}</Link><div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}><span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: '#111' }}>₹{product.price.toFixed(2)}</span>{mrp > product.price && (<span style={{ fontSize: 13, color: '#BBB', textDecoration: 'line-through' }}>₹{mrp.toFixed(0)}</span>)}{saved > 0 && (<span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>{saved}% off</span>)}</div><div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 8, width: 'fit-content' }}><button onClick={() => handleQty(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1} style={{ width: 30, height: 30, border: '1px solid #DDD', borderRadius: '6px 0 0 6px', background: item.quantity <= 1 ? '#F8F8F8' : '#fff', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiMinus size={11} /></button><div style={{ width: 40, height: 30, border: '1px solid #DDD', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#333' }}>{item.quantity}</div><button onClick={() => handleQty(item.product.id, item.quantity + 1)} style={{ width: 30, height: 30, border: '1px solid #DDD', borderRadius: '0 6px 6px 0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPlus size={11} /></button></div></div>
                  <button onClick={() => handleRemove(item.product.id)} style={{ position: 'absolute', top: 14, right: 14, border: 'none', background: '#F1F3F6', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}><FiX size={13} /></button>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, textAlign: 'center' }}><Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7C3AED', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}><FiShoppingBag size={13} /> Continue Shopping</Link></div>
        </div>
        {/* Sidebar containing price details and checkout button. */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Coupon apply box. */}
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><FiTag color="#7C3AED" size={15} /><span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: '#111' }}>Apply Coupon</span></div>
            {couponApplied ? (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F0FDF4', border: '1.5px dashed #16A34A', borderRadius: 6, padding: '9px 12px' }}><div><span style={{ fontSize: 12, fontWeight: 800, color: '#16A34A' }}>{couponApplied.code}</span><span style={{ fontSize: 11, color: '#16A34A', marginLeft: 8 }}>— ₹{couponDiscount} saved!</span></div><button onClick={handleRemoveCoupon} style={{ border: 'none', background: 'transparent', color: '#16A34A', cursor: 'pointer' }}><FiX size={14} /></button></div>) : (
              <div style={{ display: 'flex', gap: 8 }}><input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" style={{ flex: 1, padding: '9px 11px', border: '1.5px solid #E2E8F0', borderRadius: 6, fontSize: 12, outline: 'none' }} /><button onClick={handleCoupon} style={{ padding: '9px 14px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Apply</button></div>
            )}
          </div>
          {/* Order summary details section. */}
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', padding: '18px 18px' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AAA', margin: '0 0 14px', paddingBottom: 10, borderBottom: '1px solid #F1F3F6' }}>Price Details</p>
            {[{ label: `Price (${items.length} items)`, value: `₹${originalTotal.toFixed(2)}` }, { label: 'Discount', value: `-₹${savedAmount.toFixed(2)}`, color: '#16A34A' }, ...(couponApplied ? [{ label: 'Coupon Discount', value: `-₹${couponDiscount}`, color: '#16A34A' }] : []), { label: 'Delivery', value: deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`, color: deliveryCharge === 0 ? '#16A34A' : '#333' }].map((row, i) => (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}><span style={{ fontSize: 13, color: '#666' }}>{row.label}</span><span style={{ fontSize: 13, fontWeight: 600, color: row.color || '#333' }}>{row.value}</span></div>))}
            <div style={{ borderTop: '1px dashed #E8E8E8', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 15, color: '#111' }}>Total Amount</span><span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: '#111' }}>₹{finalTotal.toFixed(2)}</span></div>
            {(savedAmount + couponDiscount) > 0 && (<p style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', textAlign: 'right', margin: '0 0 14px' }}>You save ₹{(savedAmount + couponDiscount).toFixed(2)}! 🎉</p>)}
            {/* Checkout navigation button. */}
            <button onClick={() => navigate('/checkout')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(124,58,237,0.4)' }}>Proceed to Checkout <FiArrowRight size={16} /></button>
          </div>
          {/* Safety and trust indicators. */}
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>{trustItems.map((t, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ color: '#7C3AED', fontSize: 15 }}>{t.icon}</span><span style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>{t.text}</span></div>))}</div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;