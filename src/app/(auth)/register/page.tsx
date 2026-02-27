"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Eye, EyeOff, Infinity, Lock, Mail, UserIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function register() {
  const router = useRouter();
  const { register, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    confirmPassword: "",
    password: "",
    fullname: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullname?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.username) {
      newErrors.username = "Username is required.";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    }

    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match !";
    }

    if (!formData.fullname) {
      newErrors.fullname = "Full Name is required.";
    } else if (formData.fullname.length < 2) {
      newErrors.fullname = "Full name must be at least 2 characters";
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
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullname: formData.fullname,
      });
    } catch (error) {
      console.error("Registration Failed:", error);
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
                  <UserIcon
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
          <h2>Join WorkLogix</h2>
          <p>
            Create your account and start tracking time efficiently. Join
            thousands of productive professionals today.
          </p>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="right-panel">
        <div className="w-full max-w-md">
          {/* Mobile Logo (only shown on small screens) */}
          <div className="md:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold auth-title">Create Account</h1>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block mb-8">
            <h1 className="text-3xl font-bold mb-2 auth-title">
              Create Account
            </h1>
            <p className="auth-description">
              Sign up to get started with WorkLogix
            </p>
          </div>

          {/* Register Form */}
          <div className="card bg-base-100/80 backdrop-blur-xl shadow-xl border border-base-300">
            <div className="card-body p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium auth-label">
                      Full Name
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <UserIcon className="w-5 h-5" style={{ color: 'var(--bc)' }} />
                    </span>
                    <input
                      type="text"
                      name="fullname"
                      placeholder="John Doe"
                      value={formData.fullname}
                      onChange={handleChange}
                      className={`input input-bordered w-full pl-10 auth-input ${
                        errors.fullname ? "input-error" : ""
                      }`}
                      disabled={authLoading}
                    />
                  </div>
                  {errors.fullname && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.fullname}
                      </span>
                    </label>
                  )}
                </div>

                {/* Username Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium auth-label">
                      Username
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <UserIcon className="w-5 h-5" style={{ color: 'var(--bc)' }} />
                    </span>
                    <input
                      type="text"
                      name="username"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleChange}
                      className={`input input-bordered w-full pl-10 auth-input ${
                        errors.username ? "input-error" : ""
                      }`}
                      disabled={authLoading}
                    />
                  </div>
                  {errors.username && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.username}
                      </span>
                    </label>
                  )}
                </div>

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
                      placeholder="•••••••••"
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

                {/* Confirm Password Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium auth-label">
                      Confirm Password
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <Lock className="w-5 h-5" style={{ color: 'var(--bc)' }} />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="•••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input input-bordered w-full pl-10 pr-10 auth-input ${
                        errors.confirmPassword ? "input-error" : ""
                      }`}
                      disabled={authLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" style={{ color: 'var(--bc)' }} />
                      ) : (
                        <Eye className="w-5 h-5" style={{ color: 'var(--bc)' }} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.confirmPassword}
                      </span>
                    </label>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="form-control">
                  <div className="flex gap-3 items-start cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary mt-0.5 shrink-0"
                    />
                    <span className="label-text auth-label text-sm leading-relaxed flex-1">
                      I agree to the{" "}
                      <Link href="/terms" className="link link-primary">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="link link-primary">
                        Privacy Policy
                      </Link>
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`btn btn-primary w-full gap-2 relative overflow-hidden${
                    authLoading ? " btn-shimmer btn-spin-gradient" : ""
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
                        <span className="ml-3">Creating Account...</span>
                      </div>
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="divider label-text auth-label">OR</div>

              {/* Login Link */}
              <p className="text-center text-sm label-text auth-label">
                Already have an account?{" "}
                <Link href="/login" className="link link-primary font-medium">
                  Sign in here
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
