import dbConnect from '@/lib/db';
import Nurse from '@/models/Nurse';
import { generateToken, successResponse, getAuthCookieConfig } from '@/lib/auth';
import { handleApiError, AppError } from '@/lib/error-handler';

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
      throw new AppError('Username/email and password are required', 400);
    }
    
    // Find nurse by username OR email
    const nurse = await Nurse.findOne({
      $or: [{ username }, { email: username.toLowerCase() }]
    }).select('+password');
    
    if (!nurse) {
      throw new AppError('Invalid credentials', 401);
    }
    
    if (!nurse.isActive) {
      throw new AppError('Account is deactivated. Please contact admin.', 401);
    }
    
    const isPasswordValid = await nurse.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
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
    return handleApiError(error);
  }
}


