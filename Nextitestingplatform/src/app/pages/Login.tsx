import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import {
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem,
} from '../components/motion/variants';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabaseEnabled = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    void (async () => {
      setError(null);
      setLoading(true);
      try {
        await login(email, password);
        navigate('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleDemoLogin = () => {
    if (supabaseEnabled) {
      setError('Demo login no está disponible cuando Supabase está configurado.');
      return;
    }
    void (async () => {
      setError(null);
      setLoading(true);
      try {
        await login();
        navigate('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* ── LEFT PANEL ── same gradient as Sidebar ── */}
      <motion.div
        className="relative hidden md:flex md:w-[46%] lg:w-[42%] flex-col justify-between overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={slideInLeft}
      >
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#202950] via-[#1a2242] to-[#131a35]" />

        {/* Mesh gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 20% 20%, rgba(88,184,136,0.12) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 80%, rgba(99,102,241,0.08) 0%, transparent 50%),
              radial-gradient(ellipse 50% 60% at 50% 50%, rgba(88,184,136,0.05) 0%, transparent 60%)
            `,
          }}
        />

        {/* Glass highlight on right edge */}
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

        {/* Ambient glow top */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#58B888]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Ambient glow bottom */}
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-[#6366f1]/8 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <motion.div
          className="relative z-10 flex flex-col h-full p-10 lg:p-12"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Logo */}
          <motion.div className="flex items-center gap-3" variants={staggerItem}>
            <img src="/logo-nexti.png" alt="NexTI" className="h-10 w-10 object-contain" />
            <div>
              <div className="text-white text-sm leading-tight" style={{ fontWeight: 700, letterSpacing: '0.06em' }}>
                NexTI
              </div>
              <div
                className="text-xs leading-tight uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500, fontSize: '0.6rem' }}
              >
                Modernización
              </div>
            </div>
          </motion.div>

          {/* Hero text */}
          <div className="flex-1 flex flex-col justify-center mt-4">
            <motion.h1
              className="text-white mb-3"
              style={{ fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 }}
              variants={staggerItem}
            >
              Pruebas de software{' '}
              <span style={{ color: '#58B888' }}>inteligentes</span>
              {' '}y modernas
            </motion.h1>
            <motion.p
              className="mb-10"
              style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.6, maxWidth: '360px' }}
              variants={staggerItem}
            >
              Gestiona escenarios BDD generados por IA, proyectos y roles desde un solo lugar con control granular de pruebas.
            </motion.p>

            {/* Feature badges */}
            <motion.div className="flex flex-wrap gap-2" variants={staggerItem}>
              {[
                { icon: Shield, label: 'Escenarios BDD' },
                { icon: Users, label: 'Roles de IA' },
                { icon: Zap, label: 'Tiempo real' },
              ].map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: '0.75rem',
                    backdropFilter: 'blur(8px)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Icon size={12} style={{ color: '#58B888' }} />
                  {label}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }} variants={staggerItem}>
            © 2025 NexTI Modernización · v2.0
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6"
        style={{ background: '#f0f2f5' }}
      >
        {/* Mobile logo (only visible on small screens) */}
        <motion.div
          className="flex md:hidden items-center gap-3 mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden" style={{ backgroundColor: '#202950' }}>
            <img src="/logo-nexti.png" alt="NexTI" className="h-6 w-6 object-contain" />
          </div>
          <div>
            <div className="text-[#202950] text-sm" style={{ fontWeight: 700, letterSpacing: '0.06em' }}>NexTI</div>
            <div className="text-xs uppercase tracking-wider" style={{ color: '#717182', fontWeight: 500, fontSize: '0.6rem' }}>Modernización</div>
          </div>
        </motion.div>

        <motion.div
          className="w-full"
          style={{ maxWidth: '420px' }}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Heading */}
          <motion.div className="mb-6" variants={slideInRight}>
            <h2
              className="text-[#202950] mb-1"
              style={{ fontSize: '1.375rem', fontWeight: 600 }}
            >
              Bienvenido
            </h2>
            <p style={{ color: '#717182', fontSize: '0.875rem' }}>
              Inicia sesión para acceder al panel de administración
            </p>
          </motion.div>

          {/* Form card */}
          <motion.div
            className="rounded-2xl p-6 mb-4"
            style={{
              background: '#ffffff',
              boxShadow: '0 4px 24px rgba(32,41,80,0.08), 0 1px 4px rgba(32,41,80,0.06)',
            }}
            variants={staggerItem}
          >
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1.5 text-[#202950]"
                  style={{ fontSize: '0.875rem', fontWeight: 500 }}
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: '#9ca3af' }}
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@nexti.com"
                    className="w-full rounded-xl pl-9 pr-4 py-2.5 outline-none transition-all"
                    style={{
                      background: '#f3f4f6',
                      border: '1.5px solid transparent',
                      color: '#0f1117',
                      fontSize: '0.875rem',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1.5px solid #202950';
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(32,41,80,0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1.5px solid transparent';
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-1.5 text-[#202950]"
                  style={{ fontSize: '0.875rem', fontWeight: 500 }}
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: '#9ca3af' }}
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full rounded-xl pl-9 pr-10 py-2.5 outline-none transition-all"
                    style={{
                      background: '#f3f4f6',
                      border: '1.5px solid transparent',
                      color: '#0f1117',
                      fontSize: '0.875rem',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1.5px solid #202950';
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(32,41,80,0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1.5px solid transparent';
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 outline-none"
                    style={{ color: '#9ca3af' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#717182')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember me + forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none" style={{ fontSize: '0.8125rem' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer accent-[#202950]"
                  />
                  <span style={{ color: '#717182', fontWeight: 400 }}>Recordarme</span>
                </label>
                <button
                  type="button"
                  className="outline-none transition-colors"
                  style={{ color: '#58B888', fontSize: '0.8125rem', fontWeight: 500 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#3da070')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#58B888')}
                >
                  Olvidé mi contraseña
                </button>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl"
                style={{
                  background: loading ? '#3a4a7a' : '#202950',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(32,41,80,0.3)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
                whileHover={!loading ? { scale: 1.01, boxShadow: '0 6px 20px rgba(32,41,80,0.4)' } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#2d3d6b';
                }}
                onMouseLeave={(e) => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#202950';
                }}
              >
                {loading ? (
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    Iniciar sesión
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>

              {error ? (
                <div className="text-xs text-rose-600 text-center" role="alert">
                  {error}
                </div>
              ) : null}
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
