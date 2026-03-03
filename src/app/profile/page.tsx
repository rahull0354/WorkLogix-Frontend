"use client";

import { updateUser, getMyProjects, getTimeEntriesByProject } from "@/lib/api";
import { User, Project } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Mail,
  User as UserIcon,
  Edit2,
  Shield,
  LogOut,
  Calendar,
  Fingerprint,
  Sparkles,
  ArrowRight,
  Clock,
  TrendingUp,
  Activity,
  DollarSign,
  Timer,
  BarChart3,
  Play,
  Plus,
  Home,
  Settings,
  FolderKanban,
} from "lucide-react";

interface StatsData {
  totalProjects: number;
  totalHours: number;
  totalEarnings: number;
  weeklyHours: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const {
    user: authUser,
    logout,
    updateUser: updateAuthUser,
    isLoading: authLoading,
  } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullname: "",
  });
  const [stats, setStats] = useState<StatsData>({
    totalProjects: 0,
    totalHours: 0,
    totalEarnings: 0,
    weeklyHours: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [loadingStats, setLoadingStats] = useState(true);

  const getUserInitials = (name: string, username: string) => {
    const displayName = name || username;
    if (!displayName) return "?";
    const parts = displayName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    setMounted(true);

    // Wait for auth context to finish loading before making decisions
    if (authLoading) {
      return; // Still loading auth from localStorage, wait
    }

    if (authUser) {
      setProfile(authUser);
      setFormData({
        email: authUser.email || "",
        fullname: authUser.fullname || "",
      });
      setLoading(false);
      fetchStatsAndProjects();
    } else {
      // Only redirect to login if auth is done loading and no user found
      router.push("/login");
    }
  }, [authUser, authLoading, router]);

  const fetchStatsAndProjects = useCallback(async () => {
    try {
      setLoadingStats(true);

      // Fetch projects from backend
      // Backend returns: { message, success, findProjects: [...] }
      const projectsResponse: any = await getMyProjects();
      const projects: Project[] = projectsResponse?.findProjects || [];

      // Set recent projects (last 3)
      setRecentProjects(projects.slice(0, 3));

      // If no projects, set zero stats and return
      if (projects.length === 0) {
        setStats({
          totalProjects: 0,
          totalHours: 0,
          totalEarnings: 0,
          weeklyHours: 0,
        });
        setWeeklyData([0, 0, 0, 0, 0, 0, 0]);
        toast.error("No projects found. Create a project to start tracking!");
        return;
      }

      // Fetch time entries for each project and calculate stats
      let totalHours = 0;
      let totalEarnings = 0;
      let weeklyHours = 0;
      const weeklyHoursPerDay = [0, 0, 0, 0, 0, 0, 0];

      const projectStatsPromises = projects.map(async (project: any) => {
        try {
          const entriesResponse = await getTimeEntriesByProject(project._id);
          const entries = entriesResponse.entries || [];

          let projectHours = 0;
          entries.forEach((entry: any) => {
            let duration = 0;

            if (entry.duration && entry.duration > 0) {
              duration = entry.duration;
            } else if (entry.totalTime && entry.totalTime > 0) {
              duration = entry.totalTime * 60;
            } else if (entry.sessions && Array.isArray(entry.sessions)) {
              const workSessions = entry.sessions.filter(
                (s: any) => s.type === "work",
              );
              duration = workSessions.reduce(
                (acc: number, s: any) => acc + (s.duration || 0),
                0,
              );
            } else if (entry.startTime && entry.endTime) {
              duration =
                (new Date(entry.endTime).getTime() -
                  new Date(entry.startTime).getTime()) /
                1000;
            }

            if (duration > 0) {
              const hours = duration / 3600;
              projectHours += hours;

              // Check if entry is from this week
              if (entry.startTime) {
                const entryDate = new Date(entry.startTime);
                const now = new Date();
                const weekAgo = new Date(
                  now.getTime() - 7 * 24 * 60 * 60 * 1000,
                );

                if (entryDate >= weekAgo) {
                  weeklyHours += hours;
                  const dayIndex = entryDate.getDay();
                  weeklyHoursPerDay[dayIndex] += hours;
                }
              }
            }
          });

          return {
            hours: projectHours,
            rate: project.hourlyRate || 0,
          };
        } catch (err) {
          return { hours: 0, rate: 0 };
        }
      });

      const projectStats = await Promise.all(projectStatsPromises);

      projectStats.forEach((stat) => {
        totalHours += stat.hours;
        totalEarnings += stat.hours * stat.rate;
      });

      const finalStats = {
        totalProjects: projects.length,
        totalHours: Math.round(totalHours * 10) / 10,
        totalEarnings: Math.round(totalEarnings),
        weeklyHours: Math.round(weeklyHours * 10) / 10,
      };

      setStats(finalStats);
      setWeeklyData(weeklyHoursPerDay.map((h) => Math.round(h * 10) / 10));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load profile data",
      );

      // Set empty state on error
      setRecentProjects([]);
      setStats({
        totalProjects: 0,
        totalHours: 0,
        totalEarnings: 0,
        weeklyHours: 0,
      });
      setWeeklyData([0, 0, 0, 0, 0, 0, 0]);
    } finally {
      setLoadingStats(false);
    }
  }, []); // Empty dependency array since we're fetching fresh data

  const handleEdit = () => {
    setFormData({
      email: profile?.email || "",
      fullname: profile?.fullname || "",
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      if (!profile?._id) {
        throw new Error("User ID not found");
      }

      const updateData = {
        email: formData.email,
        fullname: formData.fullname,
      };

      await updateUser(profile._id, updateData);

      const updatedProfile = {
        ...profile,
        ...updateData,
      };
      setProfile(updatedProfile);

      updateAuthUser(updateData);

      toast.success("Profile updated successfully!");
      setShowEditModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!mounted || loading || authLoading) {
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

  if (!profile) {
    return null;
  }

  const initials = getUserInitials(profile.fullname, profile.username);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const maxHours = Math.max(...weeklyData, 1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div
        className="fixed top-0 right-0 w-125 h-125 bg-linear-to-br from-purple-500 to-pink-500 rounded-full blur-[120px] opacity-[0.12] pointer-events-none animate-float"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="fixed bottom-0 left-0 w-100 h-125 bg-linear-to-br from-blue-500 to-purple-500 rounded-full blur-[100px] opacity-[0.10] pointer-events-none animate-float"
        style={{ animationDelay: "-10s" }}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-linear-to-tr from-pink-500 to-purple-500 rounded-full blur-[150px] opacity-[0.06] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero Profile Section */}
        <div className="mb-8 animate-heroSlide">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-purple-500 via-pink-500 to-purple-500 rounded-[3rem] blur-xl opacity-40 animate-pulse-slow" />
            <div className="relative bg-white/80 dark:bg-white/3 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[2.5rem] p-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-linear-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative group">
                  <div className="relative w-36 h-36 rounded-2xl bg-purple-600 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                    <span className="text-5xl font-bold text-white tracking-wider">
                      {initials}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-linear-to-br from-emerald-400 to-emerald-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg animate-bounce-gentle">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left relative">
                  {/* Edit Profile Button - Top Right */}
                  <button
                    onClick={handleEdit}
                    className="absolute top-0 right-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-300 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>

                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-4">
                    <Shield className="w-4 h-4" />
                    <span>Verified Account</span>
                  </div>

                  <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                    {profile.fullname || profile.username}
                  </h1>

                  <p className="text-xl text-slate-600 dark:text-slate-400 mb-6 font-medium">
                    @{profile.username}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 dark:text-slate-500">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5">
                      <Mail className="w-4 h-4" />
                      <span className="font-medium">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">
                        Since {new Date().getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-fadeInUp">
          {loadingStats ? (
            // Loading skeletons
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-slate-200 dark:bg-white/5 rounded-3xl p-6 animate-pulse"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-300 dark:bg-white/10" />
                    <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-white/10" />
                  </div>
                  <div className="h-4 w-24 rounded bg-slate-300 dark:bg-white/10 mb-2" />
                  <div className="h-8 w-16 rounded bg-slate-300 dark:bg-white/10" />
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white hover:scale-105 transition-transform duration-300 shadow-xl shadow-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <FolderKanban className="w-8 h-8 opacity-80" />
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-purple-100 text-sm font-medium mb-1">
                  Total Projects
                </p>
                <p className="text-4xl font-black">{stats.totalProjects}</p>
              </div>

              <div className="bg-linear-to-br from-pink-500 to-pink-600 rounded-3xl p-6 text-white hover:scale-105 transition-transform duration-300 shadow-xl shadow-pink-500/20">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 opacity-80" />
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Timer className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-pink-100 text-sm font-medium mb-1">
                  Hours Tracked
                </p>
                <p className="text-4xl font-black">{stats.totalHours}h</p>
              </div>

              <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white hover:scale-105 transition-transform duration-300 shadow-xl shadow-emerald-500/20">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 opacity-80" />
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-emerald-100 text-sm font-medium mb-1">
                  Total Earnings
                </p>
                <p className="text-4xl font-black">${stats.totalEarnings}</p>
              </div>

              <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white hover:scale-105 transition-transform duration-300 shadow-xl shadow-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8 opacity-80" />
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-blue-100 text-sm font-medium mb-1">
                  This Week
                </p>
                <p className="text-4xl font-black">{stats.weeklyHours}h</p>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Weekly Activity Chart */}
          <div
            className="lg:col-span-2 bg-white/80 dark:bg-white/3 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 animate-fadeInUp"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  Weekly Activity
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Hours tracked per day
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="flex items-end justify-between gap-2 h-48">
              {weeklyData.map((hours, index) => {
                const height = maxHours > 0 ? (hours / maxHours) * 100 : 0;
                const isToday = index === new Date().getDay();

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="relative w-full flex items-end justify-center h-36">
                      <div
                        className="w-full max-w-10 rounded-t-xl bg-linear-to-t from-purple-500 to-pink-500 transition-all duration-500 hover:from-purple-600 hover:to-pink-600 relative group"
                        style={{ height: `${Math.max(height, 4)}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {hours}h
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold ${isToday ? "text-purple-600 dark:text-purple-400" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      {days[index]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="bg-white/80 dark:bg-white/3 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 animate-fadeInUp"
            style={{ animationDelay: "0.15s" }}
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Quick Actions
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/timer")}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-linear-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold">Start Timer</p>
                  <p className="text-purple-100 text-xs">Track your time</p>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Home className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Dashboard
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    View overview
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/projects")}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderKanban className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Projects
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Manage projects
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/settings")}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Settings
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Preferences
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Projects & Account Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Projects */}
          <div
            className="bg-white/80 dark:bg-white/3 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 animate-fadeInUp"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  Recent Projects
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Your latest work
                </p>
              </div>
              <button
                onClick={() => router.push("/projects")}
                className="px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-semibold hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-all"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentProjects.length > 0 ? (
                recentProjects.map((project, index) => (
                  <button
                    key={project._id}
                    onClick={() => router.push(`/projects/${project._id}`)}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-500/10 border border-slate-200 dark:border-white/10 hover:border-purple-500/30 transition-all duration-300 group animate-fadeInUp"
                    style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <FolderKanban className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {project.projectName}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {project.clientName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === "active"
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : project.status === "completed"
                              ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                              : "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {project.status}
                      </span>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-purple-500 transition-all" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <FolderKanban className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    No projects yet
                  </p>
                  <button
                    onClick={() => router.push("/projects")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Create Project
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div
            className="bg-white/80 dark:bg-white/3 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 animate-fadeInUp"
            style={{ animationDelay: "0.25s" }}
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Account Details
            </h3>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-500/30 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Username
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                      {profile.username}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-500/30 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Fingerprint className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      User ID
                    </p>
                    <p className="text-sm font-mono text-slate-900 dark:text-white break-all">
                      {profile._id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={handleEdit}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold hover:bg-red-200 dark:hover:bg-red-500/30 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Account Status Banner */}
        <div
          className="bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-3xl p-8 relative overflow-hidden animate-fadeInUp"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMCAwIDItMiAyLTJzLTItMi00LTJjMCAwIDIgMiAyIDIgMCAwLTItMi0yLTJzLTItMi00LTJjMCAwIDIgMiAyIDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Account Active
                </h3>
                <p className="text-emerald-100">
                  All systems operational • Full access enabled
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-black text-white">24/7</p>
                <p className="text-emerald-100 text-sm">Tracking</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-black text-white">100%</p>
                <p className="text-emerald-100 text-sm">Secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white/90 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-4xl shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 p-8 border-b border-slate-200/50 dark:border-white/10 bg-white/90 dark:bg-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Edit2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Edit Profile
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Update your account information
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value })
                  }
                  placeholder="e.g., John Doe"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="e.g., john@example.com"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 text-base"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0m9 9a9 9 0 018 0"
                    />
                  </svg>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <span className="font-semibold">Note:</span> Username cannot
                    be changed. Contact support if you need to update it.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                  className="flex-1 px-6 py-4 rounded-2xl font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-4 rounded-2xl font-semibold text-white bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20 text-base"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

        @keyframes heroSlide {
          from {
            opacity: 0;
            transform: translateY(-40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
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

        @keyframes glow {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes bounce-gentle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-heroSlide {
          animation: heroSlide 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
