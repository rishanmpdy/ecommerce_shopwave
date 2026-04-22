import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotal, removeFromCart, updateQuantity, clearCart} from '../features/cart/cartSlice';
import { selectAuth } from '../features/auth/authSlice';
import api from '../api/axios';
import { FiTrash2, FiShoppingBag, FiChevronRight, FiTag, FiShield, FiTruck, FiRefreshCw, FiArrowRight, FiMinus, FiPlus, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

//  Cart Page 


const Cart = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const items     = useSelector(selectCartItems);   // cart items array
  const cartTotal = useSelector(selectCartTotal);   // total amount
  const { user }  = useSelector(selectAuth);

  //  Local UI state ─
  const [couponCode, setCouponCode]       = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  //  Remove single item from cart 
  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
    toast.info('item removed', { icon: '🗑️' });
  };

  //  Quantity +/- handler ─
  const handleQty = (id, qty) => {
    if (qty < 1) return;                   
    dispatch(updateQuantity({ productId: id, quantity: qty }));
  };

  const handleCoupon = async () => {
    const codeEntered = couponCode.trim().toUpperCase();
    if (!codeEntered) return;
    if (!user) {
      toast.error('Please login to apply coupons');
      return;
    }

    try {
      // Manglish: Code mathram vechu query cheyyunnu, userId restriction frontend-il handle cheyyaam.
      const { data } = await api.get(`/coupons?code=${codeEntered}`);
      
      if (data.length === 0) {
        toast.error('Invalid coupon code');
        return;
      }
      
      const coupon = data[0];
      
      // Manglish: Coupon specific user-nu mathram ullathanenkil check cheyyunnu.
      // userId empty aayalo "1" (admin/default) aayalo ellavarkkum use cheyyaam.
      const isGlobal = !coupon.userId || coupon.userId === "1" || coupon.userId === 1;
      const belongsToUser = String(coupon.userId) === String(user.id);

      if (!isGlobal && !belongsToUser) {
        toast.error('This coupon is not valid for your account');
        return;
      }
      
      if (new Date(coupon.expiry) < new Date()) {
         toast.error('Coupon has expired');
         return;
      }
      
      if (coupon.minOrder && cartTotal < coupon.minOrder) {
         toast.error(`Minimum order amount is ₹${coupon.minOrder}`);
         return;
      }
      
      let discount = 0;
      if (coupon.type === 'percent') {
         discount = Math.round(cartTotal * (coupon.discount / 100));
      } else {
         discount = Number(coupon.discount);
      }
      
      if (discount > cartTotal) discount = cartTotal;

      setCouponDiscount(discount);
      setCouponApplied(coupon);
      toast.success('Coupon applied successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error applying coupon');
    }
  };

  //  Remove coupon ─
  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  //  Proceed to checkout ─
  const handleCheckout = () => {
    navigate('/checkout');
  };

  //  Price calculations ─
  const originalTotal = items.reduce((sum, item) => {
    const mrp = item.product.originalPrice || item.product.price * 1.2; // fallback MRP
    return sum + mrp * item.quantity;
  }, 0);
  const savedAmount   = originalTotal - cartTotal;
  const deliveryCharge = cartTotal >= 3000 ? 0 : 99;    // ₹3000 abovefree delivery
  const finalTotal    = cartTotal - couponDiscount + deliveryCharge;

  //  Trust badges ─
  const trustItems = [
    { icon: <FiTruck />,      text: 'Free Delivery on ₹3000+' },
    { icon: <FiRefreshCw />,  text: '10-Day Easy Returns' },
    { icon: <FiShield />,     text: '100% Secure Payments' },
  ];

  /*  Empty Cart State  */
  if (items.length === 0) {
    return (
      <div style={{ background: '#F1F3F6', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '40px 20px' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '56px 40px', textAlign: 'center', maxWidth: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {/* Empty bag illustration */}
          <div style={{ width: 90, height: 90, background: '#F5F3FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>
            🛒
          </div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 20, color: '#111', margin: '0 0 8px' }}>Your cart is empty</h2>
          <p style={{ fontSize: 13, color: '#AAA', margin: '0 0 28px', lineHeight: 1.6 }}>
            Empty Cart! <br /> Start Shopping?
          </p>
          <Link to="/shop"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#7C3AED', color: '#fff', padding: '12px 32px', borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: 'Poppins, sans-serif', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#6D28D9'}
            onMouseLeave={e => e.currentTarget.style.background = '#7C3AED'}
          >
            <FiShoppingBag size={15} /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F1F3F6', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/*  Breadcrumb ─ */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8E8E8', padding: '13px clamp(12px,4vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}>
          <Link to="/" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <FiChevronRight size={11} />
          <span style={{ color: '#444' }}>Shopping Bag</span>
          <span style={{ marginLeft: 4, background: '#7C3AED', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>{items.length}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px clamp(12px,4vw,28px)', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18, alignItems: 'start' }}>

        {/*═══LEFT — Cart Items List==========*/}
        <div>

          {/* Cart header + clear all */}
          <div style={{ background: '#fff', borderRadius: 8, padding: '14px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#111' }}>Shopping Bag</span>
              <span style={{ fontSize: 13, color: '#AAA', marginLeft: 10 }}>({items.length} {items.length === 1 ? 'item' : 'items'})</span>
            </div>
            {/* Clear all button */}
            <button
              onClick={() => { dispatch(clearCart()); toast.info('cart cleared'); }}
              style={{ border: 'none', background: 'transparent', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 5 }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <FiTrash2 size={12} /> Clear All
            </button>
          </div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item) => {
              const product = item.product;
              const mrp     = product.originalPrice || product.price * 1.2;
              const saved   = Math.round(((mrp - product.price) / mrp) * 100);

              return (
                <div key={item.product.id}
                  style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', gap: 16, position: 'relative', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'}
                >
                  {/* Product image with discount badge */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Link to={`/product/${product.id}`}>
                      <div style={{ width: 110, height: 130, borderRadius: 8, overflow: 'hidden', border: '1px solid #E8E8E8', background: '#F8F8F8' }}>
                        <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        />
                      </div>
                    </Link>
                    {/* Discount % badge */}
                    {saved > 0 && (
                      <span style={{ position: 'absolute', top: 8, left: 8, background: '#16A34A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>
                        {saved}% OFF
                      </span>
                    )}
                  </div>

                  {/* Product details */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {/* Brand */}
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{product.brand}</p>
                    {/* Name */}
                    <Link to={`/product/${product.id}`}
                      style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: '#111', textDecoration: 'none', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color = '#7C3AED'}
                      onMouseLeave={e => e.target.style.color = '#111'}
                    >
                      {product.name}
                    </Link>

                    {/* Size / variant info — product.size undenkil show cheyyunnu */}
                    {product.size && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#777', fontWeight: 500 }}>Size:</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#333', border: '1px solid #DDD', borderRadius: 4, padding: '1px 7px' }}>{product.size}</span>
                      </div>
                    )}

                    {/* Price row */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: '#111' }}>₹{product.price.toFixed(2)}</span>
                      {mrp > product.price && (
                        <span style={{ fontSize: 13, color: '#BBB', textDecoration: 'line-through' }}>₹{mrp.toFixed(0)}</span>
                      )}
                      {saved > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>{saved}% off</span>
                      )}
                    </div>

                    {/* Quantity stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 8, width: 'fit-content' }}>
                      <button
                        onClick={() => handleQty(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{ width: 30, height: 30, border: '1px solid #DDD', borderRadius: '6px 0 0 6px', background: item.quantity <= 1 ? '#F8F8F8' : '#fff', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.quantity <= 1 ? '#CCC' : '#444', transition: 'all 0.15s' }}
                        onMouseEnter={e => { if (item.quantity > 1) e.currentTarget.style.background = '#F5F3FF'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = item.quantity <= 1 ? '#F8F8F8' : '#fff'; }}
                      >
                        <FiMinus size={11} />
                      </button>
                      {/* Qty display */}
                      <div style={{ width: 40, height: 30, border: '1px solid #DDD', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#333' }}>
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => handleQty(item.product.id, item.quantity + 1)}
                        style={{ width: 30, height: 30, border: '1px solid #DDD', borderRadius: '0 6px 6px 0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F5F3FF'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      >
                        <FiPlus size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Remove button — top right */}
                  <button
                    onClick={() => handleRemove(item.product.id)}
                    style={{ position: 'absolute', top: 14, right: 14, border: 'none', background: '#F1F3F6', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#F1F3F6'; e.currentTarget.style.color = '#999'; }}
                    title="Remove item"
                  >
                    <FiX size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Continue shopping link */}
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <Link to="/shop"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7C3AED', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              <FiShoppingBag size={13} /> Continue Shopping
            </Link>
          </div>
        </div>
        

        {/*
            Order Summary,Coupon ---------------------------------- */}




        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/*  Coupon Box  */}
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FiTag color="#7C3AED" size={15} />
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: '#111' }}>Apply Coupon</span>
            </div>
            {couponApplied ? (
              // Coupon already applied — show chip
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F0FDF4', border: '1.5px dashed #16A34A', borderRadius: 6, padding: '9px 12px' }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#16A34A', letterSpacing: '0.05em' }}>{couponApplied.code}</span>
                  <span style={{ fontSize: 11, color: '#16A34A', marginLeft: 8 }}>— ₹{couponDiscount} saved!</span>
                </div>
                <button onClick={handleRemoveCoupon}
                  style={{ border: 'none', background: 'transparent', color: '#16A34A', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              // Coupon input field
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  style={{ flex: 1, padding: '9px 11px', border: '1.5px solid #E2E8F0', borderRadius: 6, fontSize: 12, outline: 'none', fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em', color: '#333', background: '#FAFAFA' }}
                  onFocus={e => e.target.style.borderColor = '#7C3AED'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  onKeyDown={e => e.key === 'Enter' && handleCoupon()}
                />
                <button onClick={handleCoupon}
                  style={{ padding: '9px 14px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', whiteSpace: 'nowrap', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#6D28D9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#7C3AED'}
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/*  Price Summary  */}
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', padding: '18px 18px', overflow: 'hidden' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AAA', margin: '0 0 14px', paddingBottom: 10, borderBottom: '1px solid #F1F3F6' }}>
              Price Details
            </p>

            {/* Summary rows */}
            {[
              { label: `Price (${items.length} items)`, value: `₹${originalTotal.toFixed(2)}`, bold: false },
              { label: 'Discount', value: `-₹${savedAmount.toFixed(2)}`, color: '#16A34A', bold: false },
              ...(couponApplied ? [{ label: 'Coupon Discount', value: `-₹${couponDiscount}`, color: '#16A34A', bold: false }] : []),
              { label: 'Delivery Charges', value: deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`, color: deliveryCharge === 0 ? '#16A34A' : '#333', bold: false },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#666' }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: row.bold ? 800 : 600, color: row.color || '#333' }}>{row.value}</span>
              </div>
            ))}


            {/* Divider */}
            <div style={{ borderTop: '1px dashed #E8E8E8', margin: '12px 0' }} />

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 15, color: '#111' }}>Total Amount</span>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: '#111' }}>₹{finalTotal.toFixed(2)}</span>
            </div>

            {/* Savings highlight */}
            {(savedAmount + couponDiscount) > 0 && (
              <p style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', textAlign: 'right', margin: '0 0 14px' }}>
                You save ₹{(savedAmount + couponDiscount).toFixed(2)} on this order! 🎉
              </p>
            )}

            {/* Checkout CTA button — big and bold */}
            <button
              onClick={handleCheckout}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(124,58,237,0.4)', transition: 'all 0.2s', letterSpacing: '0.02em' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(124,58,237,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.4)'; }}
            >
              Proceed to Checkout <FiArrowRight size={16} />
            </button>
          </div>

          {/*  Trust badges ─ */}
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {trustItems.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#7C3AED', fontSize: 15, flexShrink: 0 }}>{t.icon}</span>
                <span style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>{t.text}</span>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Cart;