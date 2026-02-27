"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

// Mock data for demonstration
const weeklyHoursData = [
  { day: "Mon", hours: 6.5, productivity: 85 },
  { day: "Tue", hours: 7.2, productivity: 92 },
  { day: "Wed", hours: 5.8, productivity: 78 },
  { day: "Thu", hours: 8.1, productivity: 95 },
  { day: "Fri", hours: 7.5, productivity: 88 },
  { day: "Sat", hours: 3.2, productivity: 70 },
  { day: "Sun", hours: 2.1, productivity: 65 },
];

const projectDistributionData = [
  { name: "Web App", value: 35, color: "#7c3aed" },
  { name: "Mobile App", value: 28, color: "#3b82f6" },
  { name: "API Dev", value: 22, color: "#10b981" },
  { name: "Consulting", value: 15, color: "#ec4899" },
];

const recentActivities = [
  {
    id: 1,
    type: "time",
    title: "Worked on WorkLogix Dashboard",
    project: "WorkLogix",
    duration: "4h 32m",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "project",
    title: "Created new project",
    project: "E-commerce API",
    duration: null,
    time: "5 hours ago",
  },
  {
    id: 3,
    type: "time",
    title: "Fixed authentication bug",
    project: "Client Portal",
    duration: "2h 15m",
    time: "Yesterday",
  },
  {
    id: 4,
    type: "time",
    title: "Code review & optimization",
    project: "Mobile App",
    duration: "3h 45m",
    time: "Yesterday",
  },
];

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
}: {
  icon: any;
  label: string;
  delay: number;
}) => (
  <button
    className="group flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl transition-all duration-300 hover:border-purple-400 hover:border-solid hover:bg-linear-to-br hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-500/10 dark:hover:to-pink-500/10 hover:-translate-y-1"
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
            value="40.5h"
            change="+12.5%"
            changeType="positive"
            color="purple"
            delay={0.1}
          />
          <StatCard
            icon={Briefcase}
            label="Active Projects"
            value="8"
            change="+2 this week"
            changeType="positive"
            color="blue"
            delay={0.2}
          />
          <StatCard
            icon={Target}
            label="Weekly Goal"
            value="81%"
            change="+8.3%"
            changeType="positive"
            color="green"
            delay={0.3}
          />
          <StatCard
            icon={Zap}
            label="Productivity"
            value="92"
            change="+5.2%"
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
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
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
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
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
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ActionButton icon={Play} label="Start Timer" delay={0.1} />
          <ActionButton icon={Plus} label="New Project" delay={0.2} />
          <ActionButton icon={Calendar} label="View Reports" delay={0.3} />
          <ActionButton icon={BarChart3} label="Analytics" delay={0.4} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 animate-fadeInUp">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recent Activity
            </h3>
            <a
              href="#"
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
            >
              View all
            </a>
          </div>

          <div className="space-y-2">
            {recentActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                icon={activity.type === "time" ? Timer : Briefcase}
                title={activity.title}
                project={activity.project}
                duration={activity.duration}
                time={activity.time}
                color={
                  activity.type === "time"
                    ? "from-purple-500 to-purple-600"
                    : "from-blue-500 to-blue-600"
                }
              />
            ))}
          </div>
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
