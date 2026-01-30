import dbConnect from '@/lib/db';
import Patient from '@/models/Patient';
import { successResponse } from '@/lib/auth';
import { PATIENT_STATUS, TRIAGE_LEVELS } from '@/lib/constants';
import { handleApiError } from '@/lib/error-handler';

/**
 * GET /api/patients/stats
 * Get patient statistics for dashboard
 */
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    // Build date filter
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.registeredAt = {};
      if (dateFrom) dateFilter.registeredAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.registeredAt.$lte = new Date(dateTo);
    }
    
    // Get all stats in parallel
    const [
      totalPatients,
      waitingPatients,
      inProgressPatients,
      completedToday,
      triageLevelStats,
      statusStats,
      todayRegistrations,
      averageWaitTime,
    ] = await Promise.all([
      // Total patients
      Patient.countDocuments(dateFilter),
      
      // Waiting patients
      Patient.countDocuments({ ...dateFilter, status: PATIENT_STATUS.WAITING }),
      
      // In progress patients
      Patient.countDocuments({ ...dateFilter, status: PATIENT_STATUS.IN_PROGRESS }),
      
      // Completed/Discharged patients (in date range)
      Patient.countDocuments({ 
        ...dateFilter, 
        status: { $in: [PATIENT_STATUS.COMPLETED, PATIENT_STATUS.DISCHARGED] } 
      }),
      
      // Stats by triage level
      Patient.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$triageLevel',
            count: { $sum: 1 },
          },
        },
      ]),
      
      // Stats by status
      Patient.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      
      // Today's registrations
      Patient.countDocuments({
        registeredAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      
      // Average wait time for waiting patients
      Patient.aggregate([
        { $match: { status: PATIENT_STATUS.WAITING } },
        {
          $project: {
            waitTime: {
              $divide: [
                { $subtract: [new Date(), '$registeredAt'] },
                1000 * 60, // Convert to minutes
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgWaitTime: { $avg: '$waitTime' },
          },
        },
      ]),
    ]);
    
    // Format triage level stats using constants
    const triageLevels = Object.fromEntries(
      Object.values(TRIAGE_LEVELS).map(level => [level, 0])
    );
    triageLevelStats.forEach((stat) => {
      if (stat._id && triageLevels.hasOwnProperty(stat._id)) {
        triageLevels[stat._id] = stat.count;
      }
    });
    
    // Format status stats using constants
    const statuses = Object.fromEntries(
      Object.values(PATIENT_STATUS).map(status => [status, 0])
    );
    statusStats.forEach((stat) => {
      if (stat._id && statuses.hasOwnProperty(stat._id)) {
        statuses[stat._id] = stat.count;
      }
    });
    
    return successResponse({
      overview: {
        totalPatients,
        waitingPatients,
        inProgressPatients,
        completedToday,
        todayRegistrations,
        averageWaitTime: averageWaitTime[0]?.avgWaitTime 
          ? Math.round(averageWaitTime[0].avgWaitTime) 
          : 0,
      },
      triageLevels,
      statuses,
    });
  } catch (error) {
    return handleApiError(error);
  }
}


