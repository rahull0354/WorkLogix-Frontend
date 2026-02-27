"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Infinity, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { ButtonLoader } from "@/components/ButtonLoader";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      await login(formData);
    } catch (error) {
      
    }
  };

  return (
    <div className="split-login-container">
      {/* Left Panel - Animated Graphics */}
      <div className="left-panel hidden md:flex">
        {/* Geometric Shapes */}
        <div className="geo-shape shape-1"></div>
        <div className="geo-shape shape-2"></div>
        <div className="geo-shape shape-3"></div>
        <div className="geo-shape shape-4"></div>
        <div className="geo-shape shape-5"></div>
        <div className="floating-square"></div>
        <div className="floating-square-2"></div>
        <div className="geo-triangle"></div>
        <div className="geo-plus"></div>

        {/* Content */}
        <div className="left-content">
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-primary to-secondary rounded-2xl blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative w-24 h-24 mx-auto bg-linear-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                {/* Animated infinity symbol */}
                <div className="relative">
                  <Infinity
                    className="w-14 h-14 text-white animate-pulse"
                    strokeWidth={2}
                  />
                  <Lock
                    className="w-8 h-8 text-white/80 absolute -bottom-1 -right-2"
                    strokeWidth={3}
                  />
                </div>
                {/* Sparkle effect */}
                <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
                <div className="absolute bottom-3 left-3 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          <h2>WorkLogix</h2>
          <p>
            Track time, manage projects, and boost your productivity with our
            elegant time tracking solution.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="right-panel">
        <div className="w-full max-w-md">
          {/* Mobile Logo (only shown on small screens) */}
          <div className="md:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold auth-title">WorkLogix</h1>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block mb-8">
            <h1 className="text-3xl font-bold mb-2 auth-title">Welcome Back</h1>
            <p className="auth-description">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <div className="card bg-base-100/80 backdrop-blur-xl shadow-xl border border-base-300">
            <div className="card-body p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium auth-label">
                      Email
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <Mail className="w-5 h-5" style={{ color: 'var(--bc)' }} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input input-bordered w-full pl-10 auth-input ${
                        errors.email ? "input-error" : ""
                      }`}
                      disabled={authLoading}
                    />
                  </div>
                  {errors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.email}
                      </span>
                    </label>
                  )}
                </div>

                {/* Password Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium auth-label">
                      Password
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <Lock className="w-5 h-5" style={{ color: 'var(--bc)' }} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input input-bordered w-full pl-10 pr-10 auth-input ${
                        errors.password ? "input-error" : ""
                      }`}
                      disabled={authLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" style={{ color: 'var(--bc)' }} />
                      ) : (
                        <Eye className="w-5 h-5" style={{ color: 'var(--bc)' }} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.password}
                      </span>
                    </label>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="cursor-pointer label gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                    />
                    <span className="label-text auth-label">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="link link-primary text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`btn btn-primary w-full gap-2 relative overflow-hidden ${
                    authLoading ? "btn-shimmer btn-spin-gradient" : ""
                  }`}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <>
                      <div className="flex items-center justify-center w-full">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                        <span className="ml-3">Signing in...</span>
                      </div>
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="divider label-text auth-label">OR</div>

              {/* Register Link */}
              <p className="text-center text-sm label-text auth-label">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="link link-primary font-medium"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="auth-link link hover:link-hover text-sm">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
