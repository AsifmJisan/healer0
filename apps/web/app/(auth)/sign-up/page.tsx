import { SignUpFlow } from "@/components/features/auth/sign-up-flow";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border rounded-lg shadow-sm p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground text-sm">Join Healer to get started.</p>
        </div>
        <SignUpFlow />
      </div>
    </div>
  );
}
