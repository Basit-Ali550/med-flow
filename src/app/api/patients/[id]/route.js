import dbConnect from '@/lib/db';
import Patient from '@/models/Patient';
import '@/models/Nurse'; // Import to ensure schema is registered
import { successResponse, errorResponse } from '@/lib/auth';
import mongoose from 'mongoose';

/**
 * GET /api/patients/[id]
 * Get a single patient by ID
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid patient ID format', 400);
    }
    
    const patient = await Patient.findById(id)
      .populate('assignedNurse', 'fullName username email department')
      .lean();
    
    if (!patient) {
      return errorResponse('Patient not found', 404);
    }
    
    return successResponse({ patient });
  } catch (error) {
    console.error('Get patient error:', error);
    return errorResponse('Failed to fetch patient', 500);
  }
}

/**
 * PUT /api/patients/[id]
 * Update a patient by ID
 */
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid patient ID format', 400);
    }
    
    const body = await request.json();
    
    // Find existing patient
    const existingPatient = await Patient.findById(id);
    
    if (!existingPatient) {
      return errorResponse('Patient not found', 404);
    }
    
    // Prepare update data
    const updateData = { ...body };
    
    // Handle vital signs update
    if (body.heartRate !== undefined || body.bloodPressureSys !== undefined || 
        body.bloodPressureDia !== undefined || body.temperature !== undefined || 
        body.o2Saturation !== undefined) {
      
      updateData.vitalSigns = {
        ...(existingPatient.vitalSigns || {}),
      };
      
      if (body.heartRate !== undefined) updateData.vitalSigns.heartRate = parseFloat(body.heartRate);
      if (body.bloodPressureSys !== undefined) updateData.vitalSigns.bloodPressureSys = parseFloat(body.bloodPressureSys);
      if (body.bloodPressureDia !== undefined) updateData.vitalSigns.bloodPressureDia = parseFloat(body.bloodPressureDia);
      if (body.temperature !== undefined) updateData.vitalSigns.temperature = parseFloat(body.temperature);
      if (body.o2Saturation !== undefined) updateData.vitalSigns.o2Saturation = parseFloat(body.o2Saturation);
      updateData.vitalSigns.recordedAt = new Date();
      
      // Remove individual vital fields from updateData
      delete updateData.heartRate;
      delete updateData.bloodPressureSys;
      delete updateData.bloodPressureDia;
      delete updateData.temperature;
      delete updateData.o2Saturation;
    }
    
    // Handle date fields
    if (body.dateOfBirth) {
      updateData.dateOfBirth = new Date(body.dateOfBirth);
    }
    
    // Handle status change timestamps
    if (body.status === 'Completed' || body.status === 'Discharged') {
      updateData.dischargedAt = new Date();
    }
    
    if (body.triageLevel && body.triageLevel !== 'Pending' && !existingPatient.triageAt) {
      updateData.triageAt = new Date();
    }
    
    // Update patient
    const patient = await Patient.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('assignedNurse', 'fullName username');
    
    return successResponse({ patient }, 'Patient updated successfully');
  } catch (error) {
    console.error('Update patient error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => e.message);
      return errorResponse('Validation failed', 400, errors);
    }
    
    return errorResponse('Failed to update patient', 500);
  }
}

/**
 * PATCH /api/patients/[id]
 * Partially update a patient (useful for status updates, etc.)
 */
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid patient ID format', 400);
    }
    
    const body = await request.json();
    
    // Find and update patient
    const patient = await Patient.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('assignedNurse', 'fullName username');
    
    if (!patient) {
      return errorResponse('Patient not found', 404);
    }
    
    return successResponse({ patient }, 'Patient updated successfully');
  } catch (error) {
    console.error('Patch patient error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => e.message);
      return errorResponse('Validation failed', 400, errors);
    }
    
    return errorResponse('Failed to update patient', 500);
  }
}

/**
 * DELETE /api/patients/[id]
 * Delete a patient by ID
 */
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid patient ID format', 400);
    }
    
    const patient = await Patient.findByIdAndDelete(id);
    
    if (!patient) {
      return errorResponse('Patient not found', 404);
    }
    
    return successResponse(
      { deletedPatient: { id: patient._id, fullName: patient.fullName } },
      'Patient deleted successfully'
    );
  } catch (error) {
    console.error('Delete patient error:', error);
    return errorResponse('Failed to delete patient', 500);
  }
}
