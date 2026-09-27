"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Invalid credentials");
      } else {
        toast.success("Signed in successfully!");
        // Middleware will handle redirect based on role
        router.push("/"); 
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <div>
        <div className="flex justify-between mb-1 items-center">
          <label className="block text-sm font-medium">Password</label>
          <Link href="/forgot-password" className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-2 border rounded-md bg-background"
          required 
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium disabled:opacity-50 mt-2"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      
      <div className="text-center mt-4 text-sm text-muted-foreground">
        Don't have an account? <Link href="/sign-up" className="text-primary hover:underline">Sign up</Link>
      </div>
    </form>
  );
}
