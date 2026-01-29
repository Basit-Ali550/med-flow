import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Nurse from '@/models/Nurse';
import { successResponse, errorResponse } from '@/lib/auth';

/**
 * POST /api/auth/register
 * Register a new nurse account
 */
export async function POST(request) {
  console.log('📝 Registration request received');
  
  try {
    console.log('🔄 Connecting to database...');
    await dbConnect();
    console.log('✅ Database connected');
    
    const body = await request.json();
    console.log('📦 Request body:', { ...body, password: '[HIDDEN]' });
    
    const { username, email, password, fullName, department } = body;
    
    // Validate required fields
    if (!username || !email || !password || !fullName) {
      console.log('❌ Missing required fields');
      return errorResponse('All required fields must be provided', 400, {
        required: ['username', 'email', 'password', 'fullName'],
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      console.log('❌ Password too short');
      return errorResponse('Password must be at least 6 characters', 400);
    }
    
    // Check if username already exists
    console.log('🔍 Checking for existing username...');
    const existingUsername = await Nurse.findOne({ username });
    if (existingUsername) {
      console.log('❌ Username already exists');
      return errorResponse('Username already exists', 409);
    }
    
    // Check if email already exists
    console.log('🔍 Checking for existing email...');
    const existingEmail = await Nurse.findOne({ email });
    if (existingEmail) {
      console.log('❌ Email already registered');
      return errorResponse('Email already registered', 409);
    }
    
    // Create new nurse
    console.log('👤 Creating new nurse...');
    const nurse = new Nurse({
      username,
      email,
      password,
      fullName,
      department: department || 'General',
    });
    
    console.log('💾 Saving nurse to database...');
    await nurse.save();
    console.log('✅ Nurse saved successfully with ID:', nurse._id);
    
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
    console.error('❌ Registration error:', error.name, error.message);
    console.error('❌ Full error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => e.message);
      return errorResponse('Validation failed', 400, errors);
    }
    
    return errorResponse(`Internal server error: ${error.message}`, 500);
  }
}

