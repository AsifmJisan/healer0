import { db } from './src/index';
import { doctorProfiles, patientProfiles } from './src/schema/medical';
import { patientRecords, sessionNotes, prescriptions } from './src/schema/doctor';
import { appointments, patientDoctorVisitSummary } from './src/schema/consultations';
import { counselingSessions } from './src/schema/counseling';
import { crisisEvents } from './src/schema/emergency';
import { moodTracking, journals } from './src/schema/wellness';
import { assessments, assessmentResults } from './src/schema/assessments';
import { users } from './src/schema/auth';
import { eq } from 'drizzle-orm';

async function seedAllDoctors() {
  console.log('Seeding mock data for all doctor profiles in DB...');

  const doctors = await db.query.doctorProfiles.findMany();
  const patients = await db.query.patientProfiles.findMany();

  if (doctors.length === 0 || patients.length === 0) {
    console.error('No doctors or patients found in DB.');
    return;
  }

  const defaultPatient = patients[0];
  const patientUser = await db.query.users.findFirst({ where: eq(users.id, defaultPatient.userId) });
  const pName = patientUser?.name || 'Jane Doe';

  for (const doc of doctors) {
    const docUser = await db.query.users.findFirst({ where: eq(users.id, doc.userId) });
    console.log(`Processing doctor: ${docUser?.name || doc.id} (${docUser?.email})`);

    // 1. Patient Records
    const existingRecords = await db.query.patientRecords.findMany({
      where: eq(patientRecords.doctorId, doc.id),
    });

    if (existingRecords.length === 0) {
      await db.insert(patientRecords).values([
        {
          doctorId: doc.id,
          patientId: defaultPatient.id,
          patientName: pName,
          condition: 'Generalized Anxiety & Sleep Disturbance',
          medicalHistory: 'History of work stress, mild hypertension. Responding well to CBT.',
          previousSessions: 5,
          riskLevel: 'Moderate',
          allergies: 'Penicillin',
          notes: 'Patient reports sleep improvement after sleep hygiene routine.',
        },
        {
          doctorId: doc.id,
          patientId: defaultPatient.id,
          patientName: 'David Miller',
          condition: 'Work-Related Burnout & Chronic Insomnia',
          medicalHistory: 'Managed with weekly cognitive sessions and light lifestyle routine.',
          previousSessions: 4,
          riskLevel: 'Low',
          allergies: 'None',
          notes: 'Patient shows consistent progress during scheduled counseling sessions.',
        },
        {
          doctorId: doc.id,
          patientId: defaultPatient.id,
          patientName: 'Sarah Jenkins',
          condition: 'Post-Traumatic Stress Symptoms',
          medicalHistory: 'Undergoing exposure therapy and mood monitoring.',
          previousSessions: 8,
          riskLevel: 'High',
          allergies: 'Sulfa drugs',
          notes: 'Flagged for high anxiety. Weekly sessions active.',
        }
      ]);
      console.log(`  Seeded patientRecords for doctor ${doc.id}`);
    }

    // 2. Appointments (Past, Today, Future)
    const existingAppts = await db.query.appointments.findMany({
      where: eq(appointments.doctorId, doc.id),
    });

    if (existingAppts.length === 0) {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      const todayDate = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Today in 2 hours
      const futureDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days in future

      // Past session
      const [pastAppt] = await db.insert(appointments).values({
        doctorId: doc.id,
        patientId: defaultPatient.id,
        patientName: pName,
        appointmentDate: pastDate,
        consultationType: 'Video',
        reason: 'Follow-up for chronic migraines & stress',
        consultationReason: 'Follow-up for chronic migraines & stress',
        status: 'completed',
        appointmentStatus: 'Completed',
        doctorNotes: 'Patient responded well to initial treatment.',
        startAt: new Date(pastDate.getTime() - 3600000),
        endAt: pastDate,
      }).returning();

      // Session note for past session
      await db.insert(sessionNotes).values({
        appointmentId: pastAppt.id,
        doctorId: doc.id,
        patientId: defaultPatient.id,
        patientName: pName,
        sessionSummary: 'Patient reports 50% reduction in headache frequency. Sleep has improved. Will continue current medication regimen.',
        clinicalImpressions: 'Improving migraine symptoms. Good adherence to medication.',
        diagnosis: 'Chronic Migraine without aura (G43.009)',
        treatmentPlan: '1. Continue Sumatriptan for acute attacks.\n2. Increase Topiramate to 50mg daily.\n3. Follow up in 3 months.',
      });

      // Prescription for past session
      await db.insert(prescriptions).values({
        appointmentId: pastAppt.id,
        doctorId: doc.id,
        patientId: defaultPatient.id,
        patientName: pName,
        title: 'Migraine Maintenance & Acute Rx',
        medications: [
          {
            medicationName: 'Sumatriptan',
            dosage: '50mg',
            frequency: 'As needed at onset of headache',
            duration: '30 tablets',
          },
          {
            medicationName: 'Topiramate',
            dosage: '50mg',
            frequency: 'Once daily at bedtime',
            duration: '90 days',
          }
        ],
        notes: 'Ensure adequate hydration while taking Topiramate.',
      });

      // Today appt
      await db.insert(appointments).values({
        doctorId: doc.id,
        patientId: defaultPatient.id,
        patientName: 'David Miller',
        appointmentDate: todayDate,
        consultationType: 'In-person',
        reason: 'Routine follow-up session',
        consultationReason: 'Routine follow-up session',
        status: 'scheduled',
        appointmentStatus: 'Scheduled',
      });

      // Future appt
      await db.insert(appointments).values({
        doctorId: doc.id,
        patientId: defaultPatient.id,
        patientName: 'Sarah Jenkins',
        appointmentDate: futureDate,
        consultationType: 'Video',
        reason: 'Monthly CBT & Anxiety Review',
        consultationReason: 'Monthly CBT & Anxiety Review',
        status: 'scheduled',
        appointmentStatus: 'Scheduled',
      });

      console.log(`  Seeded appointments (past, today, future), session notes, and prescriptions for doctor ${doc.id}`);
    }

    // 3. Counseling Sessions
    const existingCounseling = await db.query.counselingSessions.findMany({
      where: eq(counselingSessions.doctorId, doc.id),
    });

    if (existingCounseling.length === 0) {
      await db.insert(counselingSessions).values([
        {
          doctorId: doc.id,
          patientId: defaultPatient.id,
          patientName: pName,
          sessionType: 'Individual Therapy',
          startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'completed',
          notes: 'Focused on stress triggers at work.',
        },
        {
          doctorId: doc.id,
          patientId: defaultPatient.id,
          patientName: 'Sarah Jenkins',
          sessionType: 'CBT Session',
          startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          status: 'scheduled',
          notes: 'Scheduled upcoming CBT evaluation.',
        }
      ]);
      console.log(`  Seeded counseling sessions for doctor ${doc.id}`);
    }

    // 4. Visit Summary
    const existingSummary = await db.query.patientDoctorVisitSummary.findFirst({
      where: eq(patientDoctorVisitSummary.doctorId, doc.id),
    });

    if (!existingSummary) {
      await db.insert(patientDoctorVisitSummary).values({
        patientId: defaultPatient.id,
        patientName: pName,
        doctorId: doc.id,
        doctorName: docUser?.name || 'Dr. Medical Professional',
        totalVisits: 5,
        firstVisitDate: new Date('2026-06-15'),
        lastVisitDate: new Date('2026-10-03'),
        totalConsultationMinutes: 240,
      });
      console.log(`  Seeded visit summary for doctor ${doc.id}`);
    }
  }

  console.log('All doctor profiles seeded successfully!');
  process.exit(0);
}

seedAllDoctors().catch(console.error);
