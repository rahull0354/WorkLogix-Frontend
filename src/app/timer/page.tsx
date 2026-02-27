"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Flame } from "lucide-react";

export default function TimerPage() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
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
  }, [isRunning, isPaused]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setProject("");
    setTask("");
  };

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const progress = (secs / 60) * 100;

  const quickProjects = [
    { name: "WorkLogix", color: "#7c3aed", icon: "⚡" },
    { name: "Client Website", color: "#3b82f6", icon: "🌐" },
    { name: "API Development", color: "#10b981", icon: "🔧" },
    { name: "Mobile App", color: "#ec4899", icon: "📱" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-slate-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Particle Background */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden">
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

      {/* linear Mesh Background */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 via-transparent to-pink-500/5 dark:from-purple-500/5 dark:via-transparent dark:to-pink-500/5 animate-linear-shift" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-slideIn">
          <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-purple-100/50 dark:bg-purple-500/10 backdrop-blur-sm rounded-full border border-purple-200/50 dark:border-purple-500/20">
            <Flame className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Focus Mode</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 mb-4">
            WorkLogix
          </h1>
          <p className="text-xl text-slate-600 dark:text-purple-200/80 max-w-2xl mx-auto">
            Track your productivity with style. Every second counts towards your goals.
          </p>
        </div>

        {/* Main Timer Display */}
        <div className="mb-12 animate-scaleIn">
          <div className="relative max-w-2xl mx-auto">
            {/* Glow Effect */}
            <div
              className={`absolute inset-0 rounded-full blur-3xl transition-all duration-500 ${
                isRunning && !isPaused
                  ? "bg-purple-500/20 dark:bg-purple-500/30 scale-110"
                  : "bg-purple-500/0"
              }`}
            />

            {/* Main Timer Circle */}
            <div className="relative w-96 h-96 md:w-md md:h-112 mx-auto">
              {/* Glow */}
              <div
                className={`absolute inset-0 rounded-full blur-2xl transition-all duration-300 ${
                  isRunning && !isPaused ? "bg-pink-500/10 dark:bg-pink-500/20" : ""
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
                  stroke="url(#progresslinear)"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
                  className="transition-all duration-300 ease-out"
                  strokeLinecap="round"
                  style={{
                    filter: isRunning && !isPaused ? "drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))" : "",
                  }}
                />

                {/* Progress linear */}
                <defs>
                  <linearGradient id="progresslinear" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Inner Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* HH:MM:SS Display */}
                <div className="flex items-center gap-2 mb-3">
                  {/* Hours */}
                  <div
                    className={`text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-linear-to-br from-purple-600 to-pink-600 dark:from-purple-300 dark:to-pink-300 transition-all duration-200 ${
                      isRunning && !isPaused ? "scale-110" : "scale-100"
                    }`}
                  >
                    {String(hrs).padStart(2, "0")}
                  </div>

                  {/* Colon */}
                  <div className="text-4xl md:text-5xl font-bold text-purple-600/50 dark:text-purple-300/50">:</div>

                  {/* Minutes */}
                  <div
                    className={`text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-linear-to-br from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 transition-all duration-200 ${
                      isRunning && !isPaused ? "scale-110" : "scale-100"
                    }`}
                  >
                    {String(mins).padStart(2, "0")}
                  </div>

                  {/* Colon */}
                  <div className="text-4xl md:text-5xl font-bold text-purple-600/50 dark:text-purple-300/50">:</div>

                  {/* Seconds */}
                  <div
                    className={`text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-linear-to-br from-slate-800 to-pink-600 dark:from-white dark:to-pink-200 transition-all duration-200 ${
                      isRunning && !isPaused ? "scale-110 animate-pulse" : "scale-100"
                    }`}
                  >
                    {String(secs).padStart(2, "0")}
                  </div>
                </div>

                {/* Labels */}
                <div className="flex items-center gap-4 text-xs text-purple-700/80 dark:text-purple-300/80 tracking-widest uppercase">
                  <span>Hr</span>
                  <span>Min</span>
                  <span>Sec</span>
                </div>
              </div>
            </div>

            {/* Decorative Corner Marks */}
            <div className="absolute top-4 left-4 text-purple-300 dark:text-purple-500/30 text-4xl">{"{"}</div>
            <div className="absolute top-4 right-4 text-purple-300 dark:text-purple-500/30 text-4xl">{"}"}</div>
            <div className="absolute bottom-4 left-4 text-purple-300 dark:text-purple-500/30 text-4xl">{"{"}</div>
            <div className="absolute bottom-4 right-4 text-purple-300 dark:text-purple-500/30 text-4xl">{"}"}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-12 animate-fadeIn">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={!project}
              className="group relative px-12 py-5 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-lg text-white shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="flex items-center gap-3 relative z-10">
                <Play className="w-6 h-6" fill="currentColor" />
                Start Tracking
              </span>
              <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 transition-opacity blur-md"></div>
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={handleStart}
                  className="group relative px-10 py-4 bg-linear-to-r from-violet-500 to-purple-500 rounded-2xl font-bold text-lg text-white shadow-lg hover:shadow-violet-500/20 hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center gap-2 relative z-10">
                    <Play className="w-5 h-5" fill="currentColor" />
                    Resume
                  </span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="group relative px-10 py-4 bg-linear-to-r from-violet-500 to-indigo-500 rounded-2xl font-bold text-lg text-white shadow-lg hover:shadow-violet-500/20 hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center gap-2 relative z-10">
                    <Pause className="w-5 h-5" fill="currentColor" />
                    Pause
                  </span>
                </button>
              )}
              <button
                onClick={handleStop}
                className="group relative px-10 py-4 bg-linear-to-r from-rose-500 to-pink-600 rounded-2xl font-bold text-lg text-white shadow-lg hover:shadow-rose-500/20 hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2 relative z-10">
                  <Square className="w-5 h-5" fill="currentColor" />
                  Stop
                </span>
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
            {quickProjects.map((proj) => (
              <button
                key={proj.name}
                onClick={() => setProject(proj.name)}
                disabled={isRunning}
                className={`group relative px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                  project === proj.name
                    ? "bg-linear-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400 shadow-lg shadow-purple-500/20 scale-105"
                    : "bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500/50 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="text-2xl mb-1 block">{proj.icon}</span>
                <span className={`text-sm ${
                  project === proj.name ? "text-purple-700 dark:text-purple-200" : "text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-300"
                }`}>
                  {proj.name}
                </span>
                {project === proj.name && (
                  <div className="absolute inset-0 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 opacity-10"></div>
                )}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="Or enter a custom project name..."
            disabled={isRunning}
            className="w-full px-5 py-4 rounded-xl bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
          />
        </div>

        {/* Task Input */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: "0.3s" }}>
          <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 tracking-wide uppercase">
            What are you working on?
          </label>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g., Implementing user authentication feature"
            disabled={isRunning}
            className="w-full px-5 py-4 rounded-xl bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center shadow-sm dark:shadow-none">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{hrs.toString().padStart(2, "0")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hours</div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center shadow-sm dark:shadow-none">
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-1">{mins.toString().padStart(2, "0")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Minutes</div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center shadow-sm dark:shadow-none">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">{secs.toString().padStart(2, "0")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Seconds</div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="bg-white dark:bg-slate-800/30 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-2xl p-6 animate-fadeIn shadow-sm dark:shadow-none" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Recent Entries</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your latest time tracking sessions</p>
            </div>
            <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {/* Entry 1 */}
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center text-xl">
                ⚡
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 dark:text-white font-medium truncate">Implemented dashboard charts</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">WorkLogix</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">4h 32m</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Today</p>
              </div>
            </div>

            {/* Entry 2 */}
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl">
                🌐
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 dark:text-white font-medium truncate">Fixed responsive layout issues</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Client Website</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">2h 15m</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Today</p>
              </div>
            </div>

            {/* Entry 3 */}
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl">
                🔧
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 dark:text-white font-medium truncate">API endpoint optimization</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">API Development</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">3h 45m</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Yesterday</p>
              </div>
            </div>

            {/* Entry 4 */}
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-pink-500 to-pink-600 flex items-center justify-center text-xl">
                📱
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 dark:text-white font-medium truncate">Mobile app UI redesign</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Mobile App</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-pink-600 dark:text-pink-400">5h 20m</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Yesterday</p>
              </div>
            </div>

            {/* Entry 5 */}
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center text-xl">
                ⚡
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 dark:text-white font-medium truncate">Code review and refactoring</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">WorkLogix</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">1h 50m</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float-particle {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-100px) translateX(50px);
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
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

        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes expand {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        .animate-float-particle {
          animation: float-particle 10s ease-in-out infinite;
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out backwards;
        }

        .animate-slideIn {
          animation: slideIn 0.8s ease-out backwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out backwards;
        }

        .animate-gradient-shift {
          animation: gradient-shift 8s ease-in-out infinite;
        }

        .animate-expand {
          animation: expand 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
