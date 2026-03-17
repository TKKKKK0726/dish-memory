import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type View = "sign-in" | "sign-up" | "forgot-password";

export default function Auth() {
  const [view, setView] = useState<View>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      if (rememberMe) {
        localStorage.setItem("dishlog-remember", "true");
      } else {
        localStorage.removeItem("dishlog-remember");
      }
      sessionStorage.setItem("dishlog-active", "true");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) toast.error(error.message);
    else toast.success("Check your email to confirm your account!");
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DishLog</h1>
            <p className="text-sm text-muted-foreground">Your personal restaurant memory</p>
          </div>
        </div>

        {view === "forgot-password" ? (
          <form
            onSubmit={handleForgotPassword}
            className="rounded-lg border bg-card p-6 space-y-4"
          >
            <div>
              <h2 className="font-semibold">Reset Password</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                We'll send a reset link to your email.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Email"}
            </Button>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:underline w-full text-center"
              onClick={() => setView("sign-in")}
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <div className="rounded-lg border bg-card p-6 space-y-4">
            {/* Tab toggle */}
            <div className="flex rounded-md border p-1 gap-1">
              <button
                type="button"
                className={`flex-1 rounded py-1.5 text-sm font-medium transition-colors ${
                  view === "sign-in"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setView("sign-in")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`flex-1 rounded py-1.5 text-sm font-medium transition-colors ${
                  view === "sign-up"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setView("sign-up")}
              >
                Sign Up
              </button>
            </div>

            <form
              onSubmit={view === "sign-in" ? handleSignIn : handleSignUp}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {view === "sign-in" && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? view === "sign-in"
                    ? "Signing in..."
                    : "Creating account..."
                  : view === "sign-in"
                  ? "Sign In"
                  : "Create Account"}
              </Button>
            </form>

            {view === "sign-in" && (
              <button
                type="button"
                className="text-sm text-muted-foreground hover:underline w-full text-center"
                onClick={() => setView("forgot-password")}
              >
                Forgot your password?
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
