import { db } from './src/index';
import { appointments } from './src/schema/consultations';
import { sessionNotes, prescriptions, doctorProfiles } from './src/schema/doctor';
import { patientProfiles } from './src/schema/medical';
import { users } from './src/schema/auth';

async function seedDummySession() {
  console.log('Seeding dummy session...');

  const doctor = await db.query.doctorProfiles.findFirst();
  const patient = await db.query.patientProfiles.findFirst();

  if (!doctor || !patient) {
    console.error('Missing doctor or patient profiles.');
    return;
  }

  const doctorUser = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, doctor.userId) });
  const patientUser = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, patient.userId) });

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);

  const [appointment] = await db.insert(appointments).values({
    doctorId: doctor.id,
    patientId: patient.id,
    patientName: patientUser?.name || 'Dummy Patient',
    appointmentDate: pastDate,
    consultationType: 'Video',
    reason: 'Follow-up for chronic migraines',
    consultationReason: 'Follow-up for chronic migraines',
    status: 'completed',
    appointmentStatus: 'Completed',
    doctorNotes: 'Patient responded well to initial treatment.',
    startAt: new Date(pastDate.getTime() - 3600000), // 1 hour before
    endAt: pastDate,
  }).returning();

  await db.insert(sessionNotes).values({
    appointmentId: appointment.id,
    doctorId: doctor.id,
    patientId: patient.id,
    patientName: patientUser?.name || 'Dummy Patient',
    sessionSummary: 'Patient reports 50% reduction in headache frequency. Sleep has improved. Will continue current medication regimen with slight adjustment to dosage.',
    clinicalImpressions: 'Improving migraine symptoms. Good adherence to medication.',
    diagnosis: 'Chronic Migraine without aura (G43.009)',
    treatmentPlan: '1. Continue Sumatriptan for acute attacks.\n2. Increase Topiramate to 50mg daily.\n3. Follow up in 3 months.',
  });

  await db.insert(prescriptions).values({
    appointmentId: appointment.id,
    doctorId: doctor.id,
    patientId: patient.id,
    patientName: patientUser?.name || 'Dummy Patient',
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
    notes: 'Please ensure adequate hydration while taking Topiramate. Do not exceed 200mg of Sumatriptan in a 24-hour period.',
  });

  console.log('Successfully seeded dummy session! Appointment ID:', appointment.id);
  process.exit(0);
}

seedDummySession().catch(console.error);
