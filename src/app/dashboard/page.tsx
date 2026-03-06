"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getMyProjects, getTimeEntriesByProject } from "@/lib/api";
import { getAllTimeEntries } from "@/lib/api/timeEntry";
import { Project, ProjectType } from "@/lib/types";
import { TimeEntry } from "@/lib/types/timeEntry";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Clock,
  TrendingUp,
  Target,
  Zap,
  Play,
  Plus,
  Calendar,
  BarChart3,
  Activity,
  Code2,
  Briefcase,
  Timer,
  ArrowUpRight,
  MoreHorizontal,
  Building2,
  Trash2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const projectTypeOptions: { value: ProjectType; label: string; color: string }[] = [
  { value: "api_development", label: "API Development", color: "#7c3aed" },
  { value: "web_app", label: "Web App", color: "#3b82f6" },
  { value: "mobile_app", label: "Mobile App", color: "#10b981" },
  { value: "consulting", label: "Consulting", color: "#ec4899" },
  { value: "website_redesign", label: "Website Redesign", color: "#f59e0b" },
];

/**
 * Helper function to get duration in seconds from a time entry
 */
const getEntryDuration = (entry: any): number => {
  if (entry.duration && entry.duration > 0) return entry.duration;

  // Check if totalTime is already in seconds (large number) or in minutes
  if (entry.totalTime && entry.totalTime > 0) {
    if (entry.totalTime > 1000) {
      return entry.totalTime; // Already in seconds
    }
    return entry.totalTime * 60; // Convert minutes to seconds
  }

  if (entry.sessions && Array.isArray(entry.sessions) && entry.sessions.length > 0) {
    const workSessions = entry.sessions.filter((s: any) => s.type === "work");

    const totalFromSessions = workSessions.reduce((acc: number, s: any) => {
      let sessionDuration = 0;

      // First, try to use the stored duration
      if (s.duration && s.duration > 0) {
        sessionDuration = s.duration;

        // Check if duration is in milliseconds (very large number)
        if (sessionDuration > 1000000) {
          // It's in milliseconds, convert to seconds
          sessionDuration = sessionDuration / 1000;
        } else if (sessionDuration < 1000) {
          // It's likely in minutes, convert to seconds
          sessionDuration = sessionDuration * 60;
        }
        // If duration > 1000 and < 1000000, it's already in seconds
      } else if (s.startTime && s.endTime) {
        // If duration is 0 or missing, calculate from timestamps
        try {
          const start = new Date(s.startTime);
          const end = new Date(s.endTime);
          sessionDuration = (end.getTime() - start.getTime()) / 1000;
        } catch (err) {
          // Silent fail
        }
      }

      return acc + sessionDuration;
    }, 0);
    if (totalFromSessions > 0) return totalFromSessions;
  }

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

/**
 * Format duration in seconds to human readable format
 */
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return "0m";
};

/**
 * Get relative time string
 */
const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

interface Activity {
  id: string;
  type: "time" | "project_created" | "project_deleted";
  title: string;
  project: string;
  duration?: string;
  time: string;
  timestamp: number;
}

// Helper function to safely get project ID from entry
const getProjectId = (entry: any): string => {
  if (typeof entry.projectId === "object" && entry.projectId !== null) {
    return entry.projectId._id;
  }
  return entry.projectId;
};

// Helper function to safely get project name from entry
const getProjectName = (entry: any, projects: Project[]): string => {
  if (typeof entry.projectId === "object" && entry.projectId !== null) {
    return entry.projectId.projectName || "Unknown Project";
  }

  // If projectId is a string, find the project
  const projectId = entry.projectId;
  const project = projects.find(p => p._id === projectId);
  return project?.projectName || "Unknown Project";
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  changeType,
  color,
  delay,
}: {
  icon: any;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative";
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
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-xl bg-linear-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-4 relative`}
      >
        <div className="absolute inset-0 rounded-xl bg-linear-to-br opacity-50 blur-xl" />
        <Icon className="w-7 h-7 text-white relative z-10" />
      </div>

      {/* Label */}
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </p>

      {/* Value */}
      <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
        {value}
      </h3>

      {/* Change */}
      {change && (
        <div
          className={`inline-flex items-center gap-1 text-sm font-medium ${
            changeType === "positive" ? "text-emerald-500" : "text-red-500"
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          {change}
        </div>
      )}
    </div>
  );
};

