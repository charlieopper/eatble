import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  registerWithEmailPassword, 
  loginWithEmailPassword,
  loginWithGoogle,
  loginWithFacebook
} from '../../services/authService';

export default function AuthTest() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const user = await registerWithEmailPassword(email, password, username);
      setSuccess('Registration successful! Please check your email for verification.');
      console.log('Registered user:', user);
    } catch (error) {
      setError(error.message);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const user = await loginWithEmailPassword(email, password);
      setSuccess('Login successful!');
      console.log('Logged in user:', user);
    } catch (error) {
      setError(error.message);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const user = await loginWithGoogle();
      setSuccess('Google login successful!');
      console.log('Google user:', user);
    } catch (error) {
      setError(error.message);
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const user = await loginWithFacebook();
      setSuccess('Facebook login successful!');
      console.log('Facebook user:', user);
    } catch (error) {
      setError(error.message);
      console.error('Facebook login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Auth Test Component</h2>
        
        {/* Current User Status */}
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Current User:</h3>
          <pre className="whitespace-pre-wrap text-sm">
            {user ? JSON.stringify(user, null, 2) : 'Not logged in'}
          </pre>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailRegister} className="mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username (for registration)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Register
            </button>
            <button
              type="button"
              onClick={handleEmailLogin}
              disabled={loading}
              className="w-1/2 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Login
            </button>
          </div>
        </form>

        {/* Social Login Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google"
              className="w-5 h-5"
            />
            Login with Google
          </button>
          <button
            onClick={handleFacebookLogin}
            disabled={loading}
            className="w-full bg-[#1877F2] text-white p-2 rounded hover:bg-[#166FE5] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg" 
              alt="Facebook"
              className="w-5 h-5"
            />
            Login with Facebook
          </button>
        </div>
      </div>
    </div>
  );
} 