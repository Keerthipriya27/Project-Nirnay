import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../../auth/useAuthStore';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Zap,
  Radio,
} from 'lucide-react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID =
  (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GOOGLE_CLIENT_ID ??
  'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

function scorePassword(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: 'Very Weak',   color: '#ff3b30' };
  if (score === 2) return { score, label: 'Weak',        color: '#ff9500' };
  if (score === 3) return { score, label: 'Fair',        color: '#f59e0b' };
  if (score === 4) return { score, label: 'Strong',      color: '#00d9ff' };
  return               { score, label: 'Very Strong',  color: '#00ff99' };
}

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  opacity: Math.random() * 0.4 + 0.1,
  dur: Math.random() * 8 + 6,
}));

export const AuthPage: React.FC = () => {
  const { login, signup, loginWithGoogle, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState('');

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const gsiLoaded = useRef(false);

  const pwStrength = mode === 'signup' && password.length > 0 ? scorePassword(password) : null;

  const initGoogle = useCallback(() => {
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        await loginWithGoogle(response.credential);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    if (googleButtonRef.current) {
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'filled_black',
        size: 'large',
        text: mode === 'signup' ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
        width: 340,
      });
    }
    gsiLoaded.current = true;
  }, [loginWithGoogle, mode]);

  useEffect(() => {
    const existing = document.getElementById('gsi-script');
    if (existing) { initGoogle(); return; }
    const script = document.createElement('script');
    script.id = 'gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, [initGoogle]);

  useEffect(() => {
    if (gsiLoaded.current) initGoogle();
  }, [mode, initGoogle]);

  function switchMode(next: 'login' | 'signup') {
    setMode(next);
    setLocalError('');
    clearError();
    setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (mode === 'signup') {
      if (!name.trim()) { setLocalError('Full name is required.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setLocalError('Enter a valid email address.'); return; }
      if (password.length < 8) { setLocalError('Password must be at least 8 characters.'); return; }
      if (password !== confirmPassword) { setLocalError('Passwords do not match.'); return; }
      await signup(name, email, password);
    } else {
      if (!email.trim() || !password) { setLocalError('Email and password are required.'); return; }
      await login(email, password);
    }
  }

  const displayError = localError || error;

  return (
    <div className="min-h-screen w-full bg-[#050506] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated grid */}
      <div className="absolute inset-0 opacity-[0.035]" style={{
        backgroundImage: 'linear-gradient(rgba(0,217,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,217,255,1) 1px,transparent 1px)',
        backgroundSize: '56px 56px',
      }} />

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <div key={p.id} className="absolute rounded-full bg-[#00d9ff] pointer-events-none" style={{
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, opacity: p.opacity,
          animation: `floatParticle ${p.dur}s ease-in-out infinite alternate`,
          animationDelay: `${p.id * 0.3}s`,
        }} />
      ))}

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(0,60,100,0.25),transparent)]" />

      {/* Desktop left panel */}
      <div className="hidden lg:flex absolute left-0 top-0 bottom-0 w-80 flex-col justify-between p-10 border-r border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 bg-red-600 rounded-md rotate-45 flex items-center justify-center shadow-[0_0_18px_rgba(220,38,38,0.5)]">
              <div className="bg-white rounded-full -rotate-45" style={{ width: 18, height: 18 }} />
            </div>
            <span className="text-2xl font-black tracking-[0.2em] text-white font-mono">NIRNAY</span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono mb-3 leading-tight">Emergency Decision<br />Command System</h2>
          <p className="text-sm text-white/40 leading-relaxed">Real-time crisis intelligence, autonomous field assets, and AI-powered routing for disaster response commanders.</p>
        </div>
        <div className="flex flex-col gap-4">
          {[
            { icon: <Radio className="w-4 h-4" />, label: 'Live Operations', value: '1 Active' },
            { icon: <Zap className="w-4 h-4" />,  label: 'Response Assets', value: '4 Deployed' },
            { icon: <Shield className="w-4 h-4" />, label: 'System Status', value: 'OPERATIONAL' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="text-[#00d9ff] opacity-70">{s.icon}</div>
              <div>
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{s.label}</div>
                <div className="text-xs font-mono font-bold text-white">{s.value}</div>
              </div>
            </div>
          ))}
          <div className="mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ff99] animate-ping" />
            <span className="text-[10px] font-mono text-[#00ff99] uppercase tracking-widest">Crisis Active · FL-2024-0812-VZG</span>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md lg:ml-80">
        <div className="bg-[#0a0a0d]/95 border border-white/10 rounded-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.7)]" style={{ backdropFilter: 'blur(24px)' }}>

          {/* Accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-red-600 via-[#00d9ff] to-[#00ff99]" />

          <div className="p-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <div className="w-7 h-7 bg-red-600 rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.4)]">
                <div className="w-3.5 h-3.5 bg-white rounded-full -rotate-45" />
              </div>
              <span className="text-lg font-black tracking-[0.2em] text-white font-mono">NIRNAY</span>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-black text-white font-mono tracking-tight">
                {mode === 'login' ? 'Access Command System' : 'Create Operator Account'}
              </h1>
              <p className="text-xs text-white/40 mt-1 font-mono">
                {mode === 'login'
                  ? 'Authenticate to enter the Nirnay Emergency Command Centre'
                  : 'Register as a new crisis response operator'}
              </p>
            </div>

            {/* Mode tabs */}
            <div className="flex rounded-lg bg-white/5 border border-white/8 p-0.5 mb-6 gap-0.5">
              {(['login', 'signup'] as const).map((m) => (
                <button key={m} onClick={() => switchMode(m)} className={`flex-1 py-2 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  mode === m ? 'bg-[#00d9ff] text-[#061014] shadow-[0_0_14px_rgba(0,217,255,0.35)]' : 'text-white/40 hover:text-white'
                }`}>
                  {m === 'login' ? '🔐 Sign In' : '⚡ Register'}
                </button>
              ))}
            </div>

            {/* Google button */}
            <div className="mb-5">
              <div ref={googleButtonRef} className="w-full flex justify-center" style={{ minHeight: 44 }} />
              {!gsiLoaded.current && (
                <button type="button" onClick={() => window.google?.accounts?.id?.prompt()}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-white text-[#1a1a1a] font-bold text-sm hover:bg-gray-100 transition-colors border border-white/20 cursor-pointer">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">or with credentials</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {mode === 'signup' && (
                <InputField label="Full Name" type="text" value={name} onChange={setName}
                  placeholder="Cmdr. Your Name" icon={<User className="w-4 h-4" />} autoComplete="name" />
              )}

              <InputField label="Email Address" type="email" value={email} onChange={setEmail}
                placeholder="you@domain.com" icon={<Mail className="w-4 h-4" />}
                autoComplete={mode === 'signup' ? 'email' : 'username'} />

              <div className="flex flex-col gap-1.5">
                <InputField label="Password" type={showPw ? 'text' : 'password'} value={password} onChange={setPassword}
                  placeholder={mode === 'signup' ? 'Min. 8 chars, mixed case + symbols' : '••••••••••••'}
                  icon={<Lock className="w-4 h-4" />}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  trailingIcon={
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="text-white/30 hover:text-white transition-colors cursor-pointer" tabIndex={-1}>
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  } />
                {pwStrength && (
                  <div className="mt-0.5">
                    <div className="flex gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: i < pwStrength.score ? pwStrength.color : 'rgba(255,255,255,0.08)' }} />
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-mono text-white/40">Strength</span>
                      <span className="text-[10px] font-mono font-bold" style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              {mode === 'signup' && (
                <div className="flex flex-col gap-1.5">
                  <InputField label="Confirm Password" type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword} onChange={setConfirmPassword}
                    placeholder="Re-enter your password" icon={<Lock className="w-4 h-4" />}
                    autoComplete="new-password"
                    trailingIcon={
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="text-white/30 hover:text-white transition-colors cursor-pointer" tabIndex={-1}>
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    } />
                  {confirmPassword.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {password === confirmPassword
                        ? <><CheckCircle2 className="w-3 h-3 text-[#00ff99]" /><span className="text-[10px] font-mono text-[#00ff99]">Passwords match</span></>
                        : <><AlertCircle className="w-3 h-3 text-red-400" /><span className="text-[10px] font-mono text-red-400">Passwords do not match</span></>}
                    </div>
                  )}
                </div>
              )}

              {displayError && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-mono text-red-300 leading-relaxed">{displayError}</p>
                </div>
              )}

              <button type="submit" disabled={isLoading} className={`w-full py-3.5 rounded-xl font-mono font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] mt-1 ${
                isLoading ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : mode === 'login'
                  ? 'bg-[#00d9ff] text-[#061014] hover:bg-[#00c8ed] shadow-[0_0_28px_rgba(0,217,255,0.4)] cursor-pointer'
                  : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-[0_0_28px_rgba(220,38,38,0.4)] cursor-pointer'
              }`}>
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating…</>
                  : mode === 'login'
                    ? <><Shield className="w-4 h-4" /> Enter Command System <ArrowRight className="w-4 h-4" /></>
                    : <><Zap className="w-4 h-4" /> Create Operator Account <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {/* Switch mode */}
            <p className="text-center text-[11px] font-mono text-white/30 mt-5">
              {mode === 'login' ? "Don't have an account?" : 'Already registered?'}{' '}
              <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-[#00d9ff] hover:text-white font-bold cursor-pointer underline underline-offset-2">
                {mode === 'login' ? 'Register here' : 'Sign in'}
              </button>
            </p>

            {/* Security notice */}
            <div className="mt-5 flex items-start gap-2 p-3 rounded-lg bg-white/3 border border-white/5">
              <Lock className="w-3.5 h-3.5 text-white/25 shrink-0 mt-0.5" />
              <p className="text-[9px] font-mono text-white/25 leading-relaxed">
                Passwords hashed with PBKDF2 · SHA-256 · 100,000 iterations via native Web Crypto API.
                Session tokens are 128-bit cryptographically random values.
                No credentials are transmitted to any external server in this MVP.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes floatParticle { 0% { transform: translateY(0px) translateX(0px); } 100% { transform: translateY(-18px) translateX(8px); } }`}</style>
    </div>
  );
};

function InputField({ label, type, value, onChange, placeholder, icon, autoComplete, trailingIcon }: {
  label: string; type: string; value: string; onChange: (v: string) => void;
  placeholder: string; icon: React.ReactNode; autoComplete?: string; trailingIcon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">{label}</label>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-white/25 pointer-events-none">{icon}</div>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/20 font-mono outline-none focus:border-[#00d9ff]/60 focus:bg-white/8 transition-all"
          style={{ fontSize: 13 }} />
        {trailingIcon && <div className="absolute right-3">{trailingIcon}</div>}
      </div>
    </div>
  );
}
