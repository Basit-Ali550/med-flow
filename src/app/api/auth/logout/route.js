import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Logout nurse by clearing the auth cookie
 */
export async function POST(request) {
  const response = successResponse(null, 'Logout successful');
  
  // Clear the auth cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });
  
  return response;
}
