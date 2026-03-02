"use client";

import {
  changeProjectStatus,
  createProject,
  deleteProject,
  getMyProjects,
  updateProject,
  getTimeEntriesByProject,
} from "@/lib/api";
import { Project, ProjectWithStats, ProjectType } from "@/lib/types";
import {
  Building2,
  Clock,
  DollarSign,
  Edit2,
  FolderOpen,
  Plus,
  Trash2,
  Sparkles,
  Target,
  Zap,
  Calendar,
  TrendingUp,
  X,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const projectTypeOptions: { value: ProjectType; label: string }[] = [
  { value: "api_development", label: "API Development" },
  { value: "web_app", label: "Web App" },
  { value: "mobile_app", label: "Mobile App" },
  { value: "consulting", label: "Consulting" },
  { value: "website_redesign", label: "Website Redesign" },
];

const getStatusInfo = (status: string) => {
  switch (status) {
    case "active":
      return {
        label: "Active",
        color: "from-emerald-500 to-emerald-600",
        bg: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
        bgSoft: "bg-emerald-50 dark:bg-emerald-500/10",
      };
    case "hold":
      return {
        label: "On Hold",
        color: "from-amber-500 to-amber-600",
        bg: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400",
        bgSoft: "bg-amber-50 dark:bg-amber-500/10",
      };
    case "completed":
      return {
        label: "Completed",
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-500",
        text: "text-blue-600 dark:text-blue-400",
        bgSoft: "bg-blue-50 dark:bg-blue-500/10",
      };
    default:
      return {
        label: "Active",
        color: "from-emerald-500 to-emerald-600",
        bg: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
        bgSoft: "bg-emerald-50 dark:bg-emerald-500/10",
      };
  }
};

const getProjectTypeIcon = (type: ProjectType) => {
  switch (type) {
    case "api_development":
      return <Zap className="w-5 h-5" />;
    case "web_app":
      return <Target className="w-5 h-5" />;
    case "mobile_app":
      return <Sparkles className="w-5 h-5" />;
    case "consulting":
      return <TrendingUp className="w-5 h-5" />;
    case "website_redesign":
      return <Calendar className="w-5 h-5" />;
    default:
      return <Target className="w-5 h-5" />;
  }
};

/**
 * Helper function to get duration in seconds from a time entry
 * Handles different backend response formats
 */
const getEntryDuration = (entry: any): number => {
  // Priority 1: Try the duration field
  if (entry.duration && entry.duration > 0) {
    return entry.duration;
  }

  // Priority 2: Check totalTime field (might be in minutes)
  if (entry.totalTime && entry.totalTime > 0) {
    return entry.totalTime * 60;
  }

  // Priority 3: Sum work sessions from sessions array
  if (entry.sessions && Array.isArray(entry.sessions) && entry.sessions.length > 0) {
    const workSessions = entry.sessions.filter((s: any) => s.type === 'work');
    const totalFromSessions = workSessions.reduce((acc: number, s: any) => {
      return acc + (s.duration || 0);
    }, 0);

    if (totalFromSessions > 0) {
      return totalFromSessions;
    }
  }

  // Priority 4: Calculate from timestamps
  if (entry.startTime && entry.endTime) {
    try {
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      return (end.getTime() - start.getTime()) / 1000;
    } catch {
      // Silent fail
    }
  }

  return 0;
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    projectName: "",
    clientName: "",
    hourlyRate: "",
    description: "",
    projectType: "web_app" as ProjectType,
  });

  useEffect(() => {
    setMounted(true);
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response: any = await getMyProjects();

      let data: ProjectWithStats[] = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (response?.findProjects && Array.isArray(response.findProjects)) {
        data = response.findProjects;
      } else if (response?.projects && Array.isArray(response.projects)) {
        data = response.projects;
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (response?.data?.projects && Array.isArray(response.data.projects)) {
        data = response.data.projects;
      }

      // Fetch time entries for each project and calculate stats
      const projectsWithStats = await Promise.all(
        data.map(async (project: any) => {
          try {
            const entriesResponse = await getTimeEntriesByProject(project._id);
            const entries = entriesResponse.entries || [];

            // Calculate total hours from entries
            const totalSeconds = entries.reduce((acc: number, entry: any) => {
              return acc + getEntryDuration(entry);
            }, 0);

            const totalHours = totalSeconds / 3600;
            const totalEarnings = totalHours * (project.hourlyRate || 0);

            return {
              ...project,
              totalHours,
              totalEarnings,
              totalEntries: entries.length,
            } as ProjectWithStats;
          } catch (error) {
            // If fetching entries fails, return project with 0 stats
            return {
              ...project,
              totalHours: 0,
              totalEarnings: 0,
              totalEntries: 0,
            } as ProjectWithStats;
          }
        })
      );

      setProjects(projectsWithStats);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    setFormData({
      projectName: "",
      clientName: "",
      hourlyRate: "",
      description: "",
      projectType: "web_app",
    });
    setShowModal(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      projectName: project.projectName || '',
      clientName: project.clientName || '',
      hourlyRate: (project.hourlyRate || 0).toString(),
      description: project.description || '',
      projectType: project.projectType || 'web_app',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id);
        toast.success("Project Deleted Successfully!");
        setProjects(projects.filter((p) => p._id !== id));
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to delete project.",
        );
      }
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "active" | "hold" | "completed",
  ) => {
    try {
      await changeProjectStatus(id, { status });
      toast.success(`Project marked as ${status}`);
      setProjects(projects.map((p) => (p._id === id ? { ...p, status } : p)));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      if (editingProject) {
        const response: any = await updateProject(editingProject._id, projectData);

        toast.success("Project Updated Successfully!");
        await fetchProjects();
      } else {
        const response: any = await createProject(projectData);
        toast.success("Project created successfully!");
        await fetchProjects();
      }
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  if (!mounted || loading) {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div
        className="fixed top-0 right-0 w-125 h-125 bg-linear-to-br from-purple-500 to-pink-500 rounded-full blur-[100px] opacity-[0.08] pointer-events-none animate-float"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="fixed bottom-0 left-0 w-125 h-125 bg-linear-to-br from-blue-500 to-purple-500 rounded-full blur-[100px] opacity-[0.08] pointer-events-none animate-float"
        style={{ animationDelay: "-10s" }}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-linear-to-br from-emerald-500 to-blue-500 rounded-full blur-[100px] opacity-[0.06] pointer-events-none animate-float"
        style={{ animationDelay: "-5s" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-slideIn">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Projects
              </h1>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-15">
            Manage your projects and track time across different work areas.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div
            className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-200 dark:hover:border-purple-500/30"
            style={{ animation: "fadeInUp 0.6s ease-out 0.1s backwards" }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-purple-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 opacity-50 blur-xl" />
                <FolderOpen className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Total Projects
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {Array.isArray(projects) ? projects.length : 0}
                </h3>
              </div>
            </div>
          </div>

          <div
            className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-200 dark:hover:border-purple-500/30"
            style={{ animation: "fadeInUp 0.6s ease-out 0.2s backwards" }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-pink-500 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-pink-500 to-pink-600 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-pink-500 to-pink-600 opacity-50 blur-xl" />
                <Clock className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Total Hours
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {(Array.isArray(projects)
                    ? projects.filter(Boolean).reduce((acc, p) => acc + (p?.totalHours || 0), 0)
                    : 0
                  ).toFixed(1)}
                  h
                </h3>
              </div>
            </div>
          </div>

          <div
            className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-200 dark:hover:border-purple-500/30"
            style={{ animation: "fadeInUp 0.6s ease-out 0.3s backwards" }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-violet-500 to-violet-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-violet-500 to-violet-600 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-violet-500 to-violet-600 opacity-50 blur-xl" />
                <DollarSign className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Total Earnings
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  $
                  {(Array.isArray(projects)
                    ? projects.filter(Boolean).reduce((acc, p) => acc + (p?.totalEarnings || 0), 0)
                    : 0
                  ).toFixed(2)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Create Button & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8" style={{ animation: "fadeInUp 0.6s ease-out 0.4s backwards" }}>
          <button
            onClick={handleCreate}
            className="group flex items-center gap-2.5 px-5 py-3 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] text-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span>Create New Project</span>
          </button>

          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name, client, or type..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        {!Array.isArray(projects) || projects.length === 0 ? (
          <div
            className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-16 text-center"
            style={{ animation: "fadeInUp 0.6s ease-out 0.5s backwards" }}
          >
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No Projects Yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Create your first project to start tracking time!
            </p>
          </div>
        ) : (
          <>
            {/* Filtered projects */}
            {(() => {
              const filteredProjects = projects.filter(Boolean).filter((project) => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  project?.projectName?.toLowerCase().includes(query) ||
                  project?.clientName?.toLowerCase().includes(query) ||
                  project?.description?.toLowerCase().includes(query) ||
                  projectTypeOptions.find(opt => opt.value === project?.projectType)?.label?.toLowerCase().includes(query)
                );
              });

              if (filteredProjects.length === 0 && searchQuery) {
                return (
                  <div
                    className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-16 text-center"
                    style={{ animation: "fadeInUp 0.6s ease-out 0.5s backwards" }}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      No projects found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Try adjusting your search query
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project, index) => {
              const statusInfo = getStatusInfo(project?.status || 'active');
              return (
                <div
                  key={project._id || index}
                  onClick={() => handleViewProject(project._id!)}
                  className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-200 dark:hover:border-purple-500/30 cursor-pointer"
                  style={{ animation: `fadeInUp 0.6s ease-out ${0.5 + index * 0.1}s backwards` }}
                >
                  {/* Gradient Top Border */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${statusInfo.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />

                  {/* Content */}
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg ${statusInfo.bgSoft} ${statusInfo.text} border border-current/20`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.bg} animate-pulse`} />
                            {statusInfo.label}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {project?.projectName || 'Untitled Project'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Building2 className="w-4 h-4" />
                          {project?.clientName || 'Unknown Client'}
                        </div>
                      </div>

                      {/* Actions - Stop propagation to prevent card click */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(project)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all"
                          title="Edit Project"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project._id!)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-linear-to-br ${statusInfo.color} bg-opacity-10 mb-4`}>
                      <div className={`w-8 h-8 rounded-lg bg-linear-to-br ${statusInfo.color} flex items-center justify-center`}>
                        <div className="text-white">
                          {getProjectTypeIcon(project?.projectType || 'web_app')}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {projectTypeOptions.find(opt => opt.value === project?.projectType)?.label || 'Web App'}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 line-clamp-2 min-h-10">
                      {project?.description || 'No description'}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 text-center border border-slate-100 dark:border-white/10">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                          {(project?.totalHours || 0).toFixed(1)}h
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Hours
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 text-center border border-slate-100 dark:border-white/10">
                        <p className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">
                          ${(project?.totalEarnings || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Earnings
                        </p>
                      </div>
                    </div>

                    {/* Rate */}
                    <div className="flex items-center justify-between text-sm mb-4 px-1">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Hourly Rate</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${project?.hourlyRate || 0}/hr
                      </span>
                    </div>

                    {/* Status Actions */}
                    <div className="flex gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                      {(project?.status || 'active') !== "active" && (
                        <button
                          onClick={() => handleStatusChange(project._id!, "active")}
                          className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 transition-all hover:-translate-y-0.5"
                        >
                          Active
                        </button>
                      )}
                      {(project?.status || 'active') !== "hold" && (
                        <button
                          onClick={() => handleStatusChange(project._id!, "hold")}
                          className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 transition-all hover:-translate-y-0.5"
                        >
                          Hold
                        </button>
                      )}
                      {(project?.status || 'active') !== "completed" && (
                        <button
                          onClick={() => handleStatusChange(project._id!, "completed")}
                          className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 transition-all hover:-translate-y-0.5"
                        >
                          Complete
                        </button>
                      )}
                    </div>

                    {/* View Details Indicator */}
                    <div className="text-center">
                      <span className="text-xs text-purple-400 dark:text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                        View Details
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            );
          })()}
        </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 p-6 border-b border-slate-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${editingProject ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-pink-500'} flex items-center justify-center`}>
                    {editingProject ? (
                      <Edit2 className="w-5 h-5 text-white" />
                    ) : (
                      <Plus className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {editingProject ? "Edit Project" : "Create New Project"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
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
                      projectType: e.target.value as ProjectType,
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-slate-900 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-900 [&>option]:text-slate-900 dark:[&>option]:text-slate-100"
                >
                  {projectTypeOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    >
                      {option.label}
                    </option>
                  ))}
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
                  onClick={() => setShowModal(false)}
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
                      {editingProject ? "Updating..." : "Creating..."}
                    </span>
                  ) : editingProject ? (
                    "Update Project"
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Animations */}
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
      ` }</style>
    </div>
  );
}
