import * as crypto from 'crypto';

export const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
export const CHAIN_VERSION = '1.0.0';

const FORBIDDEN_SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'refreshtoken',
  'accesstoken',
  'secret',
  'jwt',
  'governmentid',
  'aadhaar',
  'pan',
  'rawgrievancetext',
  'authorization',
  'creditcard',
]);

/**
 * Recursively sanitizes and normalizes an object for canonical cryptographic serialization.
 */
export function sanitizeAndNormalize(data: any): any {
  if (data === null || data === undefined) {
    return null;
  }
  if (data instanceof Date) {
    return data.toISOString();
  }
  if (typeof data === 'bigint') {
    return data.toString();
  }
  if (typeof data === 'number' || typeof data === 'boolean' || typeof data === 'string') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeAndNormalize(item));
  }
  if (typeof data === 'object') {
    const sortedKeys = Object.keys(data).sort();
    const result: Record<string, any> = {};
    for (const key of sortedKeys) {
      if (FORBIDDEN_SENSITIVE_KEYS.has(key.toLowerCase())) {
        continue; // strictly strip sensitive fields
      }
      const val = data[key];
      if (val !== undefined) {
        result[key] = sanitizeAndNormalize(val);
      }
    }
    return result;
  }
  return String(data);
}

/**
 * Deterministically serializes an event payload to canonical JSON with sorted keys and normalized types.
 */
export function canonicalizePayload(payload: any): string {
  const normalized = sanitizeAndNormalize(payload);
  return JSON.stringify(normalized);
}

/**
 * Computes SHA-256 hash of a canonicalized payload string.
 */
export function computePayloadHash(canonicalPayload: string): string {
  return crypto.createHash('sha256').update(canonicalPayload, 'utf8').digest('hex');
}

/**
 * Computes HMAC-SHA-256 chain hash linking the previous chain hash, payload hash, and sequence.
 */
export function computeHmacChainHash(
  secret: string,
  prevHash: string,
  payloadHash: string,
  sequence: number,
): string {
  const message = `${prevHash}:${payloadHash}:${sequence}`;
  return crypto.createHmac('sha256', secret).update(message, 'utf8').digest('hex');
}
