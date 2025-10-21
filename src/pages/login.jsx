import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth, isConfigured } from '../firebase'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function EatventoryLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null)

  const handleLogin = (e) => {
    e.preventDefault();
    if (!isConfigured) {
      setErrorMessage('Firebase belum dikonfigurasi. Periksa VITE_FIREBASE_* env vars di .env')
      return
    }
    // basic client-side validation
    if (!email || !password) {
      setErrorMessage('Isi alamat email dan kata sandi')
      return
    }
    setErrorMessage(null)
    // use Firebase Auth
    signInWithEmailAndPassword(auth, email, password)
      .then(async (cred) => {
        // token is saved by AuthProvider via onAuthStateChanged, but ensure localStorage has it
        const token = await cred.user.getIdToken()
        try { localStorage.setItem('idToken', token) } catch (e) {}
        // navigate to dashboard
        navigate('/dashboard')
      })
      .catch(err => {
        console.error('Login failed', err)
        const code = err?.code || ''
        let msg = 'Gagal masuk: ' + (err.message || String(err))
        if (code.includes('wrong-password')) msg = 'Password salah. Periksa kembali.'
        else if (code.includes('user-not-found')) msg = 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.'
        else if (code.includes('invalid-email')) msg = 'Alamat email tidak valid.'
        else if (code.includes('too-many-requests')) msg = 'Terlalu banyak percobaan masuk. Coba lagi nanti.'
        else if (code.includes('invalid-credential')) msg = 'Kredensial tidak valid.'
        setErrorMessage(msg)
      })
  };

  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const from = params.get('from')

  const handleGoogleSignIn = async (e) => {
    e.preventDefault()
    if (!isConfigured) {
      setErrorMessage('Firebase belum dikonfigurasi. Periksa VITE_FIREBASE_* env vars di .env')
      return
    }
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      // result.user is the signed-in user
      const token = await result.user.getIdToken()
      try { localStorage.setItem('idToken', token) } catch (e) {}
      navigate('/dashboard')
    } catch (err) {
      console.error('Google sign-in failed', err)
      const code = err?.code || ''
      let msg = 'Gagal masuk dengan Google: ' + (err.message || String(err))
      if (code.includes('popup-blocked')) msg = 'Popup diblokir oleh browser. Izinkan popup atau coba lagi.'
      else if (code.includes('popup-closed-by-user')) msg = 'Popup ditutup sebelum proses selesai.'
      setErrorMessage(msg)
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

      {/* Login Card */}
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Redirect / configuration warnings */}
          {from === 'protected' && (
            <div className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800">
              Anda harus masuk untuk mengakses halaman ini. Silakan masuk atau daftar terlebih dahulu.
            </div>
          )}
          {!isConfigured && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800">
              Firebase belum dikonfigurasi. Fitur autentikasi dinonaktifkan. Periksa file .env dan set VITE_FIREBASE_*.
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800">
              {errorMessage}
            </div>
          )}
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
              Selamat datang kembali! 🍽️
            </h1>
            <p className="text-sm text-gray-500">
              Masuk untuk kelola penjualan dan inventori Anda.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
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
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errorMessage) setErrorMessage(null) }}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all bg-white/50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                  Kata Sandi
                </label>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="text-xs text-gray-500 hover:text-purple-600 transition-colors"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errorMessage) setErrorMessage(null) }}
                  placeholder="••••••••"
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

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 mt-6"
            >
              Masuk
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-xs text-gray-400 font-medium">ATAU</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold flex items-center justify-center gap-3 hover:border-gray-300 hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Masuk dengan Google
          </button>

          {/* Footer */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <button
                onClick={(e) => { e.preventDefault(); navigate('/register') }}
                className="text-purple-600 font-semibold hover:underline"
              >
                Daftar di sini
              </button>
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Dengan masuk, Anda menyetujui{' '}
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