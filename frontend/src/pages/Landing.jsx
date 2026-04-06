import { Link } from 'react-router-dom';
import { Heart, Lock, Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80')`,
        }}
      />

      {/* Dark overlay with blue tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/85 via-blue-900/80 to-slate-900/90" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-2xl px-6">

        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
            <Heart size={38} className="text-blue-300" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold mb-4 leading-tight">
          Secure Cloud
          <span className="block text-blue-300">EHR Sharing System</span>
        </h1>

        {/* Subtitle */}
        <p className="text-blue-100/80 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          Instant and secure access to patient medical records.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-2xl hover:bg-blue-50 transition-all shadow-xl text-base"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3.5 bg-blue-500/30 text-white font-semibold rounded-2xl hover:bg-blue-500/50 transition-all border border-blue-400/40 backdrop-blur-sm text-base"
          >
            Register
          </Link>
        </div>

        {/* Bottom trust indicators */}
        <div className="mt-12 flex items-center justify-center gap-6 text-blue-200/60 text-xs">
          <div className="flex items-center gap-1.5">
            <Lock size={11} />
            <span>End-to-end encrypted</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-blue-400/40" />
          <div className="flex items-center gap-1.5">
            <Shield size={11} />
            <span>Role-based access control</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-blue-400/40" />
          <div className="flex items-center gap-1.5">
            <Heart size={11} />
            <span>HIPAA-aligned workflow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
