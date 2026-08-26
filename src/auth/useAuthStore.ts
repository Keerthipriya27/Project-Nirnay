/**
 * Nirnay Auth Store (Zustand)
 *
 * Handles:
 *  - Email / password sign-up  (PBKDF2-hashed, stored in localStorage)
 *  - Email / password login
 *  - Google OAuth login  (via Google Identity Services popup)
 *  - Session persistence  (token stored in sessionStorage)
 *  - Logout
 */

import { create } from 'zustand';
import { hashPassword, verifyPassword, generateSessionToken } from './crypto';

/* ── Types ── */

export interface NirnayUser {
  id: string;
  name: string;
  email: string;
  provider: 'email' | 'google';
  avatarUrl?: string;
  clearanceLevel: number;
  nodeId: string;
  createdAt: string;
}

interface StoredCredential {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  clearanceLevel: number;
  nodeId: string;
  createdAt: string;
}

interface AuthState {
  user: NirnayUser | null;
  sessionToken: string | null;
  isLoading: boolean;
  error: string | null;

  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  restoreSession: () => void;
}

/* ── Storage keys ── */
const CREDENTIALS_KEY = 'nirnay_credentials_v1';
const SESSION_KEY     = 'nirnay_session_v1';
const USER_KEY        = 'nirnay_user_v1';

/* ── Helpers ── */

function loadCredentials(): StoredCredential[] {
  try {
    return JSON.parse(localStorage.getItem(CREDENTIALS_KEY) ?? '[]') as StoredCredential[];
  } catch {
    return [];
  }
}

function saveCredentials(creds: StoredCredential[]): void {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
}

function persistSession(token: string, user: NirnayUser): void {
  sessionStorage.setItem(SESSION_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function randomNodeId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return 'NODE-' + Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => chars[b % chars.length])
    .join('');
}

function decodeGoogleJwt(credential: string): { sub: string; email: string; name: string; picture?: string } | null {
  try {
    const payload = credential.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as { sub: string; email: string; name: string; picture?: string };
  } catch {
    return null;
  }
}

/* ── Store ── */

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  sessionToken: null,
  isLoading: false,
  error: null,

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const creds = loadCredentials();
      const normalised = email.trim().toLowerCase();

      if (creds.some((c) => c.email === normalised)) {
        throw new Error('An account with this email already exists.');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters.');
      }

      const passwordHash = await hashPassword(password);
      const id = generateSessionToken();
      const nodeId = randomNodeId();

      const newCred: StoredCredential = {
        id,
        email: normalised,
        name: name.trim(),
        passwordHash,
        clearanceLevel: 5,
        nodeId,
        createdAt: new Date().toISOString(),
      };

      saveCredentials([...creds, newCred]);

      const user: NirnayUser = {
        id,
        name: name.trim(),
        email: normalised,
        provider: 'email',
        clearanceLevel: 5,
        nodeId,
        createdAt: newCred.createdAt,
      };

      const token = generateSessionToken();
      persistSession(token, user);
      set({ user, sessionToken: token, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const normalised = email.trim().toLowerCase();
      const creds = loadCredentials();
      const cred = creds.find((c) => c.email === normalised);

      if (!cred) {
        throw new Error('Invalid email or password.');
      }

      const valid = await verifyPassword(password, cred.passwordHash);
      if (!valid) {
        throw new Error('Invalid email or password.');
      }

      const user: NirnayUser = {
        id: cred.id,
        name: cred.name,
        email: cred.email,
        provider: 'email',
        clearanceLevel: cred.clearanceLevel,
        nodeId: cred.nodeId,
        createdAt: cred.createdAt,
      };

      const token = generateSessionToken();
      persistSession(token, user);
      set({ user, sessionToken: token, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  loginWithGoogle: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      const payload = decodeGoogleJwt(credential);
      if (!payload) throw new Error('Invalid Google credential.');

      const creds = loadCredentials();
      const googleId = `google_${payload.sub}`;
      let existing = creds.find((c) => c.id === googleId);

      if (!existing) {
        const newCred: StoredCredential = {
          id: googleId,
          email: payload.email,
          name: payload.name,
          passwordHash: '',
          clearanceLevel: 5,
          nodeId: randomNodeId(),
          createdAt: new Date().toISOString(),
        };
        saveCredentials([...creds, newCred]);
        existing = newCred;
      }

      const user: NirnayUser = {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        provider: 'google',
        avatarUrl: payload.picture,
        clearanceLevel: existing.clearanceLevel,
        nodeId: existing.nodeId,
        createdAt: existing.createdAt,
      };

      const token = generateSessionToken();
      persistSession(token, user);
      set({ user, sessionToken: token, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  logout: () => {
    clearSession();
    set({ user: null, sessionToken: null, error: null });
  },

  restoreSession: () => {
    try {
      const token = sessionStorage.getItem(SESSION_KEY);
      const userJson = sessionStorage.getItem(USER_KEY);
      if (token && userJson) {
        const user = JSON.parse(userJson) as NirnayUser;
        set({ user, sessionToken: token });
      }
    } catch {
      clearSession();
    }
  },

  clearError: () => set({ error: null }),
}));
