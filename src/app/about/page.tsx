"use client";

import Link from "next/link";
import {
  Heart,
  Zap,
  Target,
  Users,
  Lightbulb,
  Shield,
  Globe,
  Code2,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
  Rocket,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function AboutPage() {
  const timeline = [
    {
      year: "2021",
      title: "The Spark",
      description: "Founded with a simple mission: make time tracking effortless and beautiful.",
      icon: Lightbulb,
    },
    {
      year: "2022",
      title: "First Release",
      description: "Launched WorkLogix with core timer and project management features.",
      icon: Rocket,
    },
    {
      year: "2023",
      title: "Growing Strong",
      description: "Reached 10,000+ users. Added advanced reporting and team collaboration.",
      icon: TrendingUp,
    },
    {
      year: "2024",
      title: "The Future",
      description: "Expanding globally with AI-powered insights and mobile apps.",
      icon: Globe,
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "User First",
      description: "Every feature starts with you. Your productivity is our mission.",
      gradient: "from-rose-500 to-pink-600",
    },
    {
      icon: Shield,
      title: "Privacy Always",
      description: "Your data belongs to you. Encrypted, secure, never sold.",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: Zap,
      title: "Simple Power",
      description: "Complex capabilities. Effortless experience. That's our promise.",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: Users,
      title: "Better Together",
      description: "Built by a diverse team passionate about your success.",
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  const features = [
    {
      title: "Precision Timing",
      description: "Track every second with military-grade accuracy",
      icon: Clock,
    },
    {
      title: "Smart Insights",
      description: "AI-powered analytics reveal your productivity patterns",
      icon: Lightbulb,
    },
    {
      title: "Team Sync",
      description: "Real-time collaboration keeps everyone aligned",
      icon: Users,
    },
    {
      title: "Universal Access",
      description: "Works beautifully on any device, anywhere",
      icon: Globe,
    },
    {
      title: "Developer API",
      description: "Integrate with your existing tools seamlessly",
      icon: Code2,
    },
    {
      title: "Proven Reliability",
      description: "99.9% uptime because your time matters",
      icon: Award,
    },
  ];

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

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-purple-600 via-pink-500 to-purple-700 opacity-[0.03]" />
          <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
            <div className="text-center animate-heroSlide">
              {/* Logo/Icon */}
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-40 animate-pulse-slow" />
                <div className="relative w-24 h-24 mx-auto bg-linear-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-black mb-6">
                <span className="bg-linear-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  We Believe
                </span>
                <br />
                <span className="text-slate-900 dark:text-white">In Your Time</span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                WorkLogix was born from a simple frustration: time tracking tools were
                either too complex or too basic. So we built something different.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1 transition-all duration-300"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all duration-300"
                >
                  Get in Touch
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="relative bg-white/80 dark:bg-white/3 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[3rem] p-12 md:p-16 overflow-hidden animate-fadeInUp">
            <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-linear-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    Our Mission
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                    Empower Every Professional
                  </h2>
                </div>
              </div>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                We're on a mission to help professionals and teams worldwide master their
                most valuable resource: time. Through elegant design and powerful features,
                we make productivity effortless and insights actionable.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="text-4xl font-black bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    10K+
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Active Users
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="text-4xl font-black bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    1M+
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Hours Tracked
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="text-4xl font-black bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    99.9%
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Uptime
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Story Timeline */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16 animate-fadeInUp">
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-4">
              Our Journey
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              The WorkLogix Story
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From a side project to a platform trusted by thousands
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {timeline.map((item, index) => (
              <div
                key={index}
                className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-500"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                <div className="text-6xl font-black bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 opacity-20 group-hover:opacity-30 transition-opacity">
                  {item.year}
                </div>

                <div
                  className={`w-14 h-14 rounded-2xl bg-linear-to-br ${item.icon === Lightbulb ? "from-amber-500 to-orange-600" : item.icon === Rocket ? "from-purple-500 to-pink-600" : item.icon === TrendingUp ? "from-emerald-500 to-teal-600" : "from-blue-500 to-cyan-600"} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16 animate-fadeInUp">
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-4">
              The WorkLogix Difference
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Why Professionals Choose Us
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We're not just another time tracker. We're your productivity partner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-300"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-linear-to-br ${
                    index === 0
                      ? "from-purple-500 to-purple-600"
                      : index === 1
                        ? "from-amber-500 to-orange-600"
                        : index === 2
                          ? "from-emerald-500 to-teal-600"
                          : index === 3
                            ? "from-blue-500 to-cyan-600"
                            : index === 4
                              ? "from-pink-500 to-rose-600"
                              : "from-indigo-500 to-purple-600"
                  } flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Values */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16 animate-fadeInUp">
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-4">
              What We Stand For
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="group relative bg-linear-to-br from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/10 rounded-[2.5rem] p-10 hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 w-64 h-64 bg-linear-to-br ${value.gradient} rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                />

                <div className="relative flex items-start gap-6">
                  <div
                    className={`w-20 h-20 rounded-3xl bg-linear-to-br ${value.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shrink-0`}
                  >
                    <value.icon className="w-10 h-10 text-white" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="relative bg-linear-to-br from-purple-600 via-pink-500 to-purple-700 rounded-[3rem] p-12 md:p-16 overflow-hidden animate-fadeInUp">
            {/* Background Pattern */}
            <div
              className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMiAyLTQgMi00cy0yLTItNC0yYzAgMCAyLTIgMi0ycy0yLTItNC0yYzAgMCAyIDIgMiAyIDAgMC0yLTItMi0ycy0yLTItNC0yYzAgMCAyIDIgMiAyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"
            />

            {/* Glow Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>Join the Revolution</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Ready to Transform Your Productivity?
                </h2>
                <p className="text-xl text-purple-100 max-w-2xl">
                  Join thousands of professionals who've already mastered their time with
                  WorkLogix. Your journey to peak productivity starts here.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl bg-white text-purple-600 font-bold hover:shadow-2xl hover:shadow-white/30 hover:-translate-y-1 transition-all duration-300 group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl bg-white/20 backdrop-blur-sm text-white font-bold border-2 border-white/30 hover:bg-white/30 hover:border-white/50 transition-all duration-300"
                >
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Contact */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Questions? We'd love to hear from you.
              </p>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                hello@worklogix.com
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                href="/login"
                className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

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

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
