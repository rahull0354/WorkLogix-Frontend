"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getAllTimeEntries, getMyProjects } from "@/lib/api";
import { Project, TimeEntry } from "@/lib/types";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  FileSpreadsheet,
  Filter,
  FolderKanban,
  MoreHorizontal,
  TrendingUp,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as XLSX from "xlsx";

type SortField = "date" | "duration" | "project" | "earnings";
type SortOrder = "asc" | "desc";

interface ReportFilters {
  projectId: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface DailyBreakdown {
  date: string;
  hours: number;
  earnings: number;
}

interface ProjectBreakdown {
  projectName: string;
  hours: number;
  percentage: number;
  earnings: number;
}

// Type for TimeEntry with potentially populated project data
interface TimeEntryWithProject extends Omit<TimeEntry, 'projectId'> {
  projectId: string | { _id: string; projectName: string };
  projectName?: string;
}

const COLORS = [
  "#7c3aed",
  "#3b82f6",
  "#10b981",
  "#ec4899",
  "#f59e0b",
  "#8b5cf6",
];

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  delay,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  delay: number;
}) => {
  const colorClasses = {
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    pink: "from-pink-500 to-pink-600",
  };

  return (
    <div
      className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-200 dark:hover:border-purple-500/30"
      style={{
        animation: `fadeInUp 0.6s ease-out ${delay}s backwards`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      <div
        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-4 relative`}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-50 blur-xl" />
        <Icon className="w-7 h-7 text-white relative z-10" />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </p>

      <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
        {value}
      </h3>

      {subtext && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtext}</p>
      )}
    </div>
  );
};

const ChartCard = ({
  title,
  children,
  delay,
  action,
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
  action?: React.ReactNode;
}) => (
  <div
    className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-200 dark:hover:border-purple-500/30"
    style={{
      animation: `fadeInUp 0.6s ease-out ${delay}s backwards`,
    }}
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      {action || (
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      )}
    </div>
    {children}
  </div>
);

export default function ReportsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<TimeEntryWithProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // report data
  const [totalHours, setTotalHours] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [avgHoursPerDay, setAvgHoursPerDay] = useState(0);
  const [dailyBreakdown, setDailyBreakDown] = useState<DailyBreakdown[]>([]);
  const [projectBreakdown, setProjectBreakDown] = useState<ProjectBreakdown[]>(
    [],
  );

  //filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    projectId: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  // table stats
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    fetchEntries();
    fetchProjects();
  }, [user, authLoading, router]);

  // close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recalculate report data when both entries AND projects are loaded
  useEffect(() => {
    if (entries.length > 0 && projects.length > 0) {
      calculateReportData(entries);
    }
  }, [entries, projects, filters]);

  const fetchEntries = async () => {
    try {
      setLoading(true);

      const params: any = {
        limit: 1000,
      };

      if (filters.status) params.status = filters.status;

      const response = await getAllTimeEntries(params);
      let fetchedEntries = response.entries || [];

      // client side filters
      if (filters.projectId) {
        fetchedEntries = fetchedEntries.filter(
          (entry: any) =>
            entry.projectId?._id === filters.projectId ||
            entry.projectId === filters.projectId,
        );
      }

      if (filters.startDate) {
        fetchedEntries = fetchedEntries.filter((entry: any) => {
          const entryDate = new Date(entry.startTime || entry.createdAt);
          const startDate = new Date(filters.startDate);
          return entryDate >= startDate;
        });
      }

      if (filters.endDate) {
        fetchedEntries = fetchedEntries.filter((entry: any) => {
          const entryDate = new Date(entry.startTime || entry.createdAt);
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59);
          return entryDate <= endDate;
        });
      }

      setEntries(fetchedEntries);
      calculateReportData(fetchedEntries);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load time entries",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response: any = await getMyProjects();
      const fetchedProjects =
        response?.findProjects || response?.projects || [];
      setProjects(fetchedProjects);
    } catch (error) {
      // error handled by api
    }
  };

  const getEntryDuration = (entry: any): number => {
    if (entry.duration && entry.duration > 0) return entry.duration;
    if (entry.totalTime && entry.totalTime > 0) return entry.totalTime * 60;
    if (entry.sessions && Array.isArray(entry.sessions)) {
      const workSessions = entry.sessions.filter((s: any) => s.type === "work");
      return workSessions.reduce(
        (acc: number, s: any) => acc + (s.duration || 0),
        0,
      );
    }
    if (entry.startTime && entry.endTime) {
      return (
        (new Date(entry.endTime).getTime() -
          new Date(entry.startTime).getTime()) /
        1000
      );
    }
    return 0;
  };

  const calculateEarnings = (
    entry: any,
    project: Project | undefined,
  ): number => {
    const hours = getEntryDuration(entry) / 3600;
    const rate = project?.hourlyRate || 0;
    return hours * rate;
  };

  // Helper function to safely get project ID from entry
  const getProjectId = (entry: TimeEntryWithProject): string => {
    if (typeof entry.projectId === "object" && entry.projectId !== null) {
      return entry.projectId._id;
    }
    return entry.projectId;
  };

  // Helper function to safely get project name from entry
  const getProjectName = (entry: TimeEntryWithProject): string => {
    if (typeof entry.projectId === "object" && entry.projectId !== null) {
      return entry.projectId.projectName;
    }
    return entry.projectName || "Unknown Project";
  };

  const calculateReportData = (fetchedEntries: TimeEntryWithProject[]) => {
    // Calculate total hours
    const totalDuration = fetchedEntries.reduce(
      (acc, entry) => acc + getEntryDuration(entry),
      0,
    );
    const hours = totalDuration / 3600;
    setTotalHours(Math.round(hours * 10) / 10);

    // Calculate total earnings
    let earnings = 0;
    const projectMap = new Map<string, Project>();
    projects.forEach((p) => projectMap.set(p._id, p));

    fetchedEntries.forEach((entry) => {
      const projectId = getProjectId(entry);
      const project = projectMap.get(projectId);
      earnings += calculateEarnings(entry, project);
    });
    setTotalEarnings(Math.round(earnings));

    // Count unique projects
    const uniqueProjects = new Set(
      fetchedEntries.map((e) => getProjectId(e)).filter(Boolean),
    );
    setProjectCount(uniqueProjects.size);

    // Calculate average hours per day
    const uniqueDays = new Set(
      fetchedEntries.map((e) =>
        new Date(e.startTime || e.createdAt).toDateString(),
      ),
    );
    const avgHours = uniqueDays.size > 0 ? hours / uniqueDays.size : 0;
    setAvgHoursPerDay(Math.round(avgHours * 10) / 10);

    // Daily breakdown
    const dailyMap = new Map<string, { hours: number; earnings: number }>();

    fetchedEntries.forEach((entry) => {
      const date = new Date(entry.startTime || entry.createdAt).toDateString();
      const duration = getEntryDuration(entry);
      const projectId = getProjectId(entry);
      const project = projectMap.get(projectId);

      if (!dailyMap.has(date)) {
        dailyMap.set(date, { hours: 0, earnings: 0 });
      }

      const dayData = dailyMap.get(date)!;
      dayData.hours += duration / 3600;
      dayData.earnings += calculateEarnings(entry, project);
    });

    const dailyData = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        hours: Math.round(data.hours * 10) / 10,
        earnings: Math.round(data.earnings),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setDailyBreakDown(dailyData);

    // Project breakdown
    const projectBreakdownMap = new Map<
      string,
      { hours: number; earnings: number; name: string }
    >();

    fetchedEntries.forEach((entry) => {
      const projectId = getProjectId(entry);
      const projectName = getProjectName(entry);
      const duration = getEntryDuration(entry);
      const project = projectMap.get(projectId);

      if (!projectBreakdownMap.has(projectId)) {
        projectBreakdownMap.set(projectId, {
          hours: 0,
          earnings: 0,
          name: projectName,
        });
      }

      const projData = projectBreakdownMap.get(projectId)!;
      projData.hours += duration / 3600;
      projData.earnings += calculateEarnings(entry, project);
    });

    const totalProjectHours = Array.from(projectBreakdownMap.values()).reduce(
      (acc, p) => acc + p.hours,
      0,
    );

    const projectData = Array.from(projectBreakdownMap.values())
      .map((data) => ({
        projectName: data.name,
        hours: Math.round(data.hours * 10) / 10,
        earnings: Math.round(data.earnings),
        percentage:
          totalProjectHours > 0
            ? Math.round((data.hours / totalProjectHours) * 100)
            : 0,
      }))
      .sort((a, b) => b.hours - a.hours);

    setProjectBreakDown(projectData);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${Math.floor(seconds)}s`;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();

    const dateMidnight = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const nowMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const diffTime = nowMidnight.getTime() - dateMidnight.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const applyQuickPreset = (preset: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate = "";
    let endDate = today.toISOString().split("T")[0];

    switch (preset) {
      case "today":
        startDate = endDate;
        break;
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = monthStart.toISOString().split("T")[0];
        break;
      case "last7days":
        const last7Start = new Date(today);
        last7Start.setDate(today.getDate() - 6);
        startDate = last7Start.toISOString().split("T")[0];
        break;
      case "last30days":
        const last30Start = new Date(today);
        last30Start.setDate(today.getDate() - 29);
        startDate = last30Start.toISOString().split("T")[0];
        break;
    }

    setFilters({ ...filters, startDate, endDate });
  };

  const clearFilters = () => {
    setFilters({
      projectId: "",
      startDate: "",
      endDate: "",
      status: "",
    });
    setCurrentPage(1);
  };

  const getSortedAndPaginatedEntries = () => {
    const sorted = [...entries].sort((a: any, b: any) => {
      let comparison = 0;

      switch (sortField) {
        case "date":
          const dateA = new Date(a.startTime || a.createdAt || 0).getTime();
          const dateB = new Date(b.startTime || b.createdAt || 0).getTime();
          comparison = dateA - dateB;
          break;
        case "duration":
          const durationA = getEntryDuration(a);
          const durationB = getEntryDuration(b);
          comparison = durationA - durationB;
          break;
        case "project":
          const projectA = getProjectName(a).toLowerCase();
          const projectB = getProjectName(b).toLowerCase();
          comparison = projectA.localeCompare(projectB);
          break;
        case "earnings":
          const projectMap = new Map<string, Project>();
          projects.forEach((p) => projectMap.set(p._id, p));
          const projA = projectMap.get(getProjectId(a));
          const projB = projectMap.get(getProjectId(b));
          const earningsA = calculateEarnings(a, projA);
          const earningsB = calculateEarnings(b, projB);
          comparison = earningsA - earningsB;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    const startIndex = (currentPage - 1) * entriesPerPage;
    return sorted.slice(startIndex, startIndex + entriesPerPage);
  };

  const handleExport = (format: "csv" | "xlsx") => {
    try {
      if (entries.length === 0) {
        toast.error("No data to export. Please apply different filters or track some time first.");
        setShowExportMenu(false);
        return;
      }

      const projectMap = new Map<string, Project>();
      projects.forEach((p) => projectMap.set(p._id, p));

      const headers = [
        "Date",
        "Project",
        "Description",
        "Duration",
        "Status",
        "Earnings",
      ];

      // Helper function to format date for export
      const formatDateForExport = (dateString: string): string => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const rows = entries.map((entry: any) => {
        const projectName = getProjectName(entry);
        const description = entry.description || entry.notes || "";
        const duration = formatDuration(getEntryDuration(entry));
        const date = formatDateForExport(entry.startTime || entry.createdAt);
        const status =
          entry.endTime || entry.status === "completed" ? "Completed" : "Running";
        const project = projectMap.get(getProjectId(entry));
        const earnings = `$${calculateEarnings(entry, project).toFixed(2)}`;

        return [date, projectName, description, duration, status, earnings];
      });

      if (format === "csv") {
        const csvContent = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reports-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("Reports exported to CSV successfully!");
      } else {
        // Create multiple sheets for Excel export
        const summaryData = [
          ["Metric", "Value"],
          ["Total Hours", totalHours],
          ["Total Earnings", `$${totalEarnings}`],
          ["Projects Worked", projectCount],
          ["Avg Hours/Day", avgHoursPerDay],
        ];

        const dailyData = [
          ["Date", "Hours", "Earnings"],
          ...dailyBreakdown.map((d) => [d.date, d.hours, `$${d.earnings}`]),
        ];

        const projectData = [
          ["Project", "Hours", "Percentage", "Earnings"],
          ...projectBreakdown.map((p) => [
            p.projectName,
            p.hours,
            `${p.percentage}%`,
            `$${p.earnings}`,
          ]),
        ];

        const entryData = [headers, ...rows];

        const wb = XLSX.utils.book_new();

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

        const dailyWs = XLSX.utils.aoa_to_sheet(dailyData);
        XLSX.utils.book_append_sheet(wb, dailyWs, "Daily Breakdown");

        const projectWs = XLSX.utils.aoa_to_sheet(projectData);
        XLSX.utils.book_append_sheet(wb, projectWs, "Project Breakdown");

        const entryWs = XLSX.utils.aoa_to_sheet(entryData);
        XLSX.utils.book_append_sheet(wb, entryWs, "Detailed Entries");

        XLSX.writeFile(
          wb,
          `reports-${new Date().toISOString().split("T")[0]}.xlsx`,
        );

        toast.success("Reports exported to Excel successfully!");
      }

      setShowExportMenu(false);
    } catch (error) {
      toast.error("Failed to export reports. Please try again.");
      setShowExportMenu(false);
    }
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

  const paginatedEntries = getSortedAndPaginatedEntries();
  const totalPages = Math.ceil(entries.length / entriesPerPage);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div
        className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-[120px] opacity-[0.12] pointer-events-none animate-float"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-[100px] opacity-[0.10] pointer-events-none animate-float"
        style={{ animationDelay: "-10s" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 animate-slideIn">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Reports
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Analytics and insights for your tracked time
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-500/30 transition-all"
              >
                <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  Filters
                </span>
              </button>

              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  <Download className="w-5 h-5" />
                  <span>Export</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${showExportMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-lg py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                      Export Format
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport("csv");
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                    >
                      <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <div className="text-left">
                        <div className="font-medium">Export as CSV</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">All time entries</div>
                      </div>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport("xlsx");
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                    >
                      <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <div className="text-left">
                        <div className="font-medium">Export Summary as Excel</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Reports with multiple sheets</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Project Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Project
                </label>
                <select
                  value={filters.projectId}
                  onChange={(e) =>
                    handleFilterChange("projectId", e.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 outline-none transition-all text-slate-900 dark:text-white"
                >
                  <option value="">All Projects</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 outline-none transition-all text-slate-900 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Quick presets:
              </span>
              <button
                onClick={() => applyQuickPreset("today")}
                className="px-3 py-1 text-sm rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-all"
              >
                Today
              </button>
              <button
                onClick={() => applyQuickPreset("week")}
                className="px-3 py-1 text-sm rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-all"
              >
                This Week
              </button>
              <button
                onClick={() => applyQuickPreset("month")}
                className="px-3 py-1 text-sm rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-all"
              >
                This Month
              </button>
              <button
                onClick={() => applyQuickPreset("last7days")}
                className="px-3 py-1 text-sm rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-all"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => applyQuickPreset("last30days")}
                className="px-3 py-1 text-sm rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-all"
              >
                Last 30 Days
              </button>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          </div>
        )}

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Clock}
            label="Total Hours"
            value={`${totalHours}h`}
            subtext={`${entries.length} entries`}
            color="purple"
            delay={0.1}
          />
          <StatCard
            icon={DollarSign}
            label="Total Earnings"
            value={`$${totalEarnings}`}
            color="green"
            delay={0.2}
          />
          <StatCard
            icon={FolderKanban}
            label="Projects Worked"
            value={projectCount}
            color="blue"
            delay={0.3}
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Hours/Day"
            value={`${avgHoursPerDay}h`}
            color="pink"
            delay={0.4}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Trend Chart */}
          <ChartCard title="Time Trend" delay={0.3}>
            {dailyBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyBreakdown}>
                  <defs>
                    <linearGradient
                      id="hoursGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: any, name?: string) => [
                      name === "hours" ? `${value}h` : `$${value}`,
                      name === "hours" ? "Hours" : "Earnings",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    dot={{ fill: "#7c3aed", r: 4 }}
                    activeDot={{ r: 6 }}
                    fill="url(#hoursGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No data available for the selected period
              </div>
            )}
          </ChartCard>

          {/* Project Distribution */}
          <ChartCard title="Project Distribution" delay={0.4}>
            {projectBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) =>
                      entry.percentage > 5 ? `${entry.percentage}%` : ""
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="hours"
                  >
                    {projectBreakdown.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: any, name?: string, props?: any) => [
                      `${value}h (${props?.payload?.percentage || 0}%)`,
                      props?.payload?.projectName || name,
                    ]}
                  />
                  <Legend
                    formatter={(value: any, entry: any) => entry?.payload?.projectName || value}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No project data available
              </div>
            )}
          </ChartCard>
        </div>

        {/* Weekly/Monthly Bar Chart */}
        <div className="mb-8">
          <ChartCard title="Hours by Day" delay={0.5}>
            {dailyBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyBreakdown}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: any) => [`${value}h`, "Hours"]}
                  />
                  <Bar dataKey="hours" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-400">
                No data available for the selected period
              </div>
            )}
          </ChartCard>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden animate-fadeInUp">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <div className="col-span-2">
              <button
                onClick={() => handleSort("date")}
                className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Date
                {sortField === "date" && (
                  <span className="text-xs">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </div>
            <div className="col-span-3">
              <button
                onClick={() => handleSort("project")}
                className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Project
                {sortField === "project" && (
                  <span className="text-xs">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </div>
            <div className="col-span-3">Description</div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort("duration")}
                className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Duration
                {sortField === "duration" && (
                  <span className="text-xs">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort("earnings")}
                className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Earnings
                {sortField === "earnings" && (
                  <span className="text-xs">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center gap-2">
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
          ) : entries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No report data available
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {filters.projectId || filters.startDate || filters.status
                  ? "Try adjusting your filters"
                  : "Start tracking time to see reports here"}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {paginatedEntries.map((entry: any) => {
                  const projectName =
                    entry.projectId?.projectName ||
                    entry.projectName ||
                    "Unknown";
                  const description =
                    entry.description || entry.notes || "No description";
                  const duration = getEntryDuration(entry);
                  const project = entry.projectId?._id
                    ? projects.find((p) => p._id === entry.projectId._id)
                    : undefined;
                  const earnings = calculateEarnings(entry, project);
                  const date = formatDate(entry.startTime || entry.createdAt);

                  return (
                    <div
                      key={entry._id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all items-center group"
                    >
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-900 dark:text-white font-medium text-sm">
                            {date}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <FolderKanban className="w-4 h-4 text-purple-500" />
                          <span className="text-slate-900 dark:text-white truncate text-sm">
                            {projectName}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-3">
                        <p className="text-slate-600 dark:text-slate-400 truncate text-sm">
                          {description}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                          <Clock className="w-3 h-3" />
                          {formatDuration(duration)}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          ${earnings.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-white/10">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                    {Math.min(currentPage * entriesPerPage, entries.length)} of{" "}
                    {entries.length} entries
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // Show first, last, and pages around current
                          return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          );
                        })
                        .map((page, idx, arr) => {
                          // Add ellipsis for gaps
                          if (idx > 0 && arr[idx - 1] !== page - 1) {
                            return (
                              <span
                                key={`ellipsis-${page}`}
                                className="w-10 h-10 flex items-center justify-center text-slate-400"
                              >
                                ...
                              </span>
                            );
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                                currentPage === page
                                  ? "bg-purple-500 text-white"
                                  : "hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        html.dark option {
          background-color: #1a1a1a;
          color: #ffffff;
        }

        html.dark option:hover,
        html.dark option:focus {
          background-color: #333333;
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
