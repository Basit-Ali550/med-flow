import { successResponse, getAuthCookieConfig } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Logout nurse by clearing the auth cookie
 */
export async function POST() {
  const response = successResponse(null, 'Logout successful');
  response.cookies.set('token', '', getAuthCookieConfig(0)); // maxAge: 0 expires immediately
  return response;
}