const ChartCard = ({
  title,
  children,
  delay,
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
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
      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
    {children}
  </div>
);

const ActivityItem = ({
  icon: Icon,
  title,
  project,
  duration,
  time,
  color,
}: {
  icon: any;
  title: string;
  project: string;
  duration?: string;
  time: string;
  color: string;
}) => (
  <div className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-purple-200 dark:hover:border-purple-500/20 border border-transparent">
    {/* Icon */}
    <div
      className={`w-10 h-10 rounded-lg bg-linear-to-br ${color} flex items-center justify-center shrink-0`}
    >
      <Icon className="w-5 h-5 text-white" />
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
        {title}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {project}
        </span>
        {duration && (
          <>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {duration}
            </span>
          </>
        )}
      </div>
    </div>

    {/* Time */}
    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
      {time}
    </span>
  </div>
);

const ActionButton = ({
  icon: Icon,
  label,
  delay,
  href,
}: {
  icon: any;
  label: string;
  delay: number;
  href: string;
}) => (
  <button
    onClick={() => (window.location.href = href)}
    className="group flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl transition-all duration-300 hover:border-purple-400 hover:border-solid hover:bg-linear-to-br hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-500/10 dark:hover:to-pink-500/10 hover:-translate-y-1 cursor-pointer"
    style={{
      animation: `fadeInUp 0.6s ease-out ${delay}s backwards`,
    }}
  >
    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-linear-to-br group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white">
      <Icon className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-white transition-colors" />
    </div>
    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
      {label}
    </span>
  </button>
);

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [weeklyHoursData, setWeeklyHoursData] = useState<Array<{ day: string; hours: number }>>([]);
  const [projectDistributionData, setProjectDistributionData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  // Stats
  const [totalHours, setTotalHours] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && mounted) {
      fetchDashboardData();
    }
  }, [user, mounted]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch projects
      const projectsResponse: any = await getMyProjects();
      let projectsData: Project[] = [];
      if (Array.isArray(projectsResponse)) {
        projectsData = projectsResponse;
      } else if (projectsResponse?.findProjects && Array.isArray(projectsResponse.findProjects)) {
        projectsData = projectsResponse.findProjects;
      } else if (projectsResponse?.projects && Array.isArray(projectsResponse.projects)) {
        projectsData = projectsResponse.projects;
      }
      setProjects(projectsData);

      // Count active projects
      const activeCount = projectsData.filter((p: Project) => p.status === "active").length;
      setActiveProjects(activeCount);

      // Fetch time entries (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const entriesResponse = await getAllTimeEntries({ limit: 100, status: "completed" });
      const entries = entriesResponse.entries || [];
      setTimeEntries(entries);

      // Calculate total hours
      const totalSeconds = entries.reduce((acc: number, entry: TimeEntry) => acc + getEntryDuration(entry), 0);
      const hours = totalSeconds / 3600;
      setTotalHours(hours);

      // Calculate weekly hours (last 7 days)
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyData: Array<{ day: string; hours: number }> = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = days[date.getDay()];

        const dayEntries = entries.filter((entry: TimeEntry) => {
          const entryDate = new Date(entry.startTime);
          return (
            entryDate.getDate() === date.getDate() &&
            entryDate.getMonth() === date.getMonth() &&
            entryDate.getFullYear() === date.getFullYear()
          );
        });

        const dayHours = dayEntries.reduce((acc: number, entry: TimeEntry) => acc + getEntryDuration(entry), 0) / 3600;
        weeklyData.push({ day: dayName, hours: Math.round(dayHours * 10) / 10 });
      }
      setWeeklyHoursData(weeklyData);

      // Calculate weekly goal (last 7 days / 40 hours target * 100)
      const last7DaysHours = weeklyData.reduce((acc, day) => acc + day.hours, 0);
      const goalPercentage = Math.min(Math.round((last7DaysHours / 40) * 100), 100);
      setWeeklyGoal(goalPercentage);

      // Calculate project distribution
      const projectMap = new Map<string, number>();

      for (const project of projectsData) {
        try {
          const projectEntries = await getTimeEntriesByProject(project._id);
          const entries = projectEntries.entries || [];
          const hours = entries.reduce((acc: number, entry: any) => acc + getEntryDuration(entry), 0) / 3600;

          if (hours > 0) {
            const typeInfo = projectTypeOptions.find(opt => opt.value === project.projectType);
            const label = typeInfo?.label || "Other";
            const currentHours = projectMap.get(label) || 0;
            projectMap.set(label, currentHours + hours);
          }
        } catch {
          // Skip if failed to fetch entries for project
        }
      }

      const distributionData = Array.from(projectMap.entries()).map(([name, hours]) => {
        const typeInfo = projectTypeOptions.find(opt => opt.label === name);
        return {
          name,
          value: Math.round(hours * 10) / 10,
          color: typeInfo?.color || "#7c3aed"
        };
      }).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 projects

      setProjectDistributionData(distributionData);

      // Prepare activities from time entries
      const timeActivities: Activity[] = entries.slice(0, 20).map((entry: TimeEntry) => {
        return {
          id: entry._id,
          type: "time" as const,
          title: entry.description || "Time entry",
          project: getProjectName(entry, projectsData),
          duration: formatDuration(getEntryDuration(entry)),
          time: getRelativeTime(entry.createdAt),
          timestamp: new Date(entry.createdAt).getTime()
        };
      });

      // Prepare activities from project creation
      const projectActivities: Activity[] = projectsData.slice(0, 20).map((project: Project) => {
        return {
          id: `project-${project._id}`,
          type: "project_created" as const,
          title: `Created project "${project.projectName}"`,
          project: project.projectName,
          time: getRelativeTime(project.createdAt),
          timestamp: new Date(project.createdAt).getTime()
        };
      });

      // Merge and sort by timestamp (most recent first)
      const allActivities = [...timeActivities, ...projectActivities]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10); // Show top 10 activities

      setRecentActivities(allActivities);

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || isLoading || loading) {
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

  if (!user) return null;

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
        {/* Welcome Section */}
        <div className="mb-8 animate-slideIn">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
            Welcome back,
          </p>
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {user.fullname || user.username}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Clock}
            label="Hours Tracked"
            value={`${totalHours.toFixed(1)}h`}
            change="Last 30 days"
            changeType="positive"
            color="purple"
            delay={0.1}
          />
          <StatCard
            icon={Briefcase}
            label="Active Projects"
            value={activeProjects.toString()}
            change={`of ${projects.length} total`}
            changeType="positive"
            color="blue"
            delay={0.2}
          />
          <StatCard
            icon={Target}
            label="Weekly Goal"
            value={`${weeklyGoal}%`}
            change="40h target"
            changeType="positive"
            color="green"
            delay={0.3}
          />
          <StatCard
            icon={Activity}
            label="Total Entries"
            value={timeEntries.length.toString()}
            change="All time"
            changeType="positive"
            color="pink"
            delay={0.4}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Hours Chart */}
          <ChartCard title="Weekly Activity" delay={0.3}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyHoursData}>
                <defs>
                  <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="day"
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
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      return (
                        <div className="bg-white dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-xl">
                          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {label}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {value}h
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ stroke: "#7c3aed", strokeWidth: 2, strokeDasharray: "3 3" }}
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
          </ChartCard>

          {/* Project Distribution */}
          <ChartCard title="Project Distribution" delay={0.4}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) =>
                    `${props.name || ''} ${props.percent ? (props.percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {data.name}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {data.value} hours tracked
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ opacity: 0.3 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ActionButton icon={Play} label="Start Timer" delay={0.1} href="/timer" />
          <ActionButton icon={Plus} label="New Project" delay={0.2} href="/projects" />
          <ActionButton icon={Calendar} label="View Reports" delay={0.3} href="/reports" />
          <ActionButton icon={BarChart3} label="Analytics" delay={0.4} href="/time-entries" />
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 animate-fadeInUp">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recent Activity
            </h3>
            <a
              href="/time-entries"
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
            >
              View all
            </a>
          </div>

          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Timer className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Start tracking time to see activity here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivities.map((activity) => {
                const getIcon = () => {
                  switch (activity.type) {
                    case "time":
                      return Timer;
                    case "project_created":
                      return Plus;
                    case "project_deleted":
                      return Trash2;
                    default:
                      return Timer;
                  }
                };

                const getColor = () => {
                  switch (activity.type) {
                    case "time":
                      return "from-purple-500 to-purple-600";
                    case "project_created":
                      return "from-emerald-500 to-emerald-600";
                    case "project_deleted":
                      return "from-red-500 to-red-600";
                    default:
                      return "from-purple-500 to-purple-600";
                  }
                };

                return (
                  <ActivityItem
                    key={activity.id}
                    icon={getIcon()}
                    title={activity.title}
                    project={activity.project}
                    duration={activity.duration}
                    time={activity.time}
                    color={getColor()}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

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

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out 0.4s backwards;
        }

        .animate-slideIn {
          animation: slideIn 0.6s ease-out;
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
