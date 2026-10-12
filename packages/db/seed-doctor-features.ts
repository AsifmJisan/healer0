import { db } from './src/index';
import { crisisEvents } from './src/schema/emergency';
import { moodTracking, journals } from './src/schema/wellness';
import { assessments, assessmentResults } from './src/schema/assessments';
import { patientDoctorVisitSummary } from './src/schema/consultations';
import { doctorProfiles, patientProfiles } from './src/schema/medical';
import { users } from './src/schema/auth';
import { eq } from 'drizzle-orm';

async function seedDoctorFeatures() {
  console.log('Seeding doctor ERD features data...');

  const doctor = await db.query.doctorProfiles.findFirst();
  const patient = await db.query.patientProfiles.findFirst();

  if (!doctor || !patient) {
    console.error('Missing doctor or patient profile in DB.');
    return;
  }

  const doctorUser = await db.query.users.findFirst({ where: eq(users.id, doctor.userId) });
  const patientUser = await db.query.users.findFirst({ where: eq(users.id, patient.userId) });

  if (!patientUser) {
    console.error('Patient user not found.');
    return;
  }

  // 1. Visit Summary
  const existingSummary = await db.query.patientDoctorVisitSummary.findFirst({
    where: eq(patientDoctorVisitSummary.doctorId, doctor.id),
  });

  if (!existingSummary) {
    await db.insert(patientDoctorVisitSummary).values({
      patientId: patient.id,
      patientName: patientUser.name,
      doctorId: doctor.id,
      doctorName: doctorUser?.name || 'Dr. Asif Mahmud',
      totalVisits: 5,
      firstVisitDate: new Date('2026-06-15'),
      lastVisitDate: new Date('2026-10-03'),
      totalConsultationMinutes: 240,
    });
    console.log('Seeded patientDoctorVisitSummary');
  }

  // 2. Crisis Event
  const existingCrisis = await db.query.crisisEvents.findFirst({
    where: eq(crisisEvents.userId, patientUser.id),
  });

  if (!existingCrisis) {
    await db.insert(crisisEvents).values({
      userId: patientUser.id,
      riskLevel: 'High',
      detectedIssue: 'Severe emotional distress & overwhelming anxiety',
      aiResponse: 'Triggered immediate grounding protocol and dispatched emergency alert notification to assigned physician.',
      emergencyContacted: true,
      psychologistConnected: false,
    });
    console.log('Seeded crisisEvents');
  }

  // 3. Mood Tracking Logs
  const existingMood = await db.query.moodTracking.findFirst({
    where: eq(moodTracking.userId, patientUser.id),
  });

  if (!existingMood) {
    const dates = [0, 2, 4, 6, 8];
    for (const d of dates) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      await db.insert(moodTracking).values({
        userId: patientUser.id,
        moodType: d % 2 === 0 ? 'Stressed' : 'Normal',
        stressLevel: 7 - (d % 3),
        anxietyLevel: 6 - (d % 2),
        sleepQuality: 5 + (d % 3),
        notes: d % 2 === 0 ? 'Work pressure increased heading into deadlines.' : 'Slept relatively better after mindfulness session.',
        recordedDate: date,
      });
    }
    console.log('Seeded moodTracking entries');
  }

  // 4. Journal Entries
  const existingJournal = await db.query.journals.findFirst({
    where: eq(journals.userId, patientUser.id),
  });

  if (!existingJournal) {
    await db.insert(journals).values({
      userId: patientUser.id,
      title: 'Reflections on Weekly Stress Management',
      content: 'Felt quite overwhelmed earlier this week due to tight project deadlines. Practiced deep breathing exercises recommended during my last consultation. Taking short walks during break time helped lower my heart rate.',
      mood: 'Worried',
      aiSentiment: 'Low Mood',
      aiSummary: 'Patient notes high work stress but successfully utilized coping mechanisms.',
    });
    console.log('Seeded journal entry');
  }

  // 5. Clinical Assessments & Results
  let depressionAssessment = await db.query.assessments.findFirst({
    where: eq(assessments.category, 'Depression'),
  });

  if (!depressionAssessment) {
    [depressionAssessment] = await db.insert(assessments).values({
      title: 'Patient Health Questionnaire (PHQ-9)',
      category: 'Depression',
      description: 'Standardized 9-question clinical screening tool for depression severity.',
      totalQuestions: 9,
    }).returning();
  }

  let anxietyAssessment = await db.query.assessments.findFirst({
    where: eq(assessments.category, 'Anxiety'),
  });

  if (!anxietyAssessment) {
    [anxietyAssessment] = await db.insert(assessments).values({
      title: 'Generalized Anxiety Disorder Scale (GAD-7)',
      category: 'Anxiety',
      description: 'Standardized 7-question clinical screening tool for generalized anxiety.',
      totalQuestions: 7,
    }).returning();
  }

  const existingResult = await db.query.assessmentResults.findFirst({
    where: eq(assessmentResults.userId, patientUser.id),
  });

  if (!existingResult && depressionAssessment && anxietyAssessment) {
    await db.insert(assessmentResults).values({
      userId: patientUser.id,
      assessmentId: depressionAssessment.id,
      score: 12,
      severityLevel: 'Medium',
      aiRecommendation: 'Moderate depression score. Recommend ongoing cognitive behavioral therapy and routine follow-up.',
      completedDate: new Date('2026-09-28'),
    });

    await db.insert(assessmentResults).values({
      userId: patientUser.id,
      assessmentId: anxietyAssessment.id,
      score: 15,
      severityLevel: 'High',
      aiRecommendation: 'High anxiety score detected. Priority consultation advised.',
      completedDate: new Date('2026-10-02'),
    });

    console.log('Seeded assessmentResults');
  }

  console.log('Successfully completed seeding doctor ERD features data!');
  process.exit(0);
}

seedDoctorFeatures().catch(console.error);
