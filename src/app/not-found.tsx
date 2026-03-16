"use client";

import {
  ArrowLeft,
  BarChart3,
  FolderKanban,
  Home,
  Search,
  Timer,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const quickLinks = [
    { href: "/dashboard", icon: Home, label: "Dashboard", delay: "0.1s" },
    { href: "/projects", icon: FolderKanban, label: "Projects", delay: "0.2s" },
    { href: "/reports", icon: BarChart3, label: "Reports", delay: "0.3s" },
    { href: "/timer", icon: Timer, label: "Timer", delay: "0.4s" },
  ];

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
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-linear-to-br from-emerald-500 to-blue-500 rounded-full blur-[80px] opacity-[0.08] pointer-events-none animate-float"
        style={{ animationDelay: "-5s" }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          {/* Main Card */}
          <div
            className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-12 shadow-2xl shadow-purple-500/5"
            style={{
              animation: "fadeInUp 0.6s ease-out backwards",
            }}
          >
            {/* Unique 404 Display */}
            <div className="text-center mb-12">
              <div className="relative inline-block perspective-1000">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-pink-500 blur-3xl opacity-30 animate-pulse-glow"></div>

                {/* 404 with Creative Effects */}
                <div className="relative">
                  <h1 className="text-[160px] font-bold leading-none select-none">
                    <span className="inline-block relative">
                      {/* Number 4 */}
                      <span className="inline-block bg-linear-to-br from-purple-600 via-purple-500 to-pink-600 bg-clip-text text-transparent animate-float-number"
                            style={{ animationDelay: "0s", animationDuration: "3s" }}>
                        4
                      </span>
                      <span className="absolute -top-8 -right-4 text-5xl">🔍</span>
                    </span>

                    <span className="inline-block mx-2 text-slate-300 dark:text-slate-600 animate-bounce-slow">/</span>

                    {/* Number 0 with creative center */}
                    <span className="inline-block relative">
                      <span className="inline-block bg-linear-to-bl from-pink-600 via-purple-500 to-pink-600 bg-clip-text text-transparent animate-float-number"
                            style={{ animationDelay: "0.5s", animationDuration: "3s" }}>
                        0
                      </span>
                      {/* Floating elements in the zero */}
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-spin-slow">
                        🌐
                      </span>
                    </span>

                    <span className="inline-block mx-2 text-slate-300 dark:text-slate-600 animate-bounce-slow">/</span>

                    {/* Number 4 */}
                    <span className="inline-block relative">
                      <span className="inline-block bg-linear-to-tr from-pink-600 via-purple-500 to-purple-600 bg-clip-text text-transparent animate-float-number"
                            style={{ animationDelay: "1s", animationDuration: "3s" }}>
                        4
                      </span>
                      <span className="absolute -bottom-8 -left-4 text-5xl">💭</span>
                    </span>
                  </h1>

                  {/* Decorative Elements */}
                  <div className="absolute -top-6 -left-6 text-4xl animate-float-emoji" style={{ animationDelay: "0s" }}>✨</div>
                  <div className="absolute -top-4 -right-8 text-3xl animate-float-emoji" style={{ animationDelay: "0.3s" }}>⚡</div>
                  <div className="absolute -bottom-6 -right-6 text-4xl animate-float-emoji" style={{ animationDelay: "0.6s" }}>🎯</div>
                  <div className="absolute -bottom-4 -left-8 text-3xl animate-float-emoji" style={{ animationDelay: "0.9s" }}>💫</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Page Not Found
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Oops! The page you're looking for seems to have wandered off into the digital void.
                Don't worry, let's get you back on track.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5"
              >
                <Home className="w-5 h-5" />
                <span>Go to Dashboard</span>
              </a>
              <button
                onClick={() => window.history.back()}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold rounded-xl border-2 border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-12">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-6 bg-white dark:bg-[#0a0a0a] text-sm text-slate-500 dark:text-slate-400">
                  Or explore
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="group flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-white/5 border-2 border-transparent rounded-xl transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500/30 hover:bg-linear-to-br hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-500/10 dark:hover:to-pink-500/10 hover:-translate-y-1"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${link.delay} backwards`,
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 flex items-center justify-center transition-all duration-300 group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white">
                      <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {link.label}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Bottom Note */}
          <p
            className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8"
            style={{ animation: "fadeInUp 0.6s ease-out 0.5s backwards" }}
          >
            Need help? Contact our{" "}
            <a href="#" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
              support team
            </a>
          </p>
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

        @keyframes floatNumber {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(2deg);
          }
          50% {
            transform: translateY(0) rotate(0deg);
          }
          75% {
            transform: translateY(-5px) rotate(-2deg);
          }
        }

        @keyframes bounceSlow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes spinSlow {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes floatEmoji {
          0%,
          100% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-15px) rotate(10deg) scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-number {
          animation: floatNumber 3s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounceSlow 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spinSlow 8s linear infinite;
        }

        .animate-float-emoji {
          animation: floatEmoji 3s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulseGlow 3s ease-in-out infinite;
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
