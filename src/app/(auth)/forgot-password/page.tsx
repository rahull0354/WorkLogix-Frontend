"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, Infinity, Lock, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword(email);

      if (response.success) {
        setEmailSent(true);
        toast.success(response.message || "Password reset email sent!");
      } else {
        toast.error(response.message || "Failed to send reset email");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send reset email. Please try again.",
      );
    } finally {
      setLoading(false);
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
                {/* Animated key icon */}
                <div className="relative">
                  <Lock
                    className="w-14 h-14 text-white animate-pulse"
                    strokeWidth={2}
                  />
                  <Mail
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
            Reset your password securely and get back to tracking your time in no
            time.
          </p>
        </div>
      </div>

      {/* Right Panel - Forgot Password Form */}
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
            <h1 className="text-3xl font-bold mb-2 auth-title">
              Forgot Password?
            </h1>
            <p className="auth-description">
              No worries! Enter your email and we'll send you a reset link.
            </p>
          </div>

          {/* Forgot Password Form */}
          <div className="card bg-base-100/80 backdrop-blur-xl shadow-xl border border-base-300">
            <div className="card-body p-8">
              {!emailSent ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium auth-label">
                        Email Address
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                        <Mail
                          className="w-5 h-5"
                          style={{ color: "var(--bc)" }}
                        />
                      </span>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input input-bordered w-full pl-10 auth-input"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={`btn btn-primary w-full gap-2 relative overflow-hidden ${
                      loading ? "btn-shimmer btn-spin-gradient" : ""
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="flex items-center justify-center w-full">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                          </div>
                          <span className="ml-3">Sending...</span>
                        </div>
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-xl font-bold auth-title">Email Sent!</h3>
                  <p className="auth-description">
                    We've sent a password reset link to{" "}
                    <span className="font-semibold">{email}</span>
                  </p>
                  <p className="text-sm auth-label">
                    Check your email and click the link to reset your password.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setEmailSent(false)}
                      className="btn btn-outline btn-sm gap-2 dark:bg-white/10 dark:border-white/20 dark:hover:bg-white/20 dark:text-white"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Try Different Email
                    </button>
                  </div>
                </div>
              )}

              <div className="divider label-text auth-label"></div>

              {/* Back to Login Link */}
              <p className="text-center text-sm label-text auth-label">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="link link-primary font-medium"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="auth-link link hover:link-hover text-sm"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
