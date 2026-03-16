"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowRight, Infinity, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { resetPassword } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const [token, setToken] = useState(tokenFromUrl || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirm?: string;
  }>({});

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link. Please request a new password reset.");
      router.push("/forgot-password");
    }
  }, [token, router]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.password = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirm = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirm = "Passwords do not match";
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
      setLoading(true);
      const response = await resetPassword(token, newPassword);

      if (response.success) {
        setResetSuccess(true);
        toast.success(response.message || "Password reset successfully!");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        toast.error(response.message || "Failed to reset password");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reset password. Please try again.",
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
                {/* Animated lock icon */}
                <div className="relative">
                  <Lock
                    className="w-14 h-14 text-white animate-pulse"
                    strokeWidth={2}
                  />
                </div>
                {/* Sparkle effect */}
                <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
                <div className="absolute bottom-3 left-3 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          <h2>WorkLogix</h2>
          <p>Set a new secure password for your account.</p>
        </div>
      </div>

      {/* Right Panel - Reset Password Form */}
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
            <h1 className="text-3xl font-bold mb-2 auth-title">Reset Password</h1>
            <p className="auth-description">
              Enter your new password below
            </p>
          </div>

          {/* Reset Password Form */}
          <div className="card bg-base-100/80 backdrop-blur-xl shadow-xl border border-base-300">
            <div className="card-body p-8">
              {!resetSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New Password Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium auth-label">
                        New Password
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                        <Lock
                          className="w-5 h-5"
                          style={{ color: "var(--bc)" }}
                        />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (errors.password) {
                            setErrors({ ...errors, password: undefined });
                          }
                        }}
                        className={`input input-bordered w-full pl-10 pr-10 auth-input ${
                          errors.password ? "input-error" : ""
                        }`}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff
                            className="w-5 h-5"
                            style={{ color: "var(--bc)" }}
                          />
                        ) : (
                          <Eye
                            className="w-5 h-5"
                            style={{ color: "var(--bc)" }}
                          />
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
                        <Lock
                          className="w-5 h-5"
                          style={{ color: "var(--bc)" }}
                        />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirm) {
                            setErrors({ ...errors, confirm: undefined });
                          }
                        }}
                        className={`input input-bordered w-full pl-10 pr-10 auth-input ${
                          errors.confirm ? "input-error" : ""
                        }`}
                        disabled={loading}
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
                          <EyeOff
                            className="w-5 h-5"
                            style={{ color: "var(--bc)" }}
                          />
                        ) : (
                          <Eye
                            className="w-5 h-5"
                            style={{ color: "var(--bc)" }}
                          />
                        )}
                      </button>
                    </div>
                    {errors.confirm && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.confirm}
                        </span>
                      </label>
                    )}
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
                          <span className="ml-3">Resetting...</span>
                        </div>
                      </>
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-xl font-bold auth-title">
                    Password Reset Successful!
                  </h3>
                  <p className="auth-description">
                    Your password has been reset successfully. You can now login
                    with your new password.
                  </p>
                  <p className="text-sm auth-label">
                    Redirecting to login page...
                  </p>
                </div>
              )}

              <div className="divider label-text auth-label"></div>

              {/* Back to Login Link */}
              <p className="text-center text-sm label-text auth-label">
                <Link href="/login" className="link link-primary font-medium">
                  ← Back to Login
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
