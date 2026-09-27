import { SignInForm } from "@/components/features/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border rounded-lg shadow-sm p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground text-sm">Sign in to your Healer account.</p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
