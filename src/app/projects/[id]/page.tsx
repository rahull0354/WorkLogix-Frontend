'use client';

import {
  changeProjectStatus,
  deleteProject,
  getProjectDetails,
  updateProject,
  getTimeEntriesByProject,
} from "@/lib/api";
import { Project, TimeEntry } from "@/lib/types";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  Pause,
  Play,
  RefreshCw,
  Timer,
  Trash2,
  TrendingUp,
  Target,
  Zap,
  Calendar,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";

// get status info
const getStatusInfo = (status: string) => {
  switch (status) {
    case "active":
      return {
        label: "Active",
        color: "from-emerald-500 to-emerald-600",
        bg: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
        bgSoft: "bg-emerald-50 dark:bg-emerald-500/10",
        border: "border-emerald-200 dark:border-emerald-500/30",
      };
    case "hold":
      return {
        label: "On Hold",
        color: "from-amber-500 to-amber-600",
        bg: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400",
        bgSoft: "bg-amber-50 dark:bg-amber-500/10",
        border: "border-amber-200 dark:border-amber-500/30",
      };
    case "completed":
      return {
        label: "Completed",
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-500",
        text: "text-blue-600 dark:text-blue-400",
        bgSoft: "bg-blue-50 dark:bg-blue-500/10",
        border: "border-blue-200 dark:border-blue-500/30",
      };
    default:
      return {
        label: "Active",
        color: "from-emerald-500 to-emerald-600",
        bg: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
        bgSoft: "bg-emerald-50 dark:bg-emerald-500/10",
        border: "border-emerald-200 dark:border-emerald-500/30",
      };
  }
};

// get icon and color for project type
const getProjectTypeIcon = (type: string) => {
  const icons: {
    [key: string]: { icon: any; color: string; label: string };
  } = {
    api_development: {
      icon: Zap,
      color: "from-emerald-500 to-emerald-600",
      label: "API Development",
    },
    web_app: {
      icon: Target,
      color: "from-purple-500 to-purple-600",
      label: "Web App",
    },
    mobile_app: {
      icon: Calendar,
      color: "from-pink-500 to-pink-600",
      label: "Mobile App",
    },
    consulting: {
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      label: "Consulting",
    },
    website_redesign: {
      icon: Target,
      color: "from-cyan-500 to-cyan-600",
      label: "Website Redesign",
    },
  };
  return (
    icons[type] || {
      icon: Target,
      color: "from-slate-500 to-slate-600",
      label: "Project",
    }
  );
};

// Helper function to get duration in seconds from an entry
const getEntryDuration = (entry: any): number => {
  // Priority 1: Try to use the duration field from backend
  if (entry.duration && entry.duration > 0) {
    return entry.duration;
  }

  // Priority 2: Check if there's a totalTime field
  if (entry.totalTime && entry.totalTime > 0) {
    // totalTime might be in minutes, convert to seconds
    const seconds = entry.totalTime * 60;
    return seconds;
  }

  // Priority 3: Calculate from sessions array (sum only work sessions, exclude breaks)
  if (entry.sessions && Array.isArray(entry.sessions) && entry.sessions.length > 0) {
    const workSessions = entry.sessions.filter((s: any) => s.type === 'work');
    const totalFromSessions = workSessions.reduce((acc: number, s: any) => {
      const sessionDuration = s.duration || 0;
      return acc + sessionDuration;
    }, 0);

    if (totalFromSessions > 0) {
      return totalFromSessions;
    }
  }

  // Priority 4: Calculate from startTime and endTime (if available)
  if (entry.startTime && entry.endTime) {
    try {
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      const seconds = (end.getTime() - start.getTime()) / 1000;
      return seconds;
    } catch (error) {
      // Silently handle timestamp errors
    }
  }

  return 0;
};

// formatting seconds
const formatDuration = (entry: any): string => {
  const seconds = getEntryDuration(entry);

  if (!seconds || seconds === 0) return "0m";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    // Show seconds if less than 1 minute
    return `${remainingSeconds}s`;
  }
};

// formatting date
const formatEntryDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM dd, yyyy • h:mm a");
    }
  } catch (error) {
    return "Invalid date";
  }
};

const safeFormatDate = (dateString: string | undefined, formatStr: string): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return format(date, formatStr);
  } catch (error) {
    return "N/A";
  }
};

const getTimeEntryStatusInfo = (status: string) => {
  switch (status) {
    case "running":
      return {
        label: "Running",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        borderColor: "border-emerald-200 dark:border-emerald-500/30",
        icon: Play,
      };
    case "stopped":
      return {
        label: "Stopped",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-500/10",
        borderColor: "border-amber-200 dark:border-amber-500/30",
        icon: Pause,
      };
    case "break":
      return {
        label: "On Break",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-500/10",
        borderColor: "border-blue-200 dark:border-blue-500/30",
        icon: Clock,
      };
    case "completed":
      return {
        label: "Completed",
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-500/10",
        borderColor: "border-purple-200 dark:border-purple-500/30",
        icon: CheckCircle2,
      };
    default:
      return {
        label: "Unknown",
        color: "text-slate-600 dark:text-slate-400",
        bg: "bg-slate-50 dark:bg-slate-500/10",
        borderColor: "border-slate-200 dark:border-slate-500/30",
        icon: AlertCircle,
      };
  }
};

