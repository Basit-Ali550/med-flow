import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Nurse from '@/models/Nurse';
import { generateToken, successResponse, errorResponse } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Nurse login endpoint
 */
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { username, password } = body;
    
    // Validate input
    if (!username || !password) {
      return errorResponse('Username/email and password are required', 400);
    }
    
    // Find nurse by username OR email (include password for comparison)
    // This allows users to login with either their username or email
    const nurse = await Nurse.findOne({
      $or: [
        { username: username },
        { email: username.toLowerCase() }
      ]
    }).select('+password');
    
    if (!nurse) {
      return errorResponse('Invalid credentials', 401);
    }
    
    // Check if nurse is active
    if (!nurse.isActive) {
      return errorResponse('Account is deactivated. Please contact admin.', 401);
    }
    
    // Compare passwords
    const isPasswordValid = await nurse.comparePassword(password);
    
    if (!isPasswordValid) {
      return errorResponse('Invalid credentials', 401);
    }
    
    // Update last login
    nurse.lastLogin = new Date();
    await nurse.save();
    
    // Generate JWT token
    const token = generateToken({
      id: nurse._id,
      username: nurse.username,
      email: nurse.email,
      fullName: nurse.fullName,
      department: nurse.department,
    });
    
    // Create response with cookie
    const response = successResponse(
      {
        nurse: {
          id: nurse._id,
          username: nurse.username,
          email: nurse.email,
          fullName: nurse.fullName,
          department: nurse.department,
        },
        token,
      },
      'Login successful'
    );
    
    // Set HTTP-only cookie for additional security
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}
