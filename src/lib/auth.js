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
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from request headers
 */
export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    
    if (cookies.token) {
      return cookies.token;
    }
  }
  
  return null;
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
  
  return {
    success: true,
    user: decoded,
  };
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 401 }
  );
}

/**
 * Create error response
 */
export function errorResponse(message, status = 500, errors = null) {
  const response = {
    success: false,
    message,
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Create success response
 */
export function successResponse(data, message = 'Success', status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}