export default function projectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: projectId } = use(params);

  // Ensure projectId is available before proceeding
  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const [project, setProject] = useState<Project | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    clientName: "",
    hourlyRate: "",
    description: "",
    projectType: "web_app" as any,
  });

  useEffect(() => {
    setMounted(true);
    fetchAllData();
  }, [projectId]);

  const fetchAllData = async () => {
    await Promise.all([fetchProjectDetails(), fetchProjectTimeEntries()]);
  };

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);

      const projectData = await getProjectDetails(projectId);

      setProject(projectData);

      setFormData({
        projectName: projectData.projectName || "",
        clientName: projectData.clientName || "",
        hourlyRate: (projectData.hourlyRate || 0).toString(),
        description: projectData.description || "",
        projectType: projectData.projectType || "web_app",
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch project details",
      );

      if (error.response?.status === 404) {
        toast.error("Project not found");
        setTimeout(() => router.push("/projects"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTimeEntries = async () => {
    try {
      setEntriesLoading(true);

      const response = await getTimeEntriesByProject(projectId);

      if (response.entries && Array.isArray(response.entries)) {
        setTimeEntries(response.entries);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch time entries");
      setTimeEntries([]);
    } finally {
      setEntriesLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast.success("Data Refreshed");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const projectData = {
        projectName: formData.projectName,
        clientName: formData.clientName,
        hourlyRate: parseFloat(formData.hourlyRate),
        description: formData.description,
        projectType: formData.projectType,
      };

      const updatedProject = await updateProject(projectId, projectData);

      setProject(updatedProject);
      toast.success("Project updated successfully");
      setShowEditModal(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update project",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this project? This action cannot be undone.",
      )
    ) {
      try {
        await deleteProject(projectId);
        toast.success("Project deleted Successfully!");
        router.push("/projects");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to delete project",
        );
      }
    }
  };

  const handleStatusChange = async (
    newStatus: "active" | "hold" | "completed",
  ) => {
    try {
      const updatedProject = await changeProjectStatus(projectId, {
        status: newStatus,
      });
      setProject(updatedProject);
      toast.success(`Project marked as ${newStatus}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // navigate to timer page with this project selected
  const handleStartTimer = () => {
    router.push(`/timer?projectId=${projectId}`);
  };

  // calculating total stats from actual time entries
  const totalSeconds = timeEntries.reduce((acc, entry) => {
    return acc + getEntryDuration(entry);
  }, 0);
  const totalHours = totalSeconds / 3600;
  const totalEarnings = totalHours * (project?.hourlyRate || 0);
  const totalEntries = timeEntries.length;

  // count entries by status
  const completedEntries = timeEntries.filter(
    (e) => e.status === "completed",
  ).length;

    if (!mounted || loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
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
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Loading project details...
            </p>
          </div>
        </div>
      );
    }

    if (!project) {
      return null;
    }

    const statusInfo = getStatusInfo(project.status);
    const {
      icon: TypeIcon,
      color: typeColor,
      label: typeLabel,
    } = getProjectTypeIcon(project.projectType);

    return (
    <div className="min-h-screen bg-slate-50 dark:bg-black relative overflow-hidden">
      {/* background animation */}
      <div
        className="fixed top-0 right-0 w-125 h-125 bg-linear-to-br from-purple-500 to-pink-500 rounded-full blur-[100px] opacity-[0.08] pointer-events-none animate-float"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="fixed bottom-0 left-0 w-125 h-125 bg-linear-to-br from-blue-500 to-purple-500 rounded-full blur-[100px] opacity-[0.08] pointer-events-none animate-float"
        style={{ animationDelay: "-10s" }}
      />

      {/* main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* header section */}
        <div className="mb-8 animate-slideIn">
          {/* Back Button & Refresh */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/projects")}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Projects
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:border-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Title and Actions */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Title and Badge */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-linear-to-br ${typeColor} flex items-center justify-center shadow-lg`}
                >
                  <TypeIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {project.projectName}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full ${statusInfo.bgSoft} ${statusInfo.text} border ${statusInfo.border}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${statusInfo.bg} animate-pulse`}
                      />
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{project.clientName}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    <span className="text-sm">{typeLabel}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-400 ml-1 max-w-3xl">
                {project.description}
              </p>

              {/* Created Date */}
              <p className="text-xs text-slate-500 dark:text-slate-500 ml-1 mt-2">
                Created on{" "}
                {safeFormatDate(project.createdAt, "MMMM dd, yyyy")}
              </p>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleStartTimer}
                className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
              >
                <Play className="w-5 h-5" />
                Start Timer
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-500/50 transition-all hover:-translate-y-1"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/50 transition-all hover:-translate-y-1"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* stats cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          style={{ animation: "fadeInUp 0.6s ease-out 0.2s backwards" }}
        >
          {/* Total Hours Card */}
          <div
            className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-200 dark:hover:border-purple-500/30"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-purple-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 opacity-50 blur-xl" />
                <Clock className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Total Hours
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {totalHours.toFixed(1)}h
                </h3>
              </div>
            </div>
          </div>

          {/* Total Entries Card */}
          <div
            className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-1 hover:border-pink-200 dark:hover:border-pink-500/30"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-pink-500 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-pink-500 to-pink-600 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-pink-500 to-pink-600 opacity-50 blur-xl" />
                <Timer className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Time Entries
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {totalEntries}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {completedEntries} completed
                </p>
              </div>
            </div>
          </div>

          {/* Hourly Rate Card */}
          <div
            className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 hover:border-emerald-200 dark:hover:border-emerald-500/30"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 opacity-50 blur-xl" />
                <DollarSign className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Hourly Rate
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  ${project.hourlyRate}
                </h3>
              </div>
            </div>
          </div>

          {/* Total Earnings Card */}
          <div
            className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 hover:border-violet-200 dark:hover:border-violet-500/30"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-violet-500 to-violet-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-violet-500 to-violet-600 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-violet-500 to-violet-600 opacity-50 blur-xl" />
                <TrendingUp className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Total Earnings
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  ${totalEarnings.toFixed(2)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* status actions */}
        <div
          className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 mb-8"
          style={{ animation: "fadeInUp 0.6s ease-out 0.3s backwards" }}
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Change Project Status
          </h3>
          <div className="flex flex-wrap gap-3">
            {project.status !== "active" && (
              <button
                onClick={() => handleStatusChange("active")}
                className="px-6 py-3 rounded-xl font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30   transition-all hover:-translate-y-0.5"
              >
                Mark as Active
              </button>
            )}
            {project.status !== "hold" && (
              <button
                onClick={() => handleStatusChange("hold")}
                className="px-6 py-3 rounded-xl font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 transition-all hover:-translate-y-0.5"
              >
                Put on Hold
              </button>
            )}
            {project.status !== "completed" && (
              <button
                onClick={() => handleStatusChange("completed")}
                className="px-6 py-3 rounded-xl font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 transition-all hover:-translate-y-0.5"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>

        {/* fetching time entries */}
        <div
          className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6"
          style={{ animation: "fadeInUp 0.6s ease-out 0.4s backwards" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Time Entries
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                All tracked time for this project
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {totalEntries}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Entries
              </p>
            </div>
          </div>

          {/* Loading State for Entries */}
          {entriesLoading ? (
            <div className="text-center py-16">
              <div className="flex items-center justify-center gap-2 mb-4">
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
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Loading time entries...
              </p>
            </div>
          ) : timeEntries.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Timer className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                No Time Entries Yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Start tracking time on this project to see entries here
              </p>
              <button
                onClick={handleStartTimer}
                className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                <Play className="w-5 h-5" />
                Start Tracking
              </button>
            </div>
          ) : (
            /* Time Entries List */
            <div className="space-y-3">
              {timeEntries.map((entry, index) => {
                const statusInfo = getTimeEntryStatusInfo(entry.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={entry._id || index}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-500/50 transition-all duration-300"
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${0.5 + index * 0.05}s backwards`,
                    }}
                  >
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-linear-to-br ${typeColor} flex items-center justify-center shrink-0`}
                    >
                      <TypeIcon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-white font-medium truncate">
                        {entry.description || "No description"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-lg ${statusInfo.bg} ${statusInfo.color} border ${statusInfo.borderColor}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatEntryDate(entry.startTime)}
                        </span>
                        {entry.endTime && (
                          <>
                            <span className="text-xs text-slate-400">→</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {safeFormatDate(entry.endTime, "h:mm a")}
                            </span>
                          </>
                        )}
                      </div>
                      {entry.breaks && entry.breaks.length > 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {entry.breaks.length} break
                          {entry.breaks.length > 1 ? "s" : ""} taken
                        </p>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {formatDuration(entry)}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        @ ${project.hourlyRate}/hr
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

          {/* edit modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 p-6 border-b border-slate-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Edit Project
                  </h2>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) =>
                    setFormData({ ...formData, projectName: e.target.value })
                  }
                  placeholder="e.g., Website Redesign"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-slate-90 dark:text-white placeholder:text-slate-400"
                />
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  placeholder="e.g., Acme Corp"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Hourly Rate ($/hr) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    setFormData({ ...formData, hourlyRate: e.target.value })
                  }
                  placeholder="e.g., 50"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Project Type *
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projectType: e.target.value as any,
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-slate-900 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-900 [&>option]:text-slate-900 dark:[&>option]:text-slate-100"
                >
                  <option value="api_development">API Development</option>
                  <option value="web_app">Web App</option>
                  <option value="mobile_app">Mobile App</option>
                  <option value="consulting">Consulting</option>
                  <option value="website_redesign">Website Redesign</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief project description..."
                  rows={3}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    "Update Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
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

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out 0.4s backwards;
        }

        .animate-slideIn {
          animation: slideIn 0.6s ease-out;
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
