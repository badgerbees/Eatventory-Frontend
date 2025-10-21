import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth, isConfigured } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Store } from 'lucide-react';

export default function EatventoryRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
  if (formData.password !== formData.confirmPassword) return alert('Passwords do not match')
  if (!isConfigured) return alert('Firebase belum dikonfigurasi. Periksa VITE_FIREBASE_* env vars in .env')
  setLoading(true)
  createUserWithEmailAndPassword(auth, formData.email, formData.password)
      .then(async (cred) => {
        // optional: set displayName to ownerName
        try {
          await updateProfile(cred.user, { displayName: formData.ownerName })
        } catch (e) { console.warn('updateProfile failed', e) }
        try {
          const token = await cred.user.getIdToken()
          localStorage.setItem('idToken', token)
        } catch (e) { console.warn('getIdToken failed', e) }
        // navigate to dashboard
        navigate('/dashboard')
      })
      .catch(err => {
        console.error('Register failed', err)
        alert('Gagal mendaftar: ' + (err.message || String(err)))
      })
      .finally(() => setLoading(false))
  };

  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleGoogleSignUp = async (e) => {
    e.preventDefault()
    if (!isConfigured) return alert('Firebase belum dikonfigurasi. Periksa VITE_FIREBASE_* env vars')
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      // result.user is signed-in
      try {
        const token = await result.user.getIdToken()
        localStorage.setItem('idToken', token)
      } catch (e) { console.warn('getIdToken failed', e) }
      navigate('/dashboard')
    } catch (err) {
      console.error('Google sign-in failed', err)
      alert('Google sign-in failed: ' + (err.message || String(err)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-indigo-50 to-sky-50 flex items-center justify-center p-6">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Register Card */}
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">E</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Eatventory
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Mulai perjalanan Anda! 🚀
            </h1>
            <p className="text-sm text-gray-500">
              Buat akun dan kelola usaha makanan Anda dengan mudah.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Business Name Input */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-600 mb-2">
                Nama Usaha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Store className="text-gray-400" size={20} />
                </div>
                <input
                  id="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  placeholder="Warung Makan Barokah"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all bg-white/50"
                />
              </div>
            </div>

            {/* Owner Name Input */}
            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-600 mb-2">
                Nama Pemilik
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={20} />
                </div>
                <input
                  id="ownerName"
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                  placeholder="Budi Santoso"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all bg-white/50"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all bg-white/50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all bg-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-2">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Ketik ulang kata sandi"
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all bg-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              onClick={handleRegister}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 mt-6"
            >
              Daftar Sekarang
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-xs text-gray-400 font-medium">ATAU</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="w-full py-3 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold flex items-center justify-center gap-3 hover:border-gray-300 hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Daftar dengan Google
          </button>

          {/* Footer */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <button
                onClick={(e) => e.preventDefault()}
                className="text-purple-600 font-semibold hover:underline"
              >
                Masuk di sini
              </button>
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Dengan mendaftar, Anda menyetujui{' '}
              <button onClick={(e) => e.preventDefault()} className="hover:text-gray-600 underline">Syarat</button>
              {' '}dan{' '}
              <button onClick={(e) => e.preventDefault()} className="hover:text-gray-600 underline">Kebijakan Privasi</button> kami.
            </p>
          </div>
        </div>

        {/* Decorative gradient glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-20 -z-10"></div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}