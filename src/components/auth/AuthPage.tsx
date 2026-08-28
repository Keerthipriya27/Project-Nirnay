import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/useAuthStore';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, Mountain, User, Waves, Loader2 } from 'lucide-react';
import nirnayLogo from '../../assets/nirnay-logo.png';

function scorePassword(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Very weak', color: '#f87171' };
  if (score === 2) return { score, label: 'Weak', color: '#fb923c' };
  if (score === 3) return { score, label: 'Fair', color: '#fbbf24' };
  if (score === 4) return { score, label: 'Strong', color: '#38bdf8' };
  return { score, label: 'Very strong', color: '#4ade80' };
}

export const AuthPage: React.FC = () => {
  const { login, signup, isLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState('');
  const [disasterMode, setDisasterMode] = useState<'flood' | 'earthquake'>('earthquake');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDisasterMode((current) => current === 'flood' ? 'earthquake' : 'flood');
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  const passwordStrength = mode === 'signup' && password ? scorePassword(password) : null;

  function switchMode(nextMode: 'login' | 'signup') {
    setMode(nextMode);
    setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
    setLocalError(''); clearError();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLocalError(''); clearError();
    if (mode === 'signup') {
      if (!name.trim()) return setLocalError('Operator name is required.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setLocalError('Enter a valid operator ID.');
      if (password.length < 8) return setLocalError('Access key must be at least 8 characters.');
      if (password !== confirmPassword) return setLocalError('Access keys do not match.');
      await signup(name, email, password);
    } else {
      if (!email.trim() || !password) return setLocalError('Operator ID and access key are required.');
      await login(email, password);
    }
  }

  const image = disasterMode === 'flood'
    ? 'https://sc0.blr1.digitaloceanspaces.com/large/890727-bxivrwaivt-1534423494.jpg'
    : 'https://static.vecteezy.com/system/resources/thumbnails/057/364/663/small/cracked-asphalt-road-and-rubble-in-earthquake-aftermath-landscape-photo.jpg';

  return (
    <main className="relative min-h-screen w-full overflow-y-auto bg-[#11100f] bg-cover bg-center bg-fixed px-4 py-8 sm:px-8" style={{ backgroundImage: `linear-gradient(rgba(8,8,8,.45),rgba(8,8,8,.8)),url('${image}')` }}>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full max-w-[860px] overflow-hidden rounded-sm border border-white/25 bg-black/50 shadow-2xl backdrop-blur-[2px] lg:grid-cols-[.82fr_1.18fr]">
          <div className="p-6 text-center sm:p-10 lg:flex lg:flex-col lg:justify-center lg:text-left">
            <img src={nirnayLogo} alt="Nirnay - Decide, Act, Save" className="mx-auto mb-5 w-full max-w-[250px] object-contain lg:mx-0" />
            <button type="button" onClick={() => setDisasterMode((current) => current === 'flood' ? 'earthquake' : 'flood')} className="mb-2 flex w-full items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[.26em] text-orange-300 hover:text-white lg:justify-start">
              {disasterMode === 'flood' ? <Waves className="h-3.5 w-3.5" /> : <Mountain className="h-3.5 w-3.5" />}{disasterMode} response
            </button>
            <h1 className="font-headline text-4xl font-black tracking-tight text-white sm:text-5xl">Emergency<br />Access</h1>
            <p className="mx-auto mt-3 max-w-[260px] text-xs leading-relaxed text-white/70 lg:mx-0">Secure authentication required for field operations.</p>
          </div>

          <div className="border-t border-white/15 p-6 sm:p-10 lg:border-l lg:border-t-0">
          <div className="mb-6 flex border-b border-white/25">
            {(['login', 'signup'] as const).map((item) => <button key={item} type="button" onClick={() => switchMode(item)} className={`flex-1 border-b-2 py-3 font-mono text-[11px] font-bold uppercase tracking-[.18em] transition-colors ${mode === item ? 'border-orange-400 text-orange-300' : 'border-transparent text-white/50 hover:text-white'}`}>{item === 'login' ? 'Sign in' : 'Sign up'}</button>)}
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {mode === 'signup' && <InputField label="Operator name" type="text" value={name} onChange={setName} placeholder="Your full name" icon={<User className="h-4 w-4" />} autoComplete="name" />}
            <InputField label="Operator ID" type="email" value={email} onChange={setEmail} placeholder="operator@nirnay.org" icon={<Mail className="h-4 w-4" />} autoComplete="email" />
            <InputField label="Access key" type={showPassword ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Enter access key" icon={<Lock className="h-4 w-4" />} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} trailingIcon={<button type="button" onClick={() => setShowPassword((value) => !value)} className="text-white/50 hover:text-white" tabIndex={-1}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} />
            {passwordStrength && <div className="flex items-center gap-2 font-mono text-[10px] text-white/60"><div className="flex flex-1 gap-1">{Array.from({ length: 5 }).map((_, index) => <span key={index} className="h-1 flex-1" style={{ background: index < passwordStrength.score ? passwordStrength.color : 'rgba(255,255,255,.2)' }} />)}</div><span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span></div>}
            {mode === 'signup' && <InputField label="Confirm access key" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat access key" icon={<Lock className="h-4 w-4" />} autoComplete="new-password" trailingIcon={<button type="button" onClick={() => setShowConfirm((value) => !value)} className="text-white/50 hover:text-white" tabIndex={-1}>{showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} />}
            {(localError || error) && <div className="flex items-start gap-2 border border-red-300/40 bg-red-950/70 p-3 text-xs text-red-100"><AlertCircle className="h-4 w-4 shrink-0" />{localError || error}</div>}
            <button type="submit" disabled={isLoading} className="mt-2 flex min-h-12 items-center justify-center gap-2 bg-orange-500 px-4 font-mono text-xs font-black uppercase tracking-[.16em] text-white shadow-[0_8px_25px_rgba(249,115,22,.35)] transition-colors hover:bg-orange-400 disabled:opacity-50">{isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Authorizing</> : <>{mode === 'login' ? 'Authorize deployment' : 'Create operator access'} <ArrowRight className="h-4 w-4" /></>}</button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-3 font-mono text-[10px] text-white/55"><button type="button" onClick={() => setDisasterMode((current) => current === 'flood' ? 'earthquake' : 'flood')} className="uppercase tracking-wider hover:text-white">Switch to {disasterMode === 'flood' ? 'earthquake' : 'flood'}</button><span>Node ALPHA-09 · Secure</span></div>
          </div>
        </section>
      </div>
    </main>
  );
};

function InputField({ label, type, value, onChange, placeholder, icon, autoComplete, trailingIcon }: { label: string; type: string; value: string; onChange: (value: string) => void; placeholder: string; icon: React.ReactNode; autoComplete?: string; trailingIcon?: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/60">{label}</label><div className="relative flex items-center"><div className="pointer-events-none absolute left-3 text-white/45">{icon}</div><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} className="w-full rounded-sm border border-white/30 bg-black/35 py-3 pl-10 pr-10 text-sm text-white outline-none transition-all placeholder:text-white/40 focus:border-orange-300 focus:bg-black/50" />{trailingIcon && <div className="absolute right-3">{trailingIcon}</div>}</div></div>;
}
