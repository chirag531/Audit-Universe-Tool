import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { login as loginApi } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card, CardContent } from "@/components/ui/Card";

export function LoginPage() {
  const [username, setUsername] = useState(() => localStorage.getItem("lastUsername") || "");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(Boolean(localStorage.getItem("lastUsername")));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();
  const auth = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await loginApi({ username, password });
      auth.login(data, { persistUsername: remember, username });
      toast.success("Signed in successfully");
      nav("/");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(msg || "Invalid credentials");
      toast.error(msg || "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-slate-900 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="relative w-full max-w-md">
        <Card className="shadow-card-md">
          <CardContent className="p-8">
            <div className="mb-6 flex flex-col items-center gap-2 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
                <Shield className="h-7 w-7" aria-hidden />
              </span>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Audit Universe</h1>
                <p className="text-sm text-slate-500">Sign in to manage your audit portfolio</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={submit}>
              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                  {error}
                </p>
              ) : null}
              <Input label="Username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border border-slate-300 bg-white py-2 pl-3 pr-11 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/25"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800 focus-visible:focus-ring rounded-r-md"
                    aria-label={show ? "Hide password" : "Show password"}
                    onClick={() => setShow((v) => !v)}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Checkbox
                label="Remember me"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <Button type="submit" className="w-full" loading={submitting}>
                Sign in
              </Button>
              <p className="text-center text-xs text-slate-500">Demo: admin / admin123</p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
