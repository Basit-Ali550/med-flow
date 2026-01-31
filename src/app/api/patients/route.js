import dbConnect from '@/lib/db';
import Patient from '@/models/Patient';
import '@/models/Nurse'; // Import to ensure schema is registered
import { successResponse } from '@/lib/auth';
import { handleApiError, AppError } from '@/lib/error-handler';

/**
 * GET /api/patients
 * Get all patients with optional filtering, sorting, and pagination
 */
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    
    // Filters
    const status = searchParams.get('status');
    const triageLevel = searchParams.get('triageLevel');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'registeredAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (triageLevel && triageLevel !== 'all') {
      query.triageLevel = triageLevel;
    }
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { symptoms: { $regex: search, $options: 'i' } },
        { chiefComplaint: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (dateFrom || dateTo) {
      query.registeredAt = {};
      if (dateFrom) {
        query.registeredAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.registeredAt.$lte = new Date(dateTo);
      }
    }
    
    // Execute query
    const [patients, totalCount] = await Promise.all([
      Patient.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('assignedNurse', 'fullName username')
        .lean(),
      Patient.countDocuments(query),
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return successResponse({
      patients,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/patients
 * Create a new patient (patient registration)
 */
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Destructure and validate patient data
    const {
      fullName,
      dateOfBirth,
      gender,
      contactNumber,
      email,
      address,
      symptoms,
      painLevel,
      chiefComplaint,
      allergies,
      medications,
      chronicConditions,
      medicalHistory,
      smokes,
      consumesAlcohol,
      takesOtherDrugs,
      otherDrugsDetails,
      heartRate,
      bloodPressureSys,
      bloodPressureDia,
      temperature,
      o2Saturation,
      triageLevel,
      isEmergency,
      nurseNotes,
      assignedNurse,
    } = body;
    
    // Validate required fields
    if (!fullName || !dateOfBirth || !symptoms) {
      throw new AppError('Full name, date of birth, and symptoms are required', 400);
    }
    
    // Create vital signs object if any vital data provided
    const vitalSigns = {};
    if (heartRate) vitalSigns.heartRate = parseFloat(heartRate);
    if (bloodPressureSys) vitalSigns.bloodPressureSys = parseFloat(bloodPressureSys);
    if (bloodPressureDia) vitalSigns.bloodPressureDia = parseFloat(bloodPressureDia);
    if (temperature) vitalSigns.temperature = parseFloat(temperature);
    if (o2Saturation) vitalSigns.o2Saturation = parseFloat(o2Saturation);
    if (Object.keys(vitalSigns).length > 0) {
      vitalSigns.recordedAt = new Date();
    }
    
    // Calculate initial triage level based on vital signs (simple algorithm)
    let calculatedTriageLevel = triageLevel || 'Pending';
    if (!triageLevel && Object.keys(vitalSigns).length > 0) {
      calculatedTriageLevel = calculateTriageLevel(vitalSigns, painLevel || 0, isEmergency);
    }
    
    // Create new patient
    const patient = new Patient({
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      gender: gender || '',
      contactNumber,
      email,
      address,
      symptoms,
      painLevel: painLevel || 0,
      chiefComplaint,
      allergies: allergies || '',
      medications: medications || '',
      chronicConditions: chronicConditions || '',
      medicalHistory,
      smokes: smokes || '',
      consumesAlcohol: consumesAlcohol || '',
      takesOtherDrugs: takesOtherDrugs || '',
      otherDrugsDetails: otherDrugsDetails || '',
      vitalSigns: Object.keys(vitalSigns).length > 0 ? vitalSigns : undefined,
      triageLevel: calculatedTriageLevel,
      status: 'Waiting',
      registeredAt: new Date(),
      isEmergency: isEmergency || false,
      requiresImmediate: calculatedTriageLevel === 'Critical',
      nurseNotes,
      assignedNurse,
    });
    
    await patient.save();
    
    return successResponse(
      { patient },
      'Patient registered successfully',
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}


/**
 * Simple triage level calculation based on vital signs
 */
function calculateTriageLevel(vitalSigns, painLevel, isEmergency) {
  if (isEmergency) return 'Critical';
  
  let score = 0;
  
  // Heart rate thresholds
  if (vitalSigns.heartRate) {
    if (vitalSigns.heartRate < 50 || vitalSigns.heartRate > 120) score += 2;
    else if (vitalSigns.heartRate < 60 || vitalSigns.heartRate > 100) score += 1;
  }
  
  // Blood pressure thresholds
  if (vitalSigns.bloodPressureSys) {
    if (vitalSigns.bloodPressureSys < 90 || vitalSigns.bloodPressureSys > 180) score += 2;
    else if (vitalSigns.bloodPressureSys < 100 || vitalSigns.bloodPressureSys > 140) score += 1;
  }
  
  // Temperature thresholds
  if (vitalSigns.temperature) {
    if (vitalSigns.temperature < 35 || vitalSigns.temperature > 40) score += 2;
    else if (vitalSigns.temperature < 36 || vitalSigns.temperature > 38) score += 1;
  }
  
  // O2 saturation thresholds
  if (vitalSigns.o2Saturation) {
    if (vitalSigns.o2Saturation < 90) score += 3;
    else if (vitalSigns.o2Saturation < 95) score += 1;
  }
  
  // Pain level contribution
  if (painLevel >= 8) score += 2;
  else if (painLevel >= 5) score += 1;
  
  // Determine triage level based on score
  if (score >= 6) return 'Critical';
  if (score >= 4) return 'Urgent';
  if (score >= 2) return 'Semi-Urgent';
  return 'Non-Urgent';
}
