import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, loginSuccess } from '../features/auth/authSlice';
import api from '../api/axios';
import { FiUser, FiMail, FiEdit2, FiSave, FiX, FiPackage, FiClock, FiMapPin, FiPhone, FiChevronRight, FiLogOut, FiHeart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

// A20 (Profile Workflow: Manages personal account settings, monitors real-time order history with status tracking, and dynamically aggregates shipping addresses from historical transaction data)
const Profile = () => {
  const { user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [orders, setOrders] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email, phone: user.phone || '' });
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const { data } = await api.get(`/orders?userId=${user.id}&_sort=date&_order=desc`);
      setOrders(data);
    } catch (error) { toast.error('Try again'); }
    finally { setIsLoadingOrders(false); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    setIsUpdating(true);
    try {
      const updatedUser = { ...user, ...formData };
      await api.put(`/users/${user.id}`, updatedUser);
      dispatch(loginSuccess(updatedUser));
      setIsEditing(false);
      toast.success('profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setIsUpdating(false); }
  };

  if (!user) return null;

  const statusStyle = (status) => {
    const map = {
      Processing: { bg: '#FEF3C7', color: '#B45309', dot: '#F59E0B' },
      Shipped: { bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6' },
      Delivered: { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
      Cancelled: { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
    };
    return map[status] || map.Processing;
  };

  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const sidebarMenu = [
    { icon: <FiPackage />, label: 'My Orders', key: 'orders', badge: orders.length },
    { icon: <FiHeart />, label: 'Wishlist', key: 'wishlist' },
    { icon: <FiMapPin />, label: 'Addresses', key: 'addresses' },
  ];

  return (
    <div style={{ background: '#F1F3F6', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E8E8E8', padding: '13px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}><Link to="/" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Home</Link><FiChevronRight size={11} /><span style={{ color: '#444' }}>My Account</span></div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '22px 28px', display: 'grid', gridTemplateColumns: '250px 1fr', gap: 18, alignItems: 'start' }}>
        <aside>
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 12 }}>
            <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', padding: '26px 20px 40px', textAlign: 'center' }}><div style={{ width: 68, height: 68, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#7C3AED', margin: '0 auto' }}>{initials}</div></div>
            <div style={{ padding: '14px 16px 18px', textAlign: 'center' }}><p style={{ fontWeight: 700, fontSize: 15, color: '#111', margin: '0 0 3px' }}>{user.name}</p><p style={{ fontSize: 11, color: '#999', margin: '0 0 14px' }}>{user.email}</p><button onClick={() => setIsEditing(!isEditing)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1.5px solid #7C3AED', background: isEditing ? '#7C3AED' : 'transparent', color: isEditing ? '#fff' : '#7C3AED', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>{isEditing ? 'Close Editor' : 'Edit Profile'}</button></div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <div style={{ padding: '11px 16px', borderBottom: '1px solid #F1F3F6' }}><p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#BBB', margin: 0 }}>Account</p></div>
            {sidebarMenu.map((item) => (<button key={item.key} onClick={() => setActiveTab(item.key)} style={{ width: '100%', padding: '12px 16px', border: 'none', background: activeTab === item.key ? '#F5F3FF' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderLeft: activeTab === item.key ? '3px solid #7C3AED' : '3px solid transparent' }}><span style={{ color: activeTab === item.key ? '#7C3AED' : '#888', fontSize: 14 }}>{item.icon}</span><span style={{ fontSize: 13, fontWeight: activeTab === item.key ? 700 : 500, color: activeTab === item.key ? '#7C3AED' : '#444', flex: 1, textAlign: 'left' }}>{item.label}</span>{item.badge > 0 && (<span style={{ background: '#7C3AED', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>{item.badge}</span>)}<FiChevronRight size={12} color={activeTab === item.key ? '#7C3AED' : '#CCC'} /></button>))}
            <button onClick={() => navigate('/')} style={{ width: '100%', padding: '12px 16px', border: 'none', borderTop: '1px solid #F1F3F6', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}><FiLogOut size={14} color="#EF4444" /><span style={{ fontSize: 13, fontWeight: 500, color: '#EF4444' }}>Logout</span></button>
          </div>
        </aside>
        <main>
          {isEditing && (
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 16, border: '1px solid #EDE9FE' }}>
              <div style={{ padding: '15px 22px', borderBottom: '1px solid #F1F3F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Edit Profile</h2><button onClick={() => setIsEditing(false)} style={{ border: 'none', background: '#F1F3F6', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer' }}><FiX size={14} /></button></div>
              <form onSubmit={handleUpdateProfile} style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#AAA', marginBottom: 6 }}>NAME</label><div style={{ position: 'relative' }}><FiUser style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#CCC' }} /><input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px 10px 10px 32px', border: '1.5px solid #E2E8F0', borderRadius: 6, fontSize: 13 }} /></div></div>
                <div><label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#AAA', marginBottom: 6 }}>EMAIL</label><div style={{ position: 'relative' }}><FiMail style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#CCC' }} /><input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '10px 10px 10px 32px', border: '1.5px solid #E2E8F0', borderRadius: 6, fontSize: 13 }} /></div></div>
                <button type="submit" disabled={isUpdating} style={{ gridColumn: 'span 2', padding: '11px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>{isUpdating ? 'Saving...' : 'Save Changes'}</button>
              </form>
            </div>
          )}
          {activeTab === 'orders' && (
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <div style={{ padding: '16px 22px', borderBottom: '1px solid #F1F3F6', display: 'flex', alignItems: 'center', gap: 10 }}><FiPackage color="#7C3AED" size={17} /><h2 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>My Orders</h2>{orders.length > 0 && (<span style={{ background: '#F5F3FF', color: '#7C3AED', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{orders.length}</span>)}</div>
              {isLoadingOrders ? (<div style={{ display: 'flex', justifyContent: 'center', padding: '52px 0' }}><div style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid #7C3AED', borderTop: '3px solid transparent', animation: 'spin .8s linear infinite' }} /></div>) : orders.length === 0 ? (<div style={{ textAlign: 'center', padding: '56px 20px' }}>📦<h3 style={{ fontWeight: 700, fontSize: 15, color: '#333' }}>No orders yet</h3><Link to="/shop" style={{ display: 'inline-block', background: '#7C3AED', color: '#fff', padding: '10px 26px', borderRadius: 6, fontWeight: 700, textDecoration: 'none', marginTop: 14 }}>Start Shopping</Link></div>) : (
                <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {orders.map(order => {
                    const st = statusStyle(order.status);
                    return (
                      <div key={order.id} style={{ border: '1px solid #E8E8E8', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ background: '#FAFAFA', padding: '11px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E8E8E8' }}>
                          <div style={{ display: 'flex', gap: 20 }}><div><p style={{ fontSize: 9, color: '#AAA' }}>PLACED</p><p style={{ fontSize: 12, fontWeight: 700 }}>{new Date(order.date).toLocaleDateString()}</p></div><div><p style={{ fontSize: 9, color: '#AAA' }}>TOTAL</p><p style={{ fontSize: 13, fontWeight: 800 }}>₹{order.total.toFixed(2)}</p></div></div>
                          <div style={{ background: st.bg, color: st.color, padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{order.status}</div>
                        </div>
                        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>{order.items.map((item, idx) => (<div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}><div style={{ width: 68, height: 68, border: '1px solid #E8E8E8', borderRadius: 8, overflow: 'hidden' }}><img src={item.product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div><div style={{ flex: 1 }}><Link to={`/product/${item.product.id}`} style={{ fontWeight: 600, fontSize: 13, color: '#111', textDecoration: 'none' }}>{item.product.name}</Link><p style={{ fontSize: 11, color: '#AAA' }}>{item.product.brand}</p><div style={{ display: 'flex', gap: 10, fontSize: 13 }}><span>Qty: {item.quantity}</span><span style={{ fontWeight: 800 }}>₹{item.product.price.toFixed(2)}</span></div></div><button onClick={() => navigate(`/product/${item.product.id}`)} style={{ padding: '6px 13px', border: '1.5px solid #7C3AED', borderRadius: 6, background: 'transparent', color: '#7C3AED', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Buy Again</button></div>))}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {activeTab === 'addresses' && (() => {
            const seenKeys = new Set();
            const uniqueAddresses = orders.filter(o => o.shippingAddress).map(o => ({ ...o.shippingAddress, _orderId: o.id, _date: o.date })).filter(addr => { const key = `${addr.address}|${addr.zip}`.toLowerCase(); if (seenKeys.has(key)) return false; seenKeys.add(key); return true; });
            return (
              <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid #F1F3F6', display: 'flex', alignItems: 'center', gap: 10 }}><FiMapPin color="#7C3AED" size={17} /><h2 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Saved Addresses</h2></div>
                <div style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                  {uniqueAddresses.map((addr, i) => (<div key={i} style={{ border: '1.5px solid #EDE9FE', borderRadius: 10, padding: '16px 18px', background: '#FAFAFA' }}><div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}><FiMapPin size={13} color="#7C3AED" /><span style={{ fontWeight: 700, fontSize: 13, color: '#7C3AED' }}>{addr.title || 'Address'}</span></div><p style={{ fontSize: 13, fontWeight: 700 }}>{addr.firstName} {addr.lastName}</p><p style={{ fontSize: 12, color: '#555' }}>{addr.address}, {addr.city} - {addr.zip}</p></div>))}
                  {uniqueAddresses.length === 0 && <div style={{ textAlign: 'center', padding: '40px' }}>No addresses found.</div>}
                </div>
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
};

export default Profile;