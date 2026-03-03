"use client";

import { useAuth } from "@/contexts/AuthContext";
import { deleteTimeEntry, getAllTimeEntries } from "@/lib/api";
import { Project, TimeEntry } from "@/lib/types";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, Filter, FolderKanban, Search, Trash2, TrendingUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

type SortField = "date" | "duration" | "project" | "status";
type SortOrder = "asc" | "desc";

interface Filters {
  projectId: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function TimeEntriesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const entriesPerPage = 10;

  // filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    projectId: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  // search & sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // delete confirmation
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
  }, [user, authLoading, router, currentPage, filters]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);

      const params: any = {
        page: currentPage,
        limit: entriesPerPage,
      };

      // Only add filters that backend supports
      if (filters.status) params.status = filters.status;

      const response = await getAllTimeEntries(params);

      let fetchedEntries = response.entries || [];

      setTotalEntries(response.total || 0);

      // Apply client-side filters for unsupported features
      if (filters.projectId) {
        fetchedEntries = fetchedEntries.filter((entry: any) =>
          entry.projectId?._id === filters.projectId || entry.projectId === filters.projectId
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
          return entryDate <= endDate;
        });
      }

      // Apply client-side search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        fetchedEntries = fetchedEntries.filter((entry: any) => {
          const projectName = entry.projectId?.projectName || entry.projectName || "";
          const description = entry.description || entry.notes || "";
          return projectName.toLowerCase().includes(query) || description.toLowerCase().includes(query);
        });
      }

      // Apply client-side sorting
      fetchedEntries = sortEntries(fetchedEntries, sortField, sortOrder);

      setEntries(fetchedEntries);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load time entries");
    } finally {
      setLoading(false);
    }
  };

  const sortEntries = (
    entries: TimeEntry[],
    field: SortField,
    order: SortOrder,
  ): TimeEntry[] => {
    const sorted = [...entries].sort((a: any, b: any) => {
      let comparison = 0;

      switch (field) {
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
          const projectA = (
            a.projectId?.projectName ||
            a.projectName ||
            ""
          ).toLowerCase();
          const projectB = (
            b.projectId?.projectName ||
            b.projectName ||
            ""
          ).toLowerCase();
          comparison = projectA.localeCompare(projectB);
          break;
        case "status":
          const statusA = a.endTime || a.status === "completed" ? 1 : 0;
          const statusB = b.endTime || b.status === "completed" ? 1 : 0;
          comparison = statusA - statusB;
          break;
      }

      return order === "asc" ? comparison : -comparison;
    });
    return sorted;
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

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 60) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();

    // Reset time to midnight for accurate day comparison
    const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate difference in days
    const diffTime = nowMidnight.getTime() - dateMidnight.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-us", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const fetchProjects = async () => {
    try {
      const { getMyProjects } = await import("@/lib/api");
      const response: any = await getMyProjects();
      const fetchedProjects =
        response?.findProjects || response?.projects || [];
      setProjects(fetchedProjects);
    } catch (error) {
      // error handled by api
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
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

  const handleDelete = async (entryId: string) => {
    try {
      setDeleting(true);
      await deleteTimeEntry(entryId);
      toast.success("Time entry deleted successfully!");
      setEntryToDelete(null);
      fetchEntries();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete time entry",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = (format: "csv" | "xlsx") => {
    const headers = ["Date", "Project", "Description", "Duration", "Status"];
    const rows = entries.map((entry: any) => {
      const projectName =
        entry.projectId?.projectName || entry.projectName || "Unknown";
      const description = entry.description || entry.notes || "";
      const duration = formatDuration(getEntryDuration(entry));
      const date = new Date(
        entry.startTime || entry.createdAt,
      ).toLocaleDateString();
      // Check both endTime and status field to determine if entry is completed
      const status = entry.endTime || entry.status === "completed" ? "Completed" : "Running";

      return [date, projectName, description, duration, status];
    });

    if (format === "csv") {
      // Export to CSV
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `time-entries-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Time entries exported to CSV successfully!");
    } else {
      // Export to Excel
      const worksheetData = [headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Time Entries");

      // Generate Excel file and download
      XLSX.writeFile(workbook, `time-entries-${new Date().toISOString().split("T")[0]}.xlsx`);

      toast.success("Time entries exported to Excel successfully!");
    }

    setShowExportMenu(false);
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

  const totalPages = Math.ceil(totalEntries / entriesPerPage);

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
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Time Entries
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  View and manage your tracked time
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
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showExportMenu ? "rotate-180" : ""}`} />
                </button>

                {/* Export Dropdown Menu */}
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-lg py-2 z-50 animate-fadeIn">
                    <button
                      onClick={() => handleExport("csv")}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                    >
                      <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Export as CSV</span>
                    </button>

                    <button
                      onClick={() => handleExport("xlsx")}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                    >
                      <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span>Export as Excel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div
          className="mb-6 animate-fadeInUp"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project name or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // Trigger search on debounce
                const timeout = setTimeout(() => fetchEntries(), 300);
                return () => clearTimeout(timeout);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 animate-fadeIn">
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
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 outline-none transition-all text-slate-900 dark:text-white"
                  >
                    <option value="">All Status</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
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
        </div>

        {/* Stats Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fadeInUp"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">
                  Total Entries
                </p>
                <p className="text-3xl font-black">{totalEntries}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium mb-1">
                  Page Entries
                </p>
                <p className="text-3xl font-black">{entries.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">
                  Total Hours
                </p>
                <p className="text-3xl font-black">
                  {entries.reduce(
                    (acc, entry) => acc + getEntryDuration(entry),
                    0,
                  ) /
                    3600 >
                  0
                    ? (
                        entries.reduce(
                          (acc, entry) => acc + getEntryDuration(entry),
                          0,
                        ) / 3600
                      ).toFixed(1)
                    : "0"}
                  h
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div
          className="bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden animate-fadeInUp"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <div className="col-span-3">
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
            <div className="col-span-1 text-right">Actions</div>
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
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No time entries found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {searchQuery ||
                filters.projectId ||
                filters.startDate ||
                filters.status
                  ? "Try adjusting your filters"
                  : "Start tracking time to see entries here"}
              </p>
              {!searchQuery &&
                !filters.projectId &&
                !filters.startDate &&
                !filters.status && (
                  <button
                    onClick={() => router.push("/timer")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all"
                  >
                    <Clock className="w-5 h-5" />
                    Start Tracking
                  </button>
                )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {entries.map((entry: any) => {
                const projectName =
                  entry.projectId?.projectName ||
                  entry.projectName ||
                  "Unknown Project";
                const description =
                  entry.description || entry.notes || "No description";
                const duration = getEntryDuration(entry);
                const isRunning =
                  !entry.endTime && entry.status !== "completed";
                const date = formatDate(entry.startTime || entry.createdAt);

                return (
                  <div
                    key={entry._id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all items-center group"
                  >
                    {/* Date */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900 dark:text-white font-medium">
                          {date}
                        </span>
                      </div>
                    </div>

                    {/* Project */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-purple-500" />
                        <span className="text-slate-900 dark:text-white truncate">
                          {projectName}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="col-span-3">
                      <p className="text-slate-600 dark:text-slate-400 truncate text-sm">
                        {description}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                          isRunning
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {formatDuration(duration)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-end">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isRunning && (
                          <button
                            onClick={() => router.push("/timer")}
                            className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all"
                            title="Go to Timer"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() =>
                            router.push(
                              `/projects/${entry.projectId?._id || entry.projectId}`,
                            )
                          }
                          className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all"
                          title="View Project"
                        >
                          <FolderKanban className="w-4 h-4" />
                        </button>

                        {!isRunning && (
                          <button
                            onClick={() => setEntryToDelete(entry._id)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-white/10">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                {Math.min(currentPage * entriesPerPage, totalEntries)} of{" "}
                {totalEntries} entries
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
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
                    ),
                  )}
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
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-white/[0.05] backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 animate-scaleIn">
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
              Delete Time Entry?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
              This action cannot be undone. Are you sure you want to delete this
              time entry?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setEntryToDelete(null)}
                disabled={deleting}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(entryToDelete)}
                disabled={deleting}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx global>{`
        /* Dark mode dropdown options fix */
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
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
