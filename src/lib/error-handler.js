import { NextResponse } from 'next/server';
import { toast } from 'sonner';

/**
 * Custom Error Class for Application Errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Backend Error Handler (for Next.js API Routes)
 */
export function handleApiError(error) {
  console.error('❌ API Error Path:', error.path || 'Unknown');
  console.error('❌ API Error Message:', error.message);

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let errors = error.errors || null;

  // Handle Mongoose Validation Error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Failed';
    errors = Object.values(error.errors).map((err) => err.message);
  }

  // Handle Mongoose Cast Error (Invalid ID)
  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
  }

  // Handle Mongoose Duplicate Key Error
  if (error.code === 11000) {
    statusCode = 400;
    const field = Object.keys(error.keyValue)[0];
    message = `Duplicate field value: ${field}. Please use another value.`;
  }

  // Handle JWT Errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }
  
  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  }

  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors && { errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
    { status: statusCode }
  );
}

/**
 * Frontend Error Handler (for Client Components & Hooks)
 */
export function handleClientError(error, showToast = true) {
  console.error('🔍 Client Side Error:', error);

  let message = 'Something went wrong. Please try again.';
  
  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    // If it's a custom error from our apiRequest handler
    // Prioritize specific validation errors if available
    if (error.data?.errors && Array.isArray(error.data.errors) && error.data.errors.length > 0) {
       message = error.data.errors[0]; 
    } else {
       message = error.data?.message || error.message;
    }
  }

  if (showToast) {
    toast.error(message);
  }

  return message;
}
