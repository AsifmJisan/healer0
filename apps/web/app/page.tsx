import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <header className="absolute top-0 w-full p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Healer</h1>
        <Link href="/sign-in" className="px-4 py-2 border rounded hover:bg-muted transition">
          Sign In
        </Link>
      </header>
      <main className="flex flex-col items-center text-center space-y-8 px-4">
        <h2 className="text-5xl font-extrabold tracking-tight">Healthcare, Connected.</h2>
        <p className="text-xl text-muted-foreground max-w-2xl">
          The all-in-one platform for patients, doctors, and researchers to collaborate, share, and improve healthcare outcomes.
        </p>
        <Link href="/sign-up" className="px-8 py-3 bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90 transition font-medium">
          Get Started
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-8 border-t w-full max-w-4xl">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">For Patients</h3>
            <p className="text-muted-foreground">Access your medical records, book appointments, and connect with your doctors securely.</p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">For Doctors</h3>
            <p className="text-muted-foreground">Manage your patients, streamline appointments, and review medical history effortlessly.</p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">For Researchers</h3>
            <p className="text-muted-foreground">Collaborate on studies, access anonymized data, and publish your findings.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
