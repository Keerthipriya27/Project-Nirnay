import React, { useState } from 'react';
import {
  Shield,
  User,
  Radio,
  Activity,
  CheckCircle2,
  Clock,
  Bell,
  BrainCircuit,
  Zap,
  Edit3,
  ImagePlus,
  Trash2,
} from 'lucide-react';

const MISSIONS = [
  { id: 'M-001', label: 'Zone C — Flood Triage', time: '14:15', status: 'ACTIVE', color: 'text-red-400', dot: 'bg-red-500' },
  { id: 'M-002', label: 'Route B Route Activation', time: '14:10', status: 'COMPLETED', color: 'text-[#00ff99]', dot: 'bg-[#00ff99]' },
  { id: 'M-003', label: 'Broadway St. Closure Sim', time: '14:07', status: 'COMPLETED', color: 'text-[#00ff99]', dot: 'bg-[#00ff99]' },
  { id: 'M-004', label: 'ROVER-07 Optical Verify', time: '14:02', status: 'COMPLETED', color: 'text-[#00ff99]', dot: 'bg-[#00ff99]' },
  { id: 'M-005', label: 'Shelter 4 Capacity Alert', time: '13:55', status: 'PENDING', color: 'text-yellow-400', dot: 'bg-yellow-400' },
];

export const ProfilePage: React.FC = () => {
  const [notifyOps, setNotifyOps]       = useState(true);
  const [notifyAI, setNotifyAI]         = useState(true);
  const [editMode, setEditMode]         = useState(false);
  const [name, setName]                 = useState(() => localStorage.getItem('nirnay_profile_name') || 'Emergency Operator');
  const [avatarUrl, setAvatarUrl]       = useState(() => localStorage.getItem('nirnay_profile_avatar') || '');
  const [role, setRole]                 = useState('Crisis Response Commander');
  const [editedName, setEditedName]     = useState(name);
  const [editedRole, setEditedRole]     = useState(role);

  function saveEdit() {
    setName(editedName);
    localStorage.setItem('nirnay_profile_name', editedName);
    setRole(editedRole);
    setEditMode(false);
  }

  function handleProfilePictureChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        localStorage.setItem('nirnay_profile_avatar', reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  return (
    <div className="w-full min-h-full bg-[#050506] text-slate-200 overflow-y-auto custom-scrollbar pb-28 md:pb-10">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        {/* ══════════════════════════════
            PROFILE HERO
        ══════════════════════════════ */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10">
          {/* background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#08101a] via-[#060810] to-[#050506]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_30%_40%,rgba(0,80,120,0.3),transparent)]" />

          <div className="relative p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00d9ff] to-blue-700 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(0,217,255,0.3)]">
                {avatarUrl ? <img src={avatarUrl} alt={`${name} profile`} className="h-full w-full rounded-2xl object-cover" /> : <User className="w-9 h-9 text-white" />}
              </div>
              <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
                <label className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#050506] bg-[#00d9ff] text-[#061014] shadow-lg" title="Upload profile picture">
                  <ImagePlus className="h-3.5 w-3.5" />
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProfilePictureChange} className="sr-only" />
                </label>
                {avatarUrl && <button type="button" onClick={() => { setAvatarUrl(''); localStorage.removeItem('nirnay_profile_avatar'); }} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#050506] bg-red-500 text-white shadow-lg" title="Remove profile picture"><Trash2 className="h-3.5 w-3.5" /></button>}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00ff99] rounded-full border-2 border-[#050506] flex items-center justify-center">
                <span className="text-[6px] font-black text-black">●</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {editMode ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={editedName}
                    onChange={e => setEditedName(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm font-mono text-white outline-none focus:border-[#00d9ff]/60"
                  />
                  <input
                    value={editedRole}
                    onChange={e => setEditedRole(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white/60 outline-none focus:border-[#00d9ff]/60"
                  />
                  <div className="flex gap-2 mt-1">
                    <button onClick={saveEdit} className="px-4 py-1.5 bg-[#00d9ff] text-[#061014] font-mono font-bold text-xs rounded-lg cursor-pointer">Save</button>
                    <button onClick={() => setEditMode(false)} className="px-4 py-1.5 bg-white/10 text-white font-mono text-xs rounded-lg cursor-pointer">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl md:text-2xl font-mono font-black text-white">{name}</h2>
                  <p className="text-sm text-white/50 mt-0.5">{role}</p>
                  <p className="text-xs text-white/35 mt-1 font-mono">Local command profile · Ready for operations</p>
                </>
              )}

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <span className="text-[9px] font-mono font-bold px-2 py-1 rounded bg-red-500/15 border border-red-500/30 text-red-400 uppercase tracking-widest">
                  NIRNAY NODE: ALPHA-09
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-1 rounded bg-[#00ff99]/10 border border-[#00ff99]/30 text-[#00ff99] uppercase tracking-widest">
                  ● ONLINE
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-1 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 uppercase tracking-widest">
                  CLEARANCE L5
                </span>
              </div>
            </div>

            {/* Edit button */}
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
        </div>

        {/* ══════════════════════════════
            MISSION HISTORY
        ══════════════════════════════ */}
        <div className="bg-[#0a0a0c]/80 rounded-xl border border-white/10 p-5">
          <h3 className="font-mono text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Mission Log
          </h3>
          <div className="flex flex-col gap-2">
            {MISSIONS.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${m.dot}`} />
                  <div>
                    <div className="text-xs font-mono font-bold text-white">{m.label}</div>
                    <div className="text-[10px] text-white/30 font-mono">Mission #{m.id} · {m.time}</div>
                  </div>
                </div>
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${m.color}`}>{m.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════
            SYSTEM STATS
        ══════════════════════════════ */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'AI Queries', value: '47', icon: <BrainCircuit className="w-4 h-4" />, color: 'text-[#00ff99]' },
            { label: 'Routes Calc.', value: '12', icon: <Activity className="w-4 h-4" />, color: 'text-[#00d9ff]' },
            { label: 'Decisions', value: '8', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#0a0a0c]/80 rounded-xl border border-white/10 p-4 flex flex-col items-center gap-2 text-center">
              <div className={s.color}>{s.icon}</div>
              <div className={`font-mono text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════
            SETTINGS
        ══════════════════════════════ */}
        <div className="bg-[#0a0a0c]/80 rounded-xl border border-white/10 p-5 flex flex-col gap-4">
          <h3 className="font-mono text-xs font-bold text-white/40 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Preferences
          </h3>

          {[
            { label: 'Ops Alert Notifications', sub: 'New incidents, asset status', state: notifyOps, toggle: () => setNotifyOps(v => !v), icon: <Bell className="w-4 h-4" /> },
            { label: 'AI Decision Alerts', sub: 'Gemini recommendations', state: notifyAI, toggle: () => setNotifyAI(v => !v), icon: <BrainCircuit className="w-4 h-4" /> },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <div className="text-white/40">{s.icon}</div>
                <div>
                  <div className="text-xs font-mono font-bold text-white">{s.label}</div>
                  <div className="text-[10px] text-white/30">{s.sub}</div>
                </div>
              </div>
              <button
                onClick={s.toggle}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer relative ${s.state ? 'bg-[#00d9ff]' : 'bg-white/20'}`}
                style={{ height: '22px', minWidth: '40px' }}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow ${s.state ? 'translate-x-[18px]' : 'translate-x-0'}`}
                />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
