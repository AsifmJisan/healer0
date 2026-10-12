import { 
  db, doctorProfiles, patientRecords, patientProfiles, users, 
  patientDoctorVisitSummary, moodTracking, journals, assessmentResults, 
  assessments, crisisEvents, eq, desc 
} from '@healer/db';

export async function getDoctorPatientRecordsService(userId: string, riskFilter?: string) {
  const doctor = await db.query.doctorProfiles.findFirst({
    where: eq(doctorProfiles.userId, userId),
  });
  if (!doctor) return [];

  const records = await db.query.patientRecords.findMany({
    where: eq(patientRecords.doctorId, doctor.id),
    orderBy: [desc(patientRecords.updatedAt)],
  });

  const enrichedRecords = await Promise.all(
    records.map(async (rec) => {
      const profile = await db.query.patientProfiles.findFirst({
        where: eq(patientProfiles.id, rec.patientId),
      });
      let user = null;
      if (profile) {
        user = await db.query.users.findFirst({
          where: eq(users.id, profile.userId),
        });
      }
      return {
        ...rec,
        patient: {
          id: profile?.id,
          userId: profile?.userId,
          user: user
            ? { id: user.id, name: user.name, email: user.email, image: user.image }
            : { name: rec.patientName, email: '' },
        },
      };
    })
  );

  if (riskFilter && riskFilter !== 'all') {
    return enrichedRecords.filter(r => r.riskLevel.toLowerCase() === riskFilter.toLowerCase());
  }

  return enrichedRecords;
}

export async function getPatientDetailService(userId: string, recordId: string) {
  const doctor = await db.query.doctorProfiles.findFirst({
    where: eq(doctorProfiles.userId, userId),
  });
  if (!doctor) throw new Error('Doctor profile not found');

  const record = await db.query.patientRecords.findFirst({
    where: eq(patientRecords.id, recordId),
  });
  if (!record) throw new Error('Patient record not found');

  const profile = await db.query.patientProfiles.findFirst({
    where: eq(patientProfiles.id, record.patientId),
  });

  const patientUser = profile
    ? await db.query.users.findFirst({ where: eq(users.id, profile.userId) })
    : null;

  const patientUserId = profile?.userId;

  // 1. Visit Summary
  const visitSummaryRaw = await db.query.patientDoctorVisitSummary.findFirst({
    where: eq(patientDoctorVisitSummary.doctorId, doctor.id),
  });

  const visitSummary = visitSummaryRaw || {
    totalVisits: record.previousSessions || 1,
    firstVisitDate: record.createdAt,
    lastVisitDate: record.updatedAt,
    totalConsultationMinutes: (record.previousSessions || 1) * 45,
  };

  // 2. Mood Tracking Logs (last 30 days)
  const moodLogs = patientUserId
    ? await db.query.moodTracking.findMany({
        where: eq(moodTracking.userId, patientUserId),
        orderBy: [desc(moodTracking.recordedDate)],
      })
    : [];

  // 3. Journals
  const journalEntries = patientUserId
    ? await db.query.journals.findMany({
        where: eq(journals.userId, patientUserId),
        orderBy: [desc(journals.entryDate)],
      })
    : [];

  // 4. Clinical Assessments
  const rawAssessments = patientUserId
    ? await db.query.assessmentResults.findMany({
        where: eq(assessmentResults.userId, patientUserId),
        orderBy: [desc(assessmentResults.completedDate)],
      })
    : [];

  const assessmentHistory = await Promise.all(
    rawAssessments.map(async (res) => {
      const parentAssessment = await db.query.assessments.findFirst({
        where: eq(assessments.id, res.assessmentId),
      });
      return {
        ...res,
        title: parentAssessment?.title || 'Clinical Assessment',
        category: parentAssessment?.category || 'General',
        description: parentAssessment?.description || '',
      };
    })
  );

  // 5. Crisis Events
  const crisisHistory = patientUserId
    ? await db.query.crisisEvents.findMany({
        where: eq(crisisEvents.userId, patientUserId),
        orderBy: [desc(crisisEvents.createdAt)],
      })
    : [];

  return {
    record: {
      ...record,
      patient: {
        id: profile?.id,
        userId: patientUserId,
        user: patientUser
          ? { id: patientUser.id, name: patientUser.name, email: patientUser.email, image: patientUser.image }
          : { name: record.patientName, email: '' },
      },
    },
    visitSummary,
    moodLogs,
    journals: journalEntries,
    assessments: assessmentHistory,
    crisisEvents: crisisHistory,
  };
}

export async function updatePatientRiskLevelService(userId: string, recordId: string, riskLevel: string, notes?: string) {
  const doctor = await db.query.doctorProfiles.findFirst({
    where: eq(doctorProfiles.userId, userId),
  });
  if (!doctor) throw new Error('Doctor profile not found');

  const [updated] = await db.update(patientRecords)
    .set({ 
      riskLevel,
      ...(notes && { notes }),
    })
    .where(eq(patientRecords.id, recordId))
    .returning();

  return updated;
}

export const PatientsService = {
  async list() {
    return db.query.patientProfiles.findMany();
  },
};
