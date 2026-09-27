"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { HeartPulse, Stethoscope, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "patient" | "doctor" | "researcher";

const ROLES: { id: Role; title: string; description: string; icon: React.ReactNode }[] = [
  { id: "patient", title: "Patient", description: "Access records and connect with doctors.", icon: <HeartPulse className="w-6 h-6" /> },
  { id: "doctor", title: "Doctor", description: "Manage patients and appointments.", icon: <Stethoscope className="w-6 h-6" /> },
  { id: "researcher", title: "Researcher", description: "Collaborate on clinical studies.", icon: <Cpu className="w-6 h-6" /> },
];

export function SignUpFlow() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    
    setLoading(true);
    try {
      const { data, error } = await signUp.email({
        email,
        password,
        name,
        // @ts-ignore - Better Auth doesn't type this by default unless configured
        role,
      });

      if (error) {
        toast.error(error.message || "Registration failed");
      } else {
        toast.success("Account created successfully!");
        router.push(`/${role}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-center mb-4">Select your role</h2>
        <div className="grid gap-4">
          {ROLES.map((r) => (
            <div
              key={r.id}
              onClick={() => setRole(r.id)}
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-all flex items-center gap-4",
                role === r.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50 hover:bg-muted"
              )}
            >
              <div className="p-2 rounded-full bg-background border text-primary">
                {r.icon}
              </div>
              <div>
                <h3 className="font-semibold">{r.title}</h3>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setStep(2)}
          disabled={!role}
          className="w-full mt-6 bg-primary text-primary-foreground py-2 rounded-md font-medium disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="w-full p-2 border rounded-md bg-background"
          required 
        />
      </div>
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
        <label className="block text-sm font-medium mb-1">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-2 border rounded-md bg-background"
          required 
          minLength={8}
        />
      </div>
      
      <div className="flex gap-2 pt-2">
        <button 
          type="button" 
          onClick={() => setStep(1)} 
          className="px-4 py-2 border rounded-md hover:bg-muted"
        >
          Back
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="flex-1 bg-primary text-primary-foreground py-2 rounded-md font-medium disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </div>
    </form>
  );
}
