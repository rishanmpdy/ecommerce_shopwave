import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess, loginFailure } from '../features/auth/authSlice';
import { adminLogin } from '../admin/store/adminThunks';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FiMail, FiLock } from 'react-icons/fi';

//A15 (Login Page: User and Admin credentials verify cheyyukayum, appropriate Redux flow (user auth vs admin thunk) trigger cheyyukayum cheyyunnu)
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      const response = await api.get(`/users?email=${email}&password=${password}`);
      const user = response.data[0];

      if (user) {
        const { password: _, ...userWithoutPassword } = user;

        if (user.role === 'admin') {
          const result = await dispatch(adminLogin({ email, password }));
          if (result.success) {
            // admin login aayal main auth slice-ilum isAuthenticated true aakki vaikkanam.
            dispatch(loginSuccess(userWithoutPassword));
            toast.success(`Welcome back, Admin ${user.name}!`);
            navigate('/admin/dashboard');
          } else {
            toast.error(result.message || 'Admin login failed');
          }
          setIsLoading(false);
          return;
        }

        dispatch(loginSuccess(userWithoutPassword));
        toast.success(`Welcome back, ${user.name}!`);


        navigate('/');
      } else {
        dispatch(loginFailure('Invalid email or password'));
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error', error);
      dispatch(loginFailure(error.message));
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-150px)]">
      <div className="w-full max-w-md glass p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Welcome Back</h2>
        <p className="text-center text-slate-500 mb-8">Sign in to your account to continue</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-slate-400" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-slate-400" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account? <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
