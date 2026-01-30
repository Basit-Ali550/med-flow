import dbConnect from '@/lib/db';
import Nurse from '@/models/Nurse';
import { successResponse } from '@/lib/auth';
import { handleApiError, AppError } from '@/lib/error-handler';

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
      throw new AppError('All required fields must be provided', 400);
    }
    
    // Validate password length
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }
    
    // Check if username or email already exists
    const existingUser = await Nurse.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      const field = existingUser.username === username ? 'Username' : 'Email';
      throw new AppError(`${field} already exists`, 409);
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
    return handleApiError(error);
  }
}

