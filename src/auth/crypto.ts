/**
 * Nirnay Auth — Web Crypto Utilities
 *
 * Uses PBKDF2 (100,000 iterations, SHA-256) via the browser's native
 * SubtleCrypto API. No third-party crypto library required.
 *
 * Storage format: "<base64-salt>:<base64-hash>"
 */

const ITERATIONS = 100_000;
const KEY_LENGTH  = 32; // 256 bits
const HASH_ALGO   = 'SHA-256';

function bufToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function b64ToBuf(b64: string): Uint8Array {
  return new Uint8Array(
    atob(b64)
      .split('')
      .map((c) => c.charCodeAt(0)),
  );
}

/**
 * Hash a plaintext password.
 * Returns a storable string: "<base64-salt>:<base64-hash>"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH_ALGO },
    keyMaterial,
    KEY_LENGTH * 8,
  );
  return `${bufToB64(salt.buffer)}:${bufToB64(derived)}`;
}

/**
 * Verify a plaintext password against a stored hash string.
 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [saltB64, hashB64] = stored.split(':');
  if (!saltB64 || !hashB64) return false;

  const salt = b64ToBuf(saltB64);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH_ALGO },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  // Constant-time comparison to prevent timing attacks
  const a = new Uint8Array(derived);
  const b = b64ToBuf(hashB64);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Generate a cryptographically random session token (128-bit hex).
 */
export function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
