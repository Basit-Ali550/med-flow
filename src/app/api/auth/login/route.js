import dbConnect from '@/lib/db';
import Nurse from '@/models/Nurse';
import { generateToken, successResponse, errorResponse, getAuthCookieConfig } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Nurse login endpoint
 */
export async function POST(request) {
  try {
    await dbConnect();
    
    const { username, password } = await request.json();
    
    // Validate input
    if (!username || !password) {
      return errorResponse('Username/email and password are required', 400);
    }
    
    // Find nurse by username OR email
    const nurse = await Nurse.findOne({
      $or: [{ username }, { email: username.toLowerCase() }]
    }).select('+password');
    
    if (!nurse) {
      return errorResponse('Invalid credentials', 401);
    }
    
    if (!nurse.isActive) {
      return errorResponse('Account is deactivated. Please contact admin.', 401);
    }
    
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
    const nurseData = {
      id: nurse._id,
      username: nurse.username,
      email: nurse.email,
      fullName: nurse.fullName,
      department: nurse.department,
    };
    
    const response = successResponse({ nurse: nurseData, token }, 'Login successful');
    response.cookies.set('token', token, getAuthCookieConfig());
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}

