"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset link sent to your email.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-2 text-center">Reset Password</h1>
        <p className="text-muted-foreground text-sm text-center mb-6">Enter your email to receive a reset link.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-2 border rounded-md bg-background"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Remember your password? <Link href="/sign-in" className="text-primary hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
