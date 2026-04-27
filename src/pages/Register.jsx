import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess, loginFailure } from '../features/auth/authSlice';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';

//A16 (Register Page: New user creation, email availability check, 
// and automatic login flow handle cheyyunnu)
const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if user already exists
      const existingUser = await api.get(`/users?email=${email}`);
      if (existingUser.data.length > 0) {
        toast.error("Email already in use");
        setIsLoading(false);
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role: "user", // default role
        createdAt: new Date().toISOString().split('T')[0]
      };

      // [API] Create new user in json-server
      await api.post(`/users`, newUser);
      
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Auto login after successful registration
      dispatch(loginSuccess(userWithoutPassword));
      toast.success("Account created successfully!");
      navigate('/');
    } catch (error) {
      console.error('Registration error', error);
      toast.error("Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-150px)]">
      <div className="w-full max-w-md glass p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Create Account</h2>
        <p className="text-center text-slate-500 mb-8">Join us and start shopping today</p>
        
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-slate-400" />
              </div>
              <input 
                type="text" 
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

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
                placeholder="you@mail.com"
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
               "Sign Up"
            )}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
