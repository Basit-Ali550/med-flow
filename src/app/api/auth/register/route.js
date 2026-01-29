import dbConnect from '@/lib/db';
import Nurse from '@/models/Nurse';
import { successResponse, errorResponse } from '@/lib/auth';

/**
 * POST /api/auth/register
 * Register a new nurse account
 */
export async function POST(request) {
  try {
    await dbConnect();
    
    const { username, email, password, fullName, department } = await request.json();
    
    // Validate required fields
    if (!username || !email || !password || !fullName) {
      return errorResponse('All required fields must be provided', 400, {
        required: ['username', 'email', 'password', 'fullName'],
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }
    
    // Check if username or email already exists
    const existingUser = await Nurse.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      const field = existingUser.username === username ? 'Username' : 'Email';
      return errorResponse(`${field} already exists`, 409);
    }
    
    // Create new nurse
    const nurse = new Nurse({
      username,
      email,
      password,
      fullName,
      department: department || 'General',
    });
    
    await nurse.save();
    
    return successResponse(
      {
        nurse: {
          id: nurse._id,
          username: nurse.username,
          email: nurse.email,
          fullName: nurse.fullName,
          department: nurse.department,
        },
      },
      'Registration successful',
      201
    );
  } catch (error) {
    console.error('Registration error:', error.message);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return errorResponse('Validation failed', 400, errors);
    }
    
    return errorResponse('Internal server error', 500);
  }
}
