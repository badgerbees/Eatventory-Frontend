import React, { useState, useEffect } from 'react';
import { ChevronRight, Package, DollarSign, BarChart3, Zap, Check, Menu, X } from 'lucide-react';

export default function EatventoryLanding() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Package,
      title: 'Kelola Barang',
      description: 'Tambah, edit, dan kategorikan menu dengan mudah. Tanpa ribet.',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      icon: DollarSign,
      title: 'Rekam Penjualan',
      description: 'Catat penjualan cepat, bahkan saat offline. Cocok untuk jam sibuk.',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Laporan Pintar',
      description: 'Lihat pendapatan dan stok langsung. Tanpa perlu Excel.',
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Commit Sekali Klik',
      description: 'Buat ringkasan harian dalam sekejap. Tutup hari dengan tenang.',
      gradient: 'from-red-400 to-orange-500'
    }
  ];

  const steps = [
    { number: 1, title: 'Tambah Menu', description: 'Setup item dan harga dalam hitungan menit' },
    { number: 2, title: 'Rekam Jual Harian', description: 'Tap untuk jual, kami hitung otomatis' },
    { number: 3, title: 'Commit Laporan', description: 'Satu klik untuk tutup hari' }
  ];

  const benefits = [
    'Dibangun untuk kecepatan dan kesederhanaan',
    'Tetap jalan meski internet lemot',
    'Agregat harian otomatis',
    'Aman dan andal (backend Firestore)'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
  {/* main Nav is provided by global `Nav` component; keep top padding for hero */}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-purple-500 to-pink-500 opacity-10"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium">
                Dibangun untuk Usaha F&B Kecil
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-teal-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Cepat. Ramah.
              </span>
              <br />
              <span className="text-gray-800">Inventori tanpa ribet.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Aplikasi pencatat inventori dan penjualan ringan untuk kafe, warung makan, dan kantin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <a 
                href="/dashboard" 
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
              >
                Coba Eatventory
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </a>
              <button className="px-8 py-4 rounded-xl bg-white text-purple-600 font-semibold border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:scale-105 transition-all">
                Lihat Demo
              </button>
            </div>

            {/* Hero Mockup */}
            <div className="pt-12 relative">
              <div className="relative max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 blur-3xl opacity-20 rounded-3xl"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border-8 border-gray-100">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="h-3 bg-gradient-to-r from-red-400 to-orange-400 rounded-full"></div>
                    <div className="h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                    <div className="h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl"></div>
                      <div className="flex-1 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl"></div>
                    </div>
                    <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl"></div>
                    <div className="grid grid-cols-4 gap-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 bg-gradient-to-br from-pink-100 to-orange-100 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Semua yang kamu butuhkan, tanpa yang berlebihan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dibuat untuk penjual makanan sungguhan, bukan ahli teknologi. Mulai dalam hitungan menit, bukan hari.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Tiga langkah penjualan tanpa stress
            </h2>
            <p className="text-xl text-gray-600">
              Tanpa setup ribet. Tanpa manual panduan. Cuma manajemen inventori yang simpel dan pintar.
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-teal-300 via-purple-300 to-pink-300 hidden lg:block -translate-y-1/2"></div>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">
                      {step.number}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">{step.title}</h3>
                    <p className="text-gray-600 text-center">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ChevronRight className="text-purple-400" size={32} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Preview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Lihat langsung aksinya
            </h2>
            <p className="text-xl text-gray-600">
              Interface bersih. Alur kerja cepat. Penjual senang.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {['Dashboard', 'Penjualan', 'Analitik'].map((screen, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                <div className={`aspect-[4/3] bg-gradient-to-br ${
                  index === 0 ? 'from-teal-100 to-purple-100' :
                  index === 1 ? 'from-purple-100 to-pink-100' :
                  'from-pink-100 to-orange-100'
                } flex items-center justify-center p-8`}>
                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {index === 0 ? '📊' : index === 1 ? '💰' : '📈'}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700">{screen}</h3>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <p className="text-white font-semibold">/{screen === 'Penjualan' ? 'sales' : screen.toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Eatventory */}
      <section id="why" className="py-20 px-6 bg-gradient-to-br from-purple-100/50 to-pink-100/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Kenapa pilih Eatventory?
            </h2>
            <p className="text-xl text-gray-600">
              Dibangun oleh orang yang paham usaha makanan kecil, untuk orang yang menjalankannya.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <Check className="text-white" size={20} />
                  </div>
                  <p className="text-lg text-gray-700 font-medium pt-1">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-12 border-t border-gray-200 text-center">
              <p className="text-2xl font-bold text-gray-800 mb-6">
                Siap sederhanakan inventori kamu?
              </p>
              <a 
                href="/dashboard" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:shadow-2xl hover:scale-105 transition-all"
              >
                Mulai Gratis
                <ChevronRight size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t-4 border-gradient-to-r from-teal-400 via-purple-400 to-pink-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-3 flex items-center justify-center" style={{ width: 48, height: 48 }}>
                <span className="text-xl">🍽️</span>
              </div>
              <span className="text-gray-800 text-lg font-extrabold">Eatventory</span>
            </div>

            <p className="text-gray-600 text-center">
              © 2025 Eatventory — Dibuat dengan ❤️ untuk usaha F&B kecil.
            </p>

            <div className="flex gap-6">
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Syarat</a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Privasi</a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">GitHub</a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Kontak</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}