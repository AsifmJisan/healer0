import { redirect } from 'next/navigation';

export default function PatientDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Patient Overview</h1>
      <p className="text-muted-foreground">Welcome to your dashboard.</p>
    </div>
  );
}
