"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Bell, ChevronRight, Clock, Globe, Key, LogOut, Mail, Moon, Palette, Save, SettingsIcon, Shield, Sun, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Theme = "light" | "dark" | "system";

interface SettingsState {
  theme: Theme;
  notifications: boolean;
  emailAlerts: boolean;
  projectUpdates: boolean;
  weeklySummary: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    theme: "system",
    notifications: true,
    emailAlerts: true,
    projectUpdates: true,
    weeklySummary: true,
  });

  useEffect(() => {
    setMounted(true);

    // Wait for auth context to finish loading before making decisions
    if (authLoading) {
      return; // Still loading auth from localStorage, wait
    }

    if (!user) {
      router.push("/login");
      return;
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem("settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        // Ignore parsing errors, use defaults
      }
    }
  }, [user, authLoading, router]);

  const handleSave = async () => {
    try {
      setSaving(true);
      localStorage.setItem("settings", JSON.stringify(settings));

      if (settings.theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else if (settings.theme === "light") {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        // System theme
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        if (systemTheme === "dark") {
          document.documentElement.classList.add("dark");
          document.documentElement.setAttribute("data-theme", "dark");
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.setAttribute("data-theme", "light");
        }
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div
        className="fixed top-0 right-0 w-125 h-125 bg-linear-to-br from-purple-500 to-pink-500 rounded-full blur-[120px] opacity-[0.12] pointer-events-none animate-float"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="fixed bottom-0 left-0 w-100 h-100 bg-linear-to-br from-blue-500 to-purple-500 rounded-full blur-[100px] opacity-[0.10] pointer-events-none animate-float"
        style={{ animationDelay: "-10s" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 animate-slideIn">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your preferences and account
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Left Column - Appearance & Account Sections */}
          <div className="space-y-6">
            {/* Appearance Section */}
            <div
              className="bg-white/80 dark:bg-white/3 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 animate-fadeInUp"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Appearance
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Customize how the app looks
                  </p>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Theme Preference
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setSettings({ ...settings, theme: "light" })}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 group ${
                      settings.theme === "light"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-500/20"
                        : "border-slate-200 dark:border-white/10 hover:border-purple-500/30 bg-slate-50 dark:bg-white/5"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Sun className="w-6 h-6 text-amber-500" />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Light
                      </span>
                    </div>
                    {settings.theme === "light" && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setSettings({ ...settings, theme: "dark" })}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 group ${
                      settings.theme === "dark"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-500/20"
                        : "border-slate-200 dark:border-white/10 hover:border-purple-500/30 bg-slate-50 dark:bg-white/5"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-100 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Moon className="w-6 h-6 text-purple-400" />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Dark
                      </span>
                    </div>
                    {settings.theme === "dark" && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setSettings({ ...settings, theme: "system" })}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 group ${
                      settings.theme === "system"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-500/20"
                        : "border-slate-200 dark:border-white/10 hover:border-purple-500/30 bg-slate-50 dark:bg-white/5"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <SettingsIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        System
                      </span>
                    </div>
                    {settings.theme === "system" && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div
              className="bg-white/80 dark:bg-white/3 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 animate-fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Account
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Manage your account settings
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Profile Settings */}
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-500/10 border border-slate-200 dark:border-white/10 hover:border-purple-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        Edit Profile
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Update your personal information
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Notifications Section */}
          <div
            className="bg-white/80 dark:bg-white/3 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 animate-fadeInUp"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Notifications
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Manage your notification preferences
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Enable Notifications */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Push Notifications
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Receive notifications on your device
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      notifications: !settings.notifications,
                    })
                  }
                  className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                    settings.notifications
                      ? "bg-purple-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      settings.notifications ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Email Alerts */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Email Alerts
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      emailAlerts: !settings.emailAlerts,
                    })
                  }
                  className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                    settings.emailAlerts
                      ? "bg-purple-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      settings.emailAlerts ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Project Updates */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Project Updates
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Get notified about project changes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      projectUpdates: !settings.projectUpdates,
                    })
                  }
                  className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                    settings.projectUpdates
                      ? "bg-purple-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      settings.projectUpdates
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Weekly Summary */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Weekly Summary
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Receive weekly activity reports
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      weeklySummary: !settings.weeklySummary,
                    })
                  }
                  className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                    settings.weeklySummary
                      ? "bg-purple-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      settings.weeklySummary ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save & Logout Buttons */}
          <div
            className="flex gap-4 animate-fadeInUp lg:col-span-2"
            style={{ animationDelay: "0.4s" }}
          >
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-slideIn {
          animation: slideIn 0.6s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
