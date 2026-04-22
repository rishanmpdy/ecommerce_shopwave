import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiLogOut, FiSearch } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, logout as shopLogout } from '../../features/auth/authSlice';
import { logout as adminLogout } from '../../admin/store/adminSlice';
import { selectCartCount } from '../../features/cart/cartSlice';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector(selectAuth);
  const cartItemCount = useSelector(selectCartCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const currentSearch = searchParams.get('q') || '';

  // FIX 1: Use controlled state so input always reflects URL changes
  const [searchQuery, setSearchQuery] = useState(currentSearch);

  // FIX 2: Sync state when URL param changes (e.g. back/forward navigation)
  useEffect(() => {
    setSearchQuery(currentSearch);
  }, [currentSearch]);

  const handleLogout = () => {
    dispatch(shopLogout());
    dispatch(adminLogout());
    toast.info('Logged out successfully');
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/shop?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl text-indigo-600 shrink-0"
        >
          <FiShoppingBag className="h-6 w-6" />
          <span className="hidden sm:inline">ShopWave</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 shrink-0">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <Link to="/shop" className="hover:text-indigo-600 transition-colors">Products</Link>
        </div>

        {/* Search Box -  Absolute Visibility */}
        <div className="grow w-full ml-auto mr-auto px-2 md:px-6" style={{ minWidth: '150px', maxWidth: '700px', display: 'block' }}>
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full"
            style={{ width: '100%', display: 'block' }}
          >
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 md:w-5 md:h-5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (window.location.pathname === '/shop' || window.location.pathname === '/') {
                  if (val.trim()) {
                    navigate(`/shop?q=${encodeURIComponent(val.trim())}`, { replace: true });
                  } else {
                    navigate('/shop', { replace: true });
                  }
                }
              }}
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-500 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
              style={{ width: '100%', display: 'block' }}
            />
          </form>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Cart */}
          <Link to="/cart" className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
            <FiShoppingBag className="w-5 h-5 text-slate-700" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-indigo-600 rounded-full leading-none">
                {cartItemCount}
              </span>
            )}
          </Link>


          {/* Auth */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-2 text-sm font-medium px-2 py-1 hover:bg-slate-50 rounded-md transition-colors cursor-pointer">
                <div className="bg-slate-200 h-8 w-8 rounded-full flex items-center justify-center text-indigo-600">
                  <FiUser className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline truncate `max-w-[120px]`">{user.name}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden sm:inline-block text-sm font-medium px-4 py-2 hover:bg-slate-100 rounded-md transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors whitespace-nowrap"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;