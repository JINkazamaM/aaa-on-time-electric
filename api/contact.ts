import type { Request, Response } from 'express';
import crypto from 'crypto';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  type: string;
  details: string;
  _csrf?: string;
  _honeypot?: string;
  file?: {
    name: string;
    type: string;
    base64: string;
  } | null;
}

// In production, use Redis or a proper session store
interface RateLimitRecord {
  count: number;
  timestamp: number;
}

interface CsrfRecord {
  token: string;
  timestamp: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const csrfTokenMap = new Map<string, CsrfRecord>();

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5;
const CSRF_TOKEN_WINDOW = 60 * 60 * 1000; // 1 hour
const MAP_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Periodic cleanup of old entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now - record.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(key);
    }
  }
  for (const [key, record] of csrfTokenMap.entries()) {
    if (now - record.timestamp > CSRF_TOKEN_WINDOW) {
      csrfTokenMap.delete(key);
    }
  }
}, MAP_CLEANUP_INTERVAL);

// Get CSRF secret from request or environment
function getCsrfSecret(req: Request): string {
  // First try to get from injected request property
  const injectedSecret = (req as any).csrfSecret;
  if (injectedSecret) return injectedSecret;

  // Fallback to environment variable
  if (process.env.CSRF_SECRET) return process.env.CSRF_SECRET;

  // Development fallback - generate random (not secure for production)
  console.warn('WARNING: Using development CSRF secret. Set CSRF_SECRET environment variable in production!');
  return 'dev-secret-not-for-production';
}

function hashToken(token: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

// Generate CSRF token
function generateCsrfToken(sessionId: string, secret: string): { token: string; sessionId: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(token, secret);
  csrfTokenMap.set(sessionId, { token: hashedToken, timestamp: Date.now() });
  return { token, sessionId };
}

// Validate CSRF token
function validateCsrfToken(sessionId: string, token: string, secret: string): boolean {
  const record = csrfTokenMap.get(sessionId);
  if (!record) return false;
  if (Date.now() - record.timestamp > CSRF_TOKEN_WINDOW) {
    csrfTokenMap.delete(sessionId);
    return false;
  }
  const hashedInput = hashToken(token, secret);
  return record.token === hashedInput;
}

// Get session ID from request - improved security
function getSessionId(req: Request): string {
  // Try to get explicit session ID first (most secure)
  const explicitSession = req.headers['x-session-id']?.toString();
  if (explicitSession && explicitSession.length >= 32 && explicitSession.length <= 128) {
    return 'sess_' + explicitSession;
  }

  // Fall back to fingerprinting (combine multiple headers)
  const userAgent = req.headers['user-agent'] || 'unknown';
  const acceptLang = req.headers['accept-language'] || 'unknown';
  const remoteAddress = req.socket?.remoteAddress || 'unknown';

  // Create a fingerprint hash
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${userAgent}-${acceptLang}-${remoteAddress}`)
    .digest('hex')
    .substring(0, 32);

  return 'sess_' + fingerprint;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function sanitizeInput(input: string): string {
  // XSS protection - encode HTML entities
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Remove potentially dangerous protocols
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// Additional file validation
function validateFileType(fileType: string, fileName: string): boolean {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

  // Check MIME type
  if (!allowedTypes.includes(fileType)) {
    return false;
  }

  // Double-check with file extension
  const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return false;
  }

  return true;
}

function validateFormData(data: ContactFormData): string[] {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Please enter a valid email');
  }

  const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
  if (!data.phone || !phoneRegex.test(data.phone.replace(/\s/g, ''))) {
    errors.push('Please enter a valid phone number');
  }

  if (!data.details || data.details.trim().length < 10) {
    errors.push('Please provide more details (min 10 chars)');
  }

  if (data.details && data.details.length > 5000) {
    errors.push('Details too long (max 5000 characters)');
  }

  return errors;
}

export default async function handler(req: Request, res: Response) {
  // Get CSRF secret for this request
  const csrfSecret = getCsrfSecret(req);

  // Get origin for CORS validation
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://aaaontimeelectric.com',
    'https://www.aaaontimeelectric.com',
    ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:3000', 'http://localhost:5173'] : [])
  ];

  const isAllowedOrigin = allowedOrigins.includes(origin);

  // CORS headers - strict origin validation
  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token, X-Session-Id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle CSRF token generation (GET request)
  if (req.method === 'GET') {
    const sessionId = getSessionId(req);
    const { token } = generateCsrfToken(sessionId, csrfSecret);
    return res.status(200).json({ csrfToken: token, sessionId });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
                   req.socket?.remoteAddress ||
                   'unknown';

  // Rate limiting
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.'
    });
  }

  try {
    const { name, email, phone, type, details, _csrf, _honeypot, file } = req.body as ContactFormData;

    // Honeypot check (spam prevention)
    if (_honeypot && _honeypot.length > 0) {
      // Silently accept but don't process (bots will think it worked)
      return res.status(200).json({ success: true, message: 'Thank you!' });
    }

    // CSRF validation
    const sessionId = getSessionId(req);
    if (!validateCsrfToken(sessionId, _csrf || '', csrfSecret)) {
      return res.status(403).json({ error: 'Invalid security token. Please refresh the page.' });
    }

    // Validation
    const validationErrors = validateFormData({ name, email, phone, type, details });
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      phone: sanitizeInput(phone),
      type: sanitizeInput(type),
      details: sanitizeInput(details),
    };

    // Handle file upload if present
    if (file) {
      // Validate file type using both MIME type and extension
      if (!validateFileType(file.type, file.name)) {
        return res.status(400).json({ error: 'Invalid file type. Only PDF, JPG, and PNG allowed.' });
      }

      // Validate base64 size (approximate)
      const fileSize = Buffer.from(file.base64, 'base64').length;
      if (fileSize > 10 * 1024 * 1024) { // 10MB
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }

      // Validate base64 is valid
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(file.base64)) {
        return res.status(400).json({ error: 'Invalid file data.' });
      }

      // In production, save file to S3 or other storage
      // Structured logging would be done via proper logging service
    }

    // In production, integrate with:
    // - Email service (SendGrid, AWS SES, etc.)
    // - CRM (HubSpot, Salesforce)
    // - Notification service (Slack, Discord)
    // - Database logging

    return res.status(200).json({
      success: true,
      message: 'Thank you! We will contact you within 24 hours.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      error: 'Internal server error. Please try again or call us directly.'
    });
  }
}
