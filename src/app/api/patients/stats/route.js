import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Patient from '@/models/Patient';
import { successResponse, errorResponse } from '@/lib/auth';

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
      completedPatients,
      triageLevelStats,
      statusStats,
      todayRegistrations,
      averageWaitTime,
    ] = await Promise.all([
      // Total patients
      Patient.countDocuments(dateFilter),
      
      // Waiting patients
      Patient.countDocuments({ ...dateFilter, status: 'Waiting' }),
      
      // In progress patients
      Patient.countDocuments({ ...dateFilter, status: 'In Progress' }),
      
      // Completed patients (today)
      Patient.countDocuments({ 
        ...dateFilter, 
        status: { $in: ['Completed', 'Discharged'] } 
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
        { $match: { status: 'Waiting' } },
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
    
    // Format triage level stats
    const triageLevels = {
      Critical: 0,
      Urgent: 0,
      'Semi-Urgent': 0,
      'Non-Urgent': 0,
      Pending: 0,
    };
    triageLevelStats.forEach((stat) => {
      if (stat._id && triageLevels.hasOwnProperty(stat._id)) {
        triageLevels[stat._id] = stat.count;
      }
    });
    
    // Format status stats
    const statuses = {
      Waiting: 0,
      'In Progress': 0,
      Completed: 0,
      Discharged: 0,
      Transferred: 0,
      Cancelled: 0,
    };
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
        completedPatients,
        todayRegistrations,
        averageWaitTime: averageWaitTime[0]?.avgWaitTime 
          ? Math.round(averageWaitTime[0].avgWaitTime) 
          : 0,
      },
      triageLevels,
      statuses,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return errorResponse('Failed to fetch statistics', 500);
  }
}
