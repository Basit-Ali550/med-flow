import dbConnect from '@/lib/db';
import Patient from '@/models/Patient';
import '@/models/Nurse'; // Import to ensure schema is registered
import { successResponse } from '@/lib/auth';
import { handleApiError, AppError } from '@/lib/error-handler';
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
      throw new AppError('Invalid patient ID format', 400);
    }
    
    const patient = await Patient.findById(id)
      .populate('assignedNurse', 'fullName username email department')
      .lean();
    
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }
    
    return successResponse({ patient });
  } catch (error) {
    return handleApiError(error);
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
      throw new AppError('Invalid patient ID format', 400);
    }
    
    const body = await request.json();
    
    // Find existing patient
    const existingPatient = await Patient.findById(id);
    
    if (!existingPatient) {
      throw new AppError('Patient not found', 404);
    }
    
    // Prepare update data
    const updateData = { ...body };
    
    // Handle vital signs update
    if (body.heartRate !== undefined || body.bloodPressureSys !== undefined || 
        body.bloodPressureDia !== undefined || body.temperature !== undefined || 
        body.o2Saturation !== undefined) {
      
      const currentVitals = existingPatient.vitalSigns && existingPatient.vitalSigns.toObject 
          ? existingPatient.vitalSigns.toObject() 
          : (existingPatient.vitalSigns || {});
          
      updateData.vitalSigns = { ...currentVitals };
      
      if (body.heartRate !== undefined && body.heartRate !== "") updateData.vitalSigns.heartRate = parseFloat(body.heartRate);
      if (body.bloodPressureSys !== undefined && body.bloodPressureSys !== "") updateData.vitalSigns.bloodPressureSys = parseFloat(body.bloodPressureSys);
      if (body.bloodPressureDia !== undefined && body.bloodPressureDia !== "") updateData.vitalSigns.bloodPressureDia = parseFloat(body.bloodPressureDia);
      if (body.temperature !== undefined && body.temperature !== "") updateData.vitalSigns.temperature = parseFloat(body.temperature);
      if (body.o2Saturation !== undefined && body.o2Saturation !== "") updateData.vitalSigns.o2Saturation = parseFloat(body.o2Saturation);
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
    return handleApiError(error);
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
      throw new AppError('Invalid patient ID format', 400);
    }
    
    const body = await request.json();
    
    // Find and update patient
    const patient = await Patient.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('assignedNurse', 'fullName username');
    
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }
    
    return successResponse({ patient }, 'Patient updated successfully');
  } catch (error) {
    // Handling Data Corruption: Self-Healing Mechanism
    // If Mongoose fails to instantiate because aiAnalysis is a string (instead of object),
    // we detect this specific error and fix it by unsetting the bad field.
    if (error.message && error.message.includes("Cannot create property 'timestamp' on string")) {
       console.warn(`[Self-Healing] Detected corrupted aiAnalysis for patient ${params.id}. Resetting field.`);
       try {
          await dbConnect();
          const { id } = await params;
          await Patient.collection.updateOne(
             { _id: new mongoose.Types.ObjectId(id) },
             { $unset: { aiAnalysis: "" } } // Remove corrupted field
          );
          
          // Retry the original update
          const body = await request.json().catch(() => ({})); 
          const retryPatient = await Patient.findByIdAndUpdate(
              id,
              { $set: body },
              { new: true, runValidators: true }
          ).populate('assignedNurse', 'fullName username');
          
          return successResponse({ patient: retryPatient }, 'Patient updated successfully (after repair)');
       } catch (retryError) {
          return handleApiError(retryError);
       }
    }

    return handleApiError(error);
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
      throw new AppError('Invalid patient ID format', 400);
    }
    
    const patient = await Patient.findByIdAndDelete(id);
    
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }
    
    return successResponse(
      { deletedPatient: { id: patient._id, fullName: patient.fullName } },
      'Patient deleted successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
