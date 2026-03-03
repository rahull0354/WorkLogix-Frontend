"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Flame } from "lucide-react";
import toast from "react-hot-toast";
import { useTimerStore, fetchActiveTimeEntry, startTimeEntryAction, stopTimerAction, takeBreakAction, resumeBreakAction, completeTimerAction } from "@/lib/stores/timerStore";
import { useProjectStore } from "@/lib/stores/projectStore";
import { getMyProjects } from "@/lib/api";
import { Project } from "@/lib/types";

export default function TimerPage() {
  // Store state
  const {
    activeEntry,
    isRunning,
    isOnBreak,
    elapsedSeconds,
    breakSeconds,
    breakStartTime,
    updateElapsedSeconds,
    updateBreakSeconds,
    resetTimer,
  } = useTimerStore();

  const { projects, setProjects } = useProjectStore();

  // Local form state (only for new timer creation)
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [displayBreakSeconds, setDisplayBreakSeconds] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breakIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch recent entries from backend
  const fetchRecentEntries = async (limit: number = 10) => {
    try {
      const { getAllTimeEntries } = await import("@/lib/api");
      const response = await getAllTimeEntries({ limit, status: "completed" });
      const entries = response.entries || [];

      // Sort by endTime (most recent first)
      const sorted = entries.sort((a: any, b: any) => {
        const aTime = new Date(a.endTime || a.updatedAt).getTime();
        const bTime = new Date(b.endTime || b.updatedAt).getTime();
        return bTime - aTime;
      });

      const limited = sorted.slice(0, limit);
      setRecentEntries(limited);
    } catch (error) {
      setRecentEntries([]);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    const initData = async () => {
      setMounted(true);
      try {
        // Fetch active timer
        const activeResult = await fetchActiveTimeEntry();
        if (activeResult.success && activeResult.entry) {
          setSelectedProjectId(activeResult.entry.projectId);
          setTaskDescription(activeResult.entry.description || "");
        }

        // Fetch projects
        const projectsData: any = await getMyProjects();
        const data = Array.isArray(projectsData) ? projectsData : projectsData.findProjects || projectsData.projects || [];
        setProjects(data);

        // Fetch recent entries from backend
        fetchRecentEntries(10);
      } catch (error: any) {
        toast.error("Failed to initialize timer");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Calculate break duration after store is loaded
  useEffect(() => {
    if (!loading) {
      if (isOnBreak && breakStartTime > 0) {
        // Currently on break - calculate current break duration
        const now = Date.now();
        const currentBreakDuration = Math.floor((now - breakStartTime) / 1000);
        setDisplayBreakSeconds(breakSeconds + currentBreakDuration);
      } else if (activeEntry) {
        // Not on break but have active entry - show total break time
        setDisplayBreakSeconds(breakSeconds);
      } else {
        // No active entry
        setDisplayBreakSeconds(0);
      }
    }
  }, [loading, isOnBreak, breakStartTime, breakSeconds, activeEntry]);

  // Timer tick effect
  useEffect(() => {
    if (isRunning && !isOnBreak) {
      intervalRef.current = setInterval(() => {
        updateElapsedSeconds(elapsedSeconds + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isOnBreak, elapsedSeconds]);

  // Break timer tick effect
  useEffect(() => {
    if (isOnBreak) {
      // Calculate initial break duration
      if (breakStartTime > 0) {
        const now = Date.now();
        const currentBreakDuration = Math.floor((now - breakStartTime) / 1000);
        setDisplayBreakSeconds(breakSeconds + currentBreakDuration);
      }

      breakIntervalRef.current = setInterval(() => {
        setDisplayBreakSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (breakIntervalRef.current) {
        clearInterval(breakIntervalRef.current);
      }
      // When not on break but have active entry, show total break time from store
      if (activeEntry) {
        setDisplayBreakSeconds(breakSeconds);
      } else {
        // No active entry, reset display
        setDisplayBreakSeconds(0);
      }
    }

    return () => {
      if (breakIntervalRef.current) {
        clearInterval(breakIntervalRef.current);
      }
    };
  }, [isOnBreak, isRunning, breakStartTime, breakSeconds, activeEntry]);

  const handleStart = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }

    const result = await startTimeEntryAction(selectedProjectId, taskDescription);
    if (result.success) {
      toast.success("Timer started!");
      setDisplayBreakSeconds(0); // Reset break time display
    } else {
      toast.error(result.error || "Failed to start timer");
    }
  };

  const handlePause = async () => {
    if (!activeEntry) {
      toast.error("No active timer to pause");
      return;
    }

    const result = await takeBreakAction();

    if (result.success) {
      toast.success("Break started!");
      setDisplayBreakSeconds(0); // Reset break display counter (store will track total)
    } else {
      toast.error(result.error || "Failed to take break");
    }
  };

  const handleResume = async () => {
    const result = await resumeBreakAction();
    if (result.success) {
      toast.success("Timer resumed!");
    } else {
      toast.error(result.error || "Failed to resume timer");
    }
  };

  const handleStop = async () => {
    if (confirm("Are you sure you want to stop the timer?")) {
      const result = await stopTimerAction();
      if (result.success) {
        toast.success("Timer stopped!");
        // Don't reset form - user might want to resume
      } else {
        toast.error(result.error || "Failed to stop timer");
      }
    }
  };

  const handleComplete = async () => {
    if (confirm("Are you sure you want to complete this time entry?")) {
      const result = await completeTimerAction();
      if (result.success) {
        toast.success("Time entry completed!");

        // Fetch recent entries from backend
        fetchRecentEntries(10);

        setSelectedProjectId("");
        setTaskDescription("");
      } else {
        toast.error(result.error || "Failed to complete time entry");
      }
    }
  };

  const hrs = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);
  const secs = elapsedSeconds % 60;

  const progress = (secs / 60) * 100;

  const getSelectedProject = (): Project | undefined => {
    return projects.find((p) => p._id === selectedProjectId);
  };

  const getProjectById = (id: string): Project | undefined => {
    return projects.find((p) => p._id === id);
  };

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const getProjectTypeIcon = (type: string) => {
    const icons: { [key: string]: { icon: string; color: string } } = {
      api_development: { icon: "🔧", color: "from-emerald-500 to-emerald-600" },
      web_app: { icon: "⚡", color: "from-purple-500 to-purple-600" },
      mobile_app: { icon: "📱", color: "from-pink-500 to-pink-600" },
      consulting: { icon: "💼", color: "from-blue-500 to-blue-600" },
      website_redesign: { icon: "🌐", color: "from-cyan-500 to-cyan-600" },
    };
    return icons[type] || { icon: "📁", color: "from-slate-500 to-slate-600" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed top-0 right-0 w-125 h-125 bg-linear-to-br from-purple-500 to-pink-500 rounded-full blur-[100px] opacity-[0.08] pointer-events-none animate-float" style={{ animationDelay: "0s" }} />
      <div className="fixed bottom-0 left-0 w-125 h-125 bg-linear-to-br from-blue-500 to-purple-500 rounded-full blur-[100px] opacity-[0.08] pointer-events-none animate-float" style={{ animationDelay: "-10s" }} />

      {/* Animated Particle Background */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 dark:bg-purple-400 rounded-full animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-slideIn">
          <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-purple-100/50 dark:bg-purple-500/10 backdrop-blur-sm rounded-full border border-purple-200/50 dark:border-purple-500/20">
            <Flame className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Focus Mode</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 mb-4">
            Timer
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Track your productivity with style. Every second counts towards your goals.
          </p>
        </div>

        {/* Main Timer Display */}
        <div className="mb-12 animate-scaleIn">
          <div className="relative max-w-2xl mx-auto">
            {/* Glow Effect */}
            <div
              className={`absolute inset-0 rounded-full blur-3xl transition-all duration-500 ${
                isRunning && !isOnBreak
                  ? "bg-purple-500/20 dark:bg-purple-500/30 scale-110"
                  : "bg-purple-500/0"
              }`}
            />

            {/* Main Timer Circle Container */}
            <div className="relative flex items-center justify-center gap-8">
              {/* Main Timer Circle */}
              <div className="relative w-96 h-96 md:w-md md:h-112 mx-auto">
              {/* Glow */}
              <div
                className={`absolute inset-0 rounded-full blur-2xl transition-all duration-300 ${
                  isRunning && !isOnBreak ? "bg-pink-500/10 dark:bg-pink-500/20" : ""
                }`}
              />

              {/* SVG Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="rgba(255, 255, 255, 0.8)"
                  stroke="rgba(139, 92, 246, 0.1)"
                  strokeWidth="1"
                  className="dark:fill-[rgba(15,23,42,0.5)]"
                />

                {/* Progress Circle - Seconds */}
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
                  className="transition-all duration-300 ease-out"
                  strokeLinecap="round"
                  style={{
                    filter: isRunning && !isOnBreak ? "drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))" : "",
                  }}
                />

                {/* Progress Gradient */}
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Inner Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* Work Time Label */}
                {activeEntry && (
                  <div className="text-[8px] md:text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider mb-1">
                    Work Time
                  </div>
                )}

                {/* HH:MM:SS Display */}
                <div className="flex items-center gap-2 mb-3">
                  {/* Hours */}
                  <div
                    className={`text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-linear-to-br from-purple-600 to-pink-600 dark:from-purple-300 dark:to-pink-300 transition-all duration-200 ${
                      isRunning && !isOnBreak ? "scale-110" : "scale-100"
                    }`}
                  >
                    {String(hrs).padStart(2, "0")}
                  </div>

                  {/* Colon */}
                  <div className="text-4xl md:text-5xl font-bold text-purple-600/50 dark:text-purple-300/50">:</div>

                  {/* Minutes */}
                  <div
                    className={`text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-linear-to-br from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 transition-all duration-200 ${
                      isRunning && !isOnBreak ? "scale-110" : "scale-100"
                    }`}
                  >
                    {String(mins).padStart(2, "0")}
                  </div>

                  {/* Colon */}
                  <div className="text-4xl md:text-5xl font-bold text-purple-600/50 dark:text-purple-300/50">:</div>

                  {/* Seconds */}
                  <div
                    className={`text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-linear-to-br from-slate-800 to-pink-600 dark:from-white dark:to-pink-200 transition-all duration-200 ${
                      isRunning && !isOnBreak ? "scale-110 animate-pulse" : "scale-100"
                    }`}
                  >
                    {String(secs).padStart(2, "0")}
                  </div>
                </div>

                {/* Status */}
                {isOnBreak && (
                  <div className="mt-2 px-3 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-semibold">
                    On Break
                  </div>
                )}
                {!isRunning && activeEntry && !isOnBreak && (
                  <div className="mt-2 px-3 py-1 bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400 rounded-full text-xs font-semibold">
                    Stopped
                  </div>
                )}

                {/* Labels */}
                <div className="flex items-center gap-4 text-xs text-purple-700/80 dark:text-purple-300/80 tracking-widest uppercase mt-2">
                  <span>Hr</span>
                  <span>Min</span>
                  <span>Sec</span>
                </div>
              </div>
            </div>

            {/* Mini Break Timer Circle - Shows when there's an active entry */}
            {activeEntry && (
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-36 h-36 z-20">
                {/* Break Glow - Only animate when on break */}
                <div className={`absolute inset-0 rounded-full bg-amber-500/30 ${isOnBreak ? 'animate-pulse' : ''}`} />

                {/* Break Glow Effect */}
                <div className={`absolute inset-0 rounded-full blur-xl bg-amber-500/40 ${isOnBreak ? 'animate-pulse' : 'opacity-50'}`} />

                {/* SVG Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="rgba(255, 255, 255, 0.95)"
                    stroke="rgba(245, 158, 11, 0.3)"
                    strokeWidth="2"
                    className="dark:fill-[rgba(15,23,42,0.9)]"
                  />

                  {/* Progress Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="url(#breakGradient)"
                    strokeWidth="2"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - (displayBreakSeconds % 60) / 60)}`}
                    className="transition-all duration-300 ease-out"
                    strokeLinecap="round"
                  />

                  {/* Break Gradient */}
                  <defs>
                    <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Break Time Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {String(Math.floor(displayBreakSeconds / 60)).padStart(2, "0")}
                  </div>
                  <div className="text-[8px] md:text-[10px] text-amber-700 dark:text-amber-500 font-semibold uppercase tracking-wider">
                    {isOnBreak ? 'Break' : 'Total Break'}
                  </div>
                  <div className="text-xs md:text-sm text-amber-600 dark:text-amber-400 font-medium">
                    {String(displayBreakSeconds % 60).padStart(2, "0")}s
                  </div>
                </div>

                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full">
                  <div className="w-8 h-0.5 bg-linear-to-l from-amber-400 to-transparent opacity-50" />
                </div>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-12 animate-fadeIn">
          {isOnBreak ? (
            <>
              {/* Currently on break - show Resume button */}
              <button
                onClick={handleResume}
                className="group relative px-10 py-4 bg-linear-to-r from-violet-500 to-purple-500 rounded-2xl font-bold text-lg text-white shadow-lg hover:shadow-violet-500/20 hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2 relative z-10">
                  <Play className="w-5 h-5" fill="currentColor" />
                  Resume
                </span>
              </button>
              <button
                onClick={handleStop}
                className="group relative px-10 py-4 bg-linear-to-r from-rose-500 to-pink-600 rounded-2xl font-bold text-lg text-white shadow-lg hover:shadow-rose-500/20 hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2 relative z-10">
                  <Square className="w-5 h-5" fill="currentColor" />
                  Stop Timer
                </span>
              </button>
            </>
          ) : isRunning ? (
            <>
              {/* Timer is running - show Take Break and Stop Timer buttons */}
              <button
                onClick={handlePause}
                className="group relative px-10 py-4 bg-linear-to-r from-violet-500 to-indigo-500 rounded-2xl font-bold text-lg text-white shadow-lg hover:shadow-violet-500/20 hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2 relative z-10">
                  <Pause className="w-5 h-5" fill="currentColor" />
                  Take Break
                </span>
              </button>
              <button
                onClick={handleStop}
                className="group relative px-10 py-4 bg-linear-to-r from-rose-500 to-pink-600 rounded-2xl font-bold text-lg text-white shadow-lg hover:shadow-rose-500/20 hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2 relative z-10">
                  <Square className="w-5 h-5" fill="currentColor" />
                  Stop Timer
                </span>
              </button>
            </>
          ) : activeEntry ? (
            <>
              {/* Timer was stopped but not completed - can resume or complete */}
              <button
                onClick={handleStart}
                className="group relative px-10 py-4 bg-linear-to-r from-violet-500 to-purple-500 rounded-2xl font-bold text-lg text-white shadow-lg hover:shadow-violet-500/20 hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2 relative z-10">
                  <Play className="w-5 h-5" fill="currentColor" />
                  Resume
                </span>
              </button>
              <button
                onClick={handleComplete}
                className="group relative px-10 py-4 bg-linear-to-r from-emerald-500 to-green-600 rounded-2xl font-bold text-lg text-white shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2 relative z-10">
                  <Square className="w-5 h-5" fill="currentColor" />
                  Complete
                </span>
              </button>
            </>
          ) : (
            <>
              {/* No active timer - show Start button */}
              <button
                onClick={handleStart}
                disabled={!selectedProjectId}
                className="group relative px-12 py-5 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-lg text-white shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="flex items-center gap-3 relative z-10">
                  <Play className="w-6 h-6" fill="currentColor" />
                  Start Tracking
                </span>
                <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 transition-opacity blur-md"></div>
              </button>
            </>
          )}
        </div>

        {/* Project Selection */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 tracking-wide uppercase">
            Select Project
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {projects.slice(0, 4).map((proj) => {
              const { icon, color } = getProjectTypeIcon(proj.projectType);
              return (
                <button
                  key={proj._id}
                  onClick={() => setSelectedProjectId(proj._id)}
                  disabled={isRunning}
                  className={`group relative px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedProjectId === proj._id
                      ? "bg-linear-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400 shadow-lg shadow-purple-500/20 scale-105"
                      : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-500/50 hover:bg-slate-50 dark:hover:bg-white/10"
                  } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="text-xl mb-1 block">{icon}</span>
                  <span className={`text-xs truncate ${
                    selectedProjectId === proj._id ? "text-purple-700 dark:text-purple-200" : "text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-300"
                  }`}>
                    {proj.projectName}
                  </span>
                  {selectedProjectId === proj._id && (
                    <div className="absolute inset-0 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 opacity-10"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Task Input */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: "0.3s" }}>
          <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 tracking-wide uppercase">
            What are you working on?
          </label>
          <input
            type="text"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="e.g., Implementing user authentication feature"
            disabled={isRunning}
            className="w-full px-5 py-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
          <div className="bg-white dark:bg-white/5 backdrop-blur border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-center shadow-sm dark:shadow-none">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{hrs.toString().padStart(2, "0")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hours</div>
          </div>
          <div className="bg-white dark:bg-white/5 backdrop-blur border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-center shadow-sm dark:shadow-none">
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-1">{mins.toString().padStart(2, "0")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Minutes</div>
          </div>
          <div className="bg-white dark:bg-white/5 backdrop-blur border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-center shadow-sm dark:shadow-none">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">{secs.toString().padStart(2, "0")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Seconds</div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="bg-white dark:bg-white/5 backdrop-blur border border-slate-200 dark:border-white/10 rounded-2xl p-6 animate-fadeIn shadow-sm dark:shadow-none" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Recent Entries</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your latest time tracking sessions</p>
            </div>
          </div>

          <div className="space-y-3">
            {recentEntries.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No recent entries yet. Start tracking your time!
              </div>
            ) : (
              recentEntries.map((entry) => {
                // Handle projectId - it might be a string ID or an object with _id
                const projectId = typeof entry.projectId === 'string'
                  ? entry.projectId
                  : entry.projectId?._id;

                const project = getProjectById(projectId);
                const { icon, color } = getProjectTypeIcon(project?.projectType || "");

                // Calculate duration - try multiple fields
                let duration = 0;
                if (entry.duration && entry.duration > 0) {
                  duration = entry.duration;
                } else if (entry.totalTime && entry.totalTime > 0) {
                  // totalTime is in minutes, convert to seconds
                  duration = entry.totalTime * 60;
                } else if (entry.sessions && Array.isArray(entry.sessions)) {
                  // Sum up work sessions
                  duration = entry.sessions
                    .filter((s: any) => s.type === 'work')
                    .reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
                } else if (entry.startTime && entry.endTime) {
                  // Calculate from start and end times
                  duration = Math.floor((new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / 1000);
                }

                return (
                  <div key={entry._id} className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-500/50 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${color} flex items-center justify-center text-xl`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-white font-medium truncate">{entry.description || "No description"}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{project?.projectName || "Unknown Project"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatDuration(duration)}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(entry.endTime || entry.startTime)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
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

        @keyframes float-particle {
          0%,
          100% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(0, -100vh);
            opacity: 0;
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-particle {
          animation: float-particle 15s ease-in-out infinite;
        }

        .animate-slideIn {
          animation: slideIn 0.6s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out 0.2s backwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out backwards;
        }
      `}</style>
    </div>
  );
}
