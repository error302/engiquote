import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import CyberneticGridShader from '../components/ui/CyberneticGridShader';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES'
  });
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cyber Grid Background */}
      <CyberneticGridShader />
      
      {/* Overlay gradient for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-light/60" />
      
      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
          <div className="bg-primary/90 p-8 text-center">
            <h1 className="text-2xl font-bold text-white">EngiQuote KE</h1>
            <p className="text-blue-200 mt-1">Engineering Quotation Management</p>
          </div>
          
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary bg-white/80"
                    placeholder="John Doe"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary bg-white/80"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-primary focus:border-primary bg-white/80"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary bg-white/80"
                  >
                    <option value="SALES">Sales</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading && <Loader2 className="animate-spin" size={20} />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-primary hover:underline text-sm font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50/80 px-8 py-4 text-center text-sm text-gray-500">
            {isLogin ? 'Demo: admin@engiquote.com / password123' : 'Enter your details to get started'}
          </div>
        </div>
      </div>
    </div>
  );
}