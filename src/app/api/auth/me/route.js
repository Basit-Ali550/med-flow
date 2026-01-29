import dbConnect from '@/lib/db';
import Nurse from '@/models/Nurse';
import { authMiddleware, successResponse, errorResponse, unauthorizedResponse } from '@/lib/auth';

/**
 * GET /api/auth/me
 * Get current logged-in nurse profile
 */
export async function GET(request) {
  try {
    const auth = await authMiddleware(request);
    
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }
    
    await dbConnect();
    
    const nurse = await Nurse.findById(auth.user.id);
    
    if (!nurse) {
      return errorResponse('Nurse not found', 404);
    }
    
    return successResponse({
      nurse: {
        id: nurse._id,
        username: nurse.username,
        email: nurse.email,
        fullName: nurse.fullName,
        department: nurse.department,
        isActive: nurse.isActive,
        lastLogin: nurse.lastLogin,
        createdAt: nurse.createdAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse('Internal server error', 500);
  }
}
