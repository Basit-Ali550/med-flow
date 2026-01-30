import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Parse cookies from cookie header string
 */
function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(cookie => {
      const [key, ...rest] = cookie.trim().split('=');
      return [key, rest.join('=')];
    })
  );
}

/**
 * Extract token from request headers (Bearer token or cookie)
 */
export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  const cookies = parseCookies(request.headers.get('cookie'));
  return cookies.token || null;
}

/**
 * Middleware to protect API routes
 */
export async function authMiddleware(request) {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return {
      success: false,
      error: 'Authentication required. Please provide a valid token.',
      status: 401,
    };
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return {
      success: false,
      error: 'Invalid or expired token. Please login again.',
      status: 401,
    };
  }
  
  return { success: true, user: decoded };
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

/**
 * Create error response
 */
export function errorResponse(message, status = 500, errors = null) {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return NextResponse.json(response, { status });
}

/**
 * Create success response
 */
export function successResponse(data, message = 'Success', status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

/**
 * Get cookie configuration for auth cookies
 */
export function getAuthCookieConfig(maxAge = 7 * 24 * 60 * 60) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  };
}

