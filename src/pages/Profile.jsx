import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, loginSuccess } from '../features/auth/authSlice';
import api from '../api/axios';
import { FiUser, FiMail, FiEdit2, FiSave, FiX, FiPackage, FiClock, FiMapPin, FiPhone, FiShield, FiChevronRight, FiLogOut, FiHeart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';



const Profile = () => {
  const { user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //  State declarations 
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // orders | wishlist | addresses
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [orders, setOrders] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  //  when user data loading data set
  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email, phone: user.phone || '' });
      fetchOrders();
    }
  }, [user]);

  //  Orders API call 
  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const { data } = await api.get(`/orders?userId=${user.id}&_sort=date&_order=desc`);
      setOrders(data);
    } catch (error) {
      console.error('Orders fetch failed', error);
      toast.error('try again');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  //  Profile save handler ─
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    setIsUpdating(true);
    try {
      const updatedUser = { ...user, ...formData };
      await api.put(`/users/${user.id}`, updatedUser);
      dispatch(loginSuccess(updatedUser)); // Redux + localStorage update
      setIsEditing(false);
      toast.success('profile updated 🎉');
    } catch {
      toast.error('Updation failed, try again');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  //  Order status → color map 
  const statusStyle = (status) => {
    const map = {
      Processing: { bg: '#FEF3C7', color: '#B45309', dot: '#F59E0B' },
      Shipped: { bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6' },
      Delivered: { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
      Cancelled: { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
    };
    return map[status] || map.Processing;
  };

  //  User name initials for avatar ─
  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  //  Left sidebar nav items 
  const sidebarMenu = [
    { icon: <FiPackage />, label: 'My Orders', key: 'orders', badge: orders.length },
    { icon: <FiHeart />, label: 'Wishlist', key: 'wishlist' },
    { icon: <FiMapPin />, label: 'Addresses', key: 'addresses' },
    // { icon: <FiShield />, label: 'Security', key: 'security' },
  ];

  return (
    <div style={{ background: '#F1F3F6', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/*  Breadcrumb strip ─ */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8E8E8', padding: '13px clamp(12px,4vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}>
          <Link to="/" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <FiChevronRight size={11} />
          <span style={{ color: '#444' }}>My Account</span>
        </div>
      </div>

      {/*  Main grid layout ─ */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '22px clamp(12px,4vw,28px)', display: 'grid', gridTemplateColumns: '250px 1fr', gap: 18, alignItems: 'start' }}>

        {/*LEFT SIDEBAR */}
        <aside>

          {/* User identity card */}
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 12 }}>

            {/* Purple gradient header */}
            <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', padding: '26px 20px 40px', textAlign: 'center' }}>
              {/* Avatar circle */}
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 24, color: '#7C3AED', margin: '0 auto', boxShadow: '0 4px 14px rgba(0,0,0,0.18)', border: '3px solid rgba(255,255,255,0.85)' }}>
                {initials}
              </div>
            </div>

            {/* Name + edit */}
            <div style={{ padding: '14px 16px 18px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: '#111', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
              <p style={{ fontSize: 11, color: '#999', margin: '0 0 14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1.5px solid #7C3AED', background: isEditing ? '#7C3AED' : 'transparent', color: isEditing ? '#fff' : '#7C3AED', fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!isEditing) { e.currentTarget.style.background = '#7C3AED'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={e => { if (!isEditing) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7C3AED'; } }}
              >
                <FiEdit2 size={12} /> {isEditing ? 'Close Editor' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Navigation menu card */}
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <div style={{ padding: '11px 16px', borderBottom: '1px solid #F1F3F6' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#BBB', margin: 0 }}>Account</p>
            </div>
            {sidebarMenu.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{ width: '100%', padding: '12px 16px', border: 'none', background: activeTab === item.key ? '#F5F3FF' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderLeft: activeTab === item.key ? '3px solid #7C3AED' : '3px solid transparent', transition: 'all 0.15s' }}
              >
                <span style={{ color: activeTab === item.key ? '#7C3AED' : '#888', fontSize: 14 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: activeTab === item.key ? 700 : 500, color: activeTab === item.key ? '#7C3AED' : '#444', flex: 1, textAlign: 'left' }}>{item.label}</span>
                {/* Badge — orders count */}
                {item.badge > 0 && (
                  <span style={{ background: '#7C3AED', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, lineHeight: '16px' }}>{item.badge}</span>
                )}
                <FiChevronRight size={12} color={activeTab === item.key ? '#7C3AED' : '#CCC'} />
              </button>
            ))}
            {/* Logout — red text, bottom */}
            <button
              onClick={() => navigate('/')}
              style={{ width: '100%', padding: '12px 16px', border: 'none', borderTop: '1px solid #F1F3F6', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderLeft: '3px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <FiLogOut size={14} color="#EF4444" />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#EF4444' }}>Logout</span>
            </button>
          </div>
        </aside>

        {/*
            RIGHT CONTENT AREA ═════════ */}
        <main>

          {/*  Edit Profile Form Panel (toggle with isEditing)  */}
          {isEditing && (
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 16, border: '1px solid #EDE9FE', overflow: 'hidden' }}>
              <div style={{ padding: '15px 22px', borderBottom: '1px solid #F1F3F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, margin: 0, color: '#111' }}>Edit Profile</h2>
                <button onClick={() => { setIsEditing(false); setFormData({ name: user.name, email: user.email, phone: user.phone || '' }); }}
                  style={{ border: 'none', background: '#F1F3F6', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777' }}>
                  <FiX size={14} />
                </button>
              </div>
              <form onSubmit={handleUpdateProfile} style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#AAA', marginBottom: 6 }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <FiUser size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#CCC' }} />
                    
                    <input type="text" required value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 10px 10px 32px', border: '1.5px solid #E2E8F0', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#FAFAFA', fontFamily: 'Inter, sans-serif', color: '#333' }}
                      onFocus={e => e.target.style.borderColor = '#7C3AED'}
                      onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                    />
                  </div>
                </div>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#AAA', marginBottom: 6 }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <FiMail size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#CCC' }} />
                    <input type="email" required value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 10px 10px 32px', border: '1.5px solid #E2E8F0', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#FAFAFA', fontFamily: 'Inter, sans-serif', color: '#333' }}
                      onFocus={e => e.target.style.borderColor = '#7C3AED'}
                      onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                    />
                  </div>
                </div>
                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#AAA', marginBottom: 6 }}>Phone</label>
                  <div style={{ position: 'relative' }}>
                    <FiPhone size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#CCC' }} />
                    <input type="tel" value={formData.phone} placeholder="Optional"
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 10px 10px 32px', border: '1.5px solid #E2E8F0', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#FAFAFA', fontFamily: 'Inter, sans-serif', color: '#333' }}
                      onFocus={e => e.target.style.borderColor = '#7C3AED'}
                      onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                    />
                  </div>
                </div>
                {/* Save button */}
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" disabled={isUpdating}
                    style={{ width: '100%', padding: '11px', background: isUpdating ? '#C4B5FD' : '#7C3AED', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'Poppins, sans-serif', transition: 'background 0.2s' }}>
                    <FiSave size={13} /> {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/*  ORDERS TAB  */}
          {activeTab === 'orders' && (
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              {/* Header */}
              <div style={{ padding: '16px 22px', borderBottom: '1px solid #F1F3F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FiPackage color="#7C3AED" size={17} />
                  <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, margin: 0, color: '#111' }}>My Orders</h2>
                  {orders.length > 0 && (
                    <span style={{ background: '#F5F3FF', color: '#7C3AED', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{orders.length}</span>
                  )}
                </div>
                {/* Filter select */}
                <select style={{ border: '1px solid #E2E8F0', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#555', outline: 'none', cursor: 'pointer', background: '#fff' }}>
                  <option>All Orders</option>
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                </select>
              </div>

              {/* Loading spinner */}
              {isLoadingOrders ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '52px 0' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid #F1F3F6', borderTop: '3px solid #7C3AED', animation: 'spin .8s linear infinite' }} />
                </div>
              ) : orders.length === 0 ? (
                // Empty orders state
                <div style={{ textAlign: 'center', padding: '56px 20px' }}>
                  <div style={{ fontSize: 52, marginBottom: 14 }}>📦</div>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: '#333', margin: '0 0 6px' }}>No orders yet</h3>
                  <p style={{ color: '#AAA', fontSize: 12, margin: '0 0 20px' }}>Ingane irikkumbol orders undavukayilla, shopping start cheyyamo?</p>
                  <Link to="/shop" style={{ display: 'inline-block', background: '#7C3AED', color: '#fff', padding: '10px 26px', borderRadius: 6, fontWeight: 700, fontSize: 13, textDecoration: 'none', fontFamily: 'Poppins, sans-serif' }}>
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {orders.map(order => {
                    const st = statusStyle(order.status);
                    return (
                      <div key={order.id}
                        style={{ border: '1px solid #E8E8E8', borderRadius: 8, overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                      >
                        {/* Order meta header */}
                        <div style={{ background: '#FAFAFA', padding: '11px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid #E8E8E8' }}>
                          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#AAA', marginBottom: 3 }}>Order Placed</div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#444' }}>{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#AAA', marginBottom: 3 }}>Total</div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>₹{order.total.toFixed(2)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#AAA', marginBottom: 3 }}>Order ID</div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED' }}>#{order.id}</div>
                            </div>
                          </div>
                          {/* Status pill */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: st.bg, color: st.color, padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block', flexShrink: 0 }} />
                            {order.status}
                          </div>
                        </div>

                        {/* Order items list */}
                        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              {/* Product image */}
                              <div style={{ width: 68, height: 68, borderRadius: 8, overflow: 'hidden', border: '1px solid #E8E8E8', flexShrink: 0, background: '#F8F8F8' }}>
                                <img src={item.product.images[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Product name link */}
                                <Link to={`/product/${item.product.id}`}
                                  style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: '#111', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.15s' }}
                                  onMouseEnter={e => e.target.style.color = '#7C3AED'}
                                  onMouseLeave={e => e.target.style.color = '#111'}
                                >
                                  {item.product.name}
                                </Link>
                                <p style={{ fontSize: 11, color: '#AAA', margin: '2px 0 6px', fontWeight: 500 }}>{item.product.brand}</p>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                  <span style={{ fontSize: 11, color: '#777', background: '#F1F3F6', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>Qty: {item.quantity}</span>
                                  <span style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>₹{item.product.price.toFixed(2)}</span>
                                </div>
                              </div>
                              {/* Buy Again CTA */}
                              <button
                                onClick={() => navigate(`/product/${item.product.id}`)}
                                style={{ padding: '6px 13px', border: '1.5px solid #7C3AED', borderRadius: 6, background: 'transparent', color: '#7C3AED', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#7C3AED'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7C3AED'; }}
                              >
                                Buy Again
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {/*  ADDRESSES TAB  */}
          {activeTab === 'addresses' && (() => {
            // Extract unique shipping addresses from past orders
            const seenKeys = new Set();
            const uniqueAddresses = orders
              .filter(o => o.shippingAddress)
              .map((o, idx) => ({ ...o.shippingAddress, _orderId: o.id, _orderDate: o.date, _idx: idx }))
              .filter(addr => {
                const key = `${addr.address}|${addr.city}|${addr.zip}`.toLowerCase();
                if (seenKeys.has(key)) return false;
                seenKeys.add(key);
                return true;
              });

            return (
              <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                {/* Header */}
                <div style={{ padding: '16px 22px', borderBottom: '1px solid #F1F3F6', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FiMapPin color="#7C3AED" size={17} />
                  <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, margin: 0, color: '#111' }}>Saved Addresses</h2>
                  {uniqueAddresses.length > 0 && (
                    <span style={{ background: '#F5F3FF', color: '#7C3AED', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                      {uniqueAddresses.length}
                    </span>
                  )}
                </div>

                {isLoadingOrders ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '52px 0' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid #F1F3F6', borderTop: '3px solid #7C3AED', animation: 'spin .8s linear infinite' }} />
                  </div>
                ) : uniqueAddresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '56px 20px' }}>
                    <div style={{ fontSize: 52, marginBottom: 14 }}>📍</div>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: '#333', margin: '0 0 6px' }}>No addresses yet</h3>
                    <p style={{ color: '#AAA', fontSize: 12, margin: 0 }}>Oru order cheyyumbol address ithil automatically save aakum.</p>
                  </div>
                ) : (
                  <div style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                    {uniqueAddresses.map((addr, i) => (
                      <div key={i}
                        style={{ border: '1.5px solid #EDE9FE', borderRadius: 10, padding: '16px 18px', background: '#FAFAFA', position: 'relative', transition: 'box-shadow 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.10)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                      >
                        {/* Badge — most recent = "Default" */}
                        {i === 0 && (
                          <span style={{ position: 'absolute', top: 12, right: 12, background: '#7C3AED', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Latest
                          </span>
                        )}
                        {/* Title / type */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiMapPin size={13} color="#7C3AED" />
                          </div>
                          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, color: '#7C3AED' }}>
                            {addr.title || 'Address'}
                          </span>
                        </div>
                        {/* Name */}
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>
                          {addr.firstName} {addr.lastName}
                        </p>
                        {/* Street */}
                        <p style={{ fontSize: 12, color: '#555', margin: '0 0 2px', lineHeight: 1.5 }}>
                          {addr.address}
                        </p>
                        {/* City, State, ZIP */}
                        <p style={{ fontSize: 12, color: '#555', margin: '0 0 10px', lineHeight: 1.5 }}>
                          {addr.city}, {addr.state} — {addr.zip}
                        </p>
                        {/* Order link */}
                        <div style={{ borderTop: '1px solid #EDE9FE', paddingTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <FiClock size={10} color="#AAA" />
                          <span style={{ fontSize: 10, color: '#AAA' }}>
                            Used on Order #{addr._orderId} &nbsp;·&nbsp;{' '}
                            {new Date(addr._orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/*  OTHER TABS — Placeholder content ─ */}
          {activeTab !== 'orders' && activeTab !== 'addresses' && (
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', padding: '56px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 50, marginBottom: 14 }}>
                {activeTab === 'wishlist' ? '❤️' : '🔒'}
              </div>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: '#333', margin: '0 0 8px' }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h3>
              <p style={{ color: '#BBB', fontSize: 12 }}>coming soon!</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Profile;