import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import ProductCard from '../Components/ui/ProductCard';
import { FiArrowRight, FiChevronRight } from 'react-icons/fi';
import './Home.css';
import { BANNER, CATEGORIES, PROMO_BANNERS, TRUST_ITEMS } from '../data/homeData';

// Trending products fetch cheyyunnu.
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

// Limited time deals fetch cheyyan.
const useDeals = () => {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data } = await api.get('/deals');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// A9 (Home Workflow: Landing page entry point, fetches and displays marketing banners, featured categories, trending products, and limited-time deals)
const Home = () => {
  const navigate = useNavigate();
  // Data hooks call cheyyunnu to load landing page content.
  const { data: products, isLoading: isProductsLoading } = useProducts();
  const { data: deals, isLoading: isDealsLoading } = useDeals();

  // Top 8 products mathram trending section-il kaanikkunnu.
  const trendingProducts = products ? products.slice(0, 8) : [];

  return (
    <>
      <div className="sh">
        {/* Top announcement strip. */}
        <div className="sh-strip">Get <span>FREE delivery</span> on orders above ₹1000 &nbsp;|&nbsp; <span>New Collection 2026</span> is Live!</div>

        {/* Main Hero Banner section. */}
        <section style={{ position: 'relative', width: '100%', height: 'clamp(340px,52vw,580px)', overflow: 'hidden', background: '#0F172A' }}>
          <img src={BANNER.img} alt={BANNER.headline} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 38%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.38) 55%, transparent 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(to top, #F1F3F6, transparent)' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 clamp(20px,7vw,96px)', maxWidth: 620 }}>
            <span style={{ background: BANNER.accent, color: '#fff', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 2, marginBottom: 14, display: 'inline-block', width: 'fit-content' }}>{BANNER.tag}</span>
            <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,5vw,3.6rem)', color: '#fff', margin: '0 0 12px', lineHeight: 1.12, whiteSpace: 'pre-line' }}>{BANNER.headline}</h1>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 'clamp(.85rem,1.3vw,1rem)', color: 'rgba(255,255,255,0.82)', margin: '0 0 26px', maxWidth: 400, lineHeight: 1.65 }}>{BANNER.sub}</p>
            <button className="sh-btn-buy" onClick={() => navigate('/shop')} style={{ width: 'auto', alignSelf: 'flex-start', padding: '12px 30px', borderRadius: 4, fontSize: 14 }}>{BANNER.cta} <FiArrowRight /></button>
          </div>
        </section>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(10px,2.5vw,28px)' }}>
          {/* Categories grid navigation. */}
          <div className="sh-card" style={{ marginTop: -48, position: 'relative', zIndex: 10, marginBottom: 14 }}>
            <div className="sh-card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 className="sh-sec-title" style={{ margin: 0 }}>Categories</h2>
                <Link to="/shop" className="sh-see-all">See all <FiChevronRight size={14} /></Link>
              </div>
              <div className="sh-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
                {CATEGORIES.map((cat) => (
                  <Link key={cat.name} to={`/shop?cat=Footwear&sub=${encodeURIComponent(cat.target)}`} className="sh-cat">
                    <img src={cat.img} alt={cat.name} />
                    <span className="sh-cat-name">{cat.name}</span>
                    <span className="sh-cat-link">{cat.tag}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Promo banners (Grid of 2). */}
          <div className="sh-promo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {PROMO_BANNERS.map((b) => (
              <div key={b.title} className="sh-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/shop')}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 170 }}>
                  <div style={{ background: b.bg, padding: '22px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: b.accent, marginBottom: 8 }}>{b.tag}</span>
                    <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#111', margin: '0 0 7px', lineHeight: 1.2 }}>{b.title}</h3>
                    <p style={{ fontSize: 12, color: '#555', margin: '0 0 16px', lineHeight: 1.5 }}>{b.sub}</p>
                    <div style={{ alignSelf: 'flex-start', background: '#111', color: '#fff', borderRadius: 3, padding: '8px 16px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>{b.cta} <FiArrowRight size={12} /></div>
                  </div>
                  <img src={b.img} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Horizontal scroll section for limited-time deals. */}
          <div className="sh-card" style={{ marginBottom: 14 }}>
            <div className="sh-card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 className="sh-sec-title" style={{ margin: 0 }}>Today's Deals &nbsp;<span style={{ background: '#E11D48', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 2 }}>Limited Time</span></h2>
                <button className="sh-see-all" onClick={() => navigate('/shop')}>See all deals <FiChevronRight size={14} /></button>
              </div>
              <div className="sh-hscroll">
                {isDealsLoading ? (<div style={{ display: 'flex', gap: 14 }}>{[1, 2, 3, 4].map((n) => (<div key={n} style={{ minWidth: 200, height: 260, background: '#f5f5f5', borderRadius: 8, animation: 'pulse 1.5s infinite ease-in-out' }} />))}</div>) : (
                  deals?.map((d) => (
                    <div key={d.name} className="sh-deal" onClick={() => navigate('/shop')}>
                      <div style={{ position: 'relative' }}><img src={d.img} alt={d.name} /><span className={`sh-badge ${d.cls}`} style={{ position: 'absolute', top: 8, left: 8, margin: 0 }}>{d.badge}</span></div>
                      <div className="sh-deal-body"><span className="sh-off">{d.off}</span><div><span className="sh-price">{d.price}</span><span className="sh-original">{d.orig}</span></div><p style={{ fontSize: 12, color: '#333', margin: '5px 0 0', fontWeight: 500, lineHeight: 1.3 }}>{d.name}</p></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Trending products grid (fetched dynamically). */}
          <div className="sh-card" style={{ marginBottom: 14 }}>
            <div className="sh-card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 className="sh-sec-title" style={{ margin: 0 }}>Trending Now</h2>
                <button className="sh-see-all" onClick={() => navigate('/shop')}>See all <FiChevronRight size={14} /></button>
              </div>
              {isProductsLoading ? (<div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}><div style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid #F1F3F6', borderTop: '3px solid #7C3AED', animation: 'spin .8s linear infinite' }} /></div>) : (
                <div className="sh-prod-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {trendingProducts.map((product) => (<div key={product.id} className="sh-prod-wrap"><ProductCard product={product} /></div>))}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}><button className="sh-btn-add" onClick={() => navigate('/shop')} style={{ padding: '11px 40px', borderRadius: 4, fontSize: 14 }}>view more <FiArrowRight /></button></div>
            </div>
          </div>

          {/* Secondary full-width marketing banner. */}
          <div className="sh-card" style={{ marginBottom: 14, cursor: 'pointer' }} onClick={() => navigate('/shop')}>
            <div style={{ position: 'relative', height: 190 }}>
              <img src="/src/assets/products/stephome5.jpg" alt="Offer Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.68) 0%, transparent 65%)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 36px' }}>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#F43F5E', margin: '0 0 7px', fontWeight: 700 }}>Exclusive Members Offer</p>
                <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.2rem,3vw,2rem)', color: '#fff', margin: '0 0 6px' }}>Extra 10% Off on Your First Order</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', margin: '0 0 16px' }}>Sign up today and unlock exclusive deals.</p>
                <button className="sh-btn-buy" style={{ width: 'auto', alignSelf: 'flex-start', borderRadius: 4, padding: '9px 26px', fontSize: 13 }}>Claim Offer <FiArrowRight /></button>
              </div>
            </div>
          </div>

          {/* Trust items / Service features area. */}
          <div className="sh-card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 0 }}>
              {TRUST_ITEMS.map((t, i, arr) => (
                <div key={t.title} style={{ padding: '16px 18px', borderRight: i < arr.length - 1 ? '0.5px solid #E8E8E8' : 'none', display: 'flex', gap: 11, alignItems: 'center' }}>
                  <span style={{ fontSize: 22 }}>{t.icon}</span>
                  <div><div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#111' }}>{t.title}</div><div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{t.sub}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
