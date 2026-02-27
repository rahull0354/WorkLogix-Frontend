import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  Zap,
  ArrowRight,
  Infinity,
  Timer,
  CheckCircle,
  Users,
  Target,
  Clock as ClockIcon,
  Shield,
  Smartphone,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-10">
      <div className="max-w-6xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="inline-block mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-primary to-secondary rounded-2xl blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative w-24 h-24 mx-auto bg-linear-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                {/* Animated infinity symbol */}
                <div className="relative">
                  <Infinity
                    className="w-14 h-14 text-white animate-pulse"
                    strokeWidth={2}
                  />
                  <Timer
                    className="w-8 h-8 text-white/80 absolute -bottom-1 -right-2"
                    strokeWidth={3}
                  />
                </div>
                {/* Sparkle effect */}
                <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
                <div className="absolute bottom-3 left-3 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-linear-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
              WorkLogix
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-700 mb-8 max-w-2xl mx-auto font-medium">
            Track time, manage projects, and boost productivity with our elegant
            time tracking solution
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="btn btn-ghost border border-indigo-500 btn-lg"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="card bg-base-100/95 backdrop-blur-xl shadow-xl border border-base-300 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 bg-linear-to-br from-primary/30 to-primary/20 rounded-2xl flex items-center justify-center mb-4">
                <Timer className="w-8 h-8 text-primary" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl mb-2 font-bold card-text-light">
                Track Time
              </h3>
              <p className="font-medium card-description-light">
                Start and stop timers with precision. Every second counts
                towards your productivity goals.
              </p>
            </div>
          </div>

          <div className="card bg-base-100/95 backdrop-blur-xl shadow-xl border border-base-300 hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 bg-linear-to-br from-secondary/30 to-secondary/20 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp
                  className="w-8 h-8 text-secondary"
                  strokeWidth={2.5}
                />
              </div>
              <h3 className="text-xl mb-2 font-bold card-text-light">
                Manage Projects
              </h3>
              <p className="font-medium card-description-light">
                Organize your work into projects and clients. Stay on top of
                deadlines and deliverables.
              </p>
            </div>
          </div>

          <div className="card bg-base-100/95 backdrop-blur-xl shadow-xl border border-base-300 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 bg-linear-to-br from-accent/30 to-accent/20 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-accent" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl mb-2 font-bold card-text-light">
                View Reports
              </h3>
              <p className="font-medium card-description-light">
                Analyze your productivity with detailed reports. Make
                data-driven decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold bg-linear-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent mb-2">
              10K+
            </div>
            <p className="text-slate-700 text-sm font-semibold">Active Users</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-linear-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent mb-2">
              1M+
            </div>
            <p className="text-slate-700 text-sm font-semibold">
              Hours Tracked
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-linear-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent mb-2">
              50K+
            </div>
            <p className="text-slate-700 text-sm font-semibold">Projects</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-linear-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent mb-2">
              99.9%
            </div>
            <p className="text-slate-700 text-sm font-semibold">Uptime</p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 cta-title text-center">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Get started in minutes and transform the way you manage your time
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 card-text-light">
                Create Projects
              </h3>
              <p className="text-slate-600 card-description-light">
                Set up projects for clients or personal tasks. Organize your
                work the way you want.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-secondary/20 to-secondary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-secondary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 card-text-light">
                Track Time
              </h3>
              <p className="text-slate-600 card-description-light">
                Start the timer when you begin working. Stop when you're done.
                It's that simple.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 card-text-light">
                Analyze & Grow
              </h3>
              <p className="text-slate-600 card-description-light">
                Review detailed reports and insights. Make data-driven decisions
                to boost productivity.
              </p>
            </div>
          </div>
        </div>

        {/* More Features Section */}
        <div className="mt-32">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 cta-title text-center">
            Why Choose WorkLogix?
          </h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to manage your time effectively
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="flex gap-4 p-6 rounded-2xl bg-base-100/60 backdrop-blur-sm border border-base-200 hover:border-primary/30 transition-all">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2 card-text-light">Goal Setting</h3>
                <p className="text-sm text-slate-600 card-description-light">
                  Set daily, weekly, or monthly time goals and track your
                  progress.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl bg-base-100/60 backdrop-blur-sm border border-base-200 hover:border-secondary/30 transition-all">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-linear-to-br from-secondary/20 to-secondary/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2 card-text-light">
                  Team Collaboration
                </h3>
                <p className="text-sm text-slate-600 card-description-light">
                  Invite team members and collaborate on projects in real-time.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl bg-base-100/60 backdrop-blur-sm border border-base-200 hover:border-accent/30 transition-all">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-linear-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2 card-text-light">
                  Mobile Friendly
                </h3>
                <p className="text-sm text-slate-600 card-description-light">
                  Track time on the go with our responsive mobile interface.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl bg-base-100/60 backdrop-blur-sm border border-base-200 hover:border-primary/30 transition-all">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2 card-text-light">Manual Entry</h3>
                <p className="text-sm text-slate-600 card-description-light">
                  Forgot to start the timer? Add manual entries anytime.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl bg-base-100/60 backdrop-blur-sm border border-base-200 hover:border-secondary/30 transition-all">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-linear-to-br from-secondary/20 to-secondary/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2 card-text-light">
                  Secure & Private
                </h3>
                <p className="text-sm text-slate-600 card-description-light">
                  Your data is encrypted and protected. Privacy first approach.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl bg-base-100/60 backdrop-blur-sm border border-base-200 hover:border-accent/30 transition-all">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-linear-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2 card-text-light">
                  Export Reports
                </h3>
                <p className="text-sm text-slate-600 card-description-light">
                  Export data to CSV, PDF, or integrate with your favorite
                  tools.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-32">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 cta-title text-center">
            What Our Users Say
          </h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Trusted by professionals around the world
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="card bg-base-100/80 backdrop-blur-xl shadow-xl border border-base-300">
              <div className="card-body">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 card-description-light mb-4">
                  "WorkLogix has completely transformed how I manage my
                  freelance projects. I can finally see where my time goes!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/30 to-primary/20 flex items-center justify-center text-primary font-bold">
                    SR
                  </div>
                  <div>
                    <p className="font-bold text-sm card-text-light">
                      Sarah Rodriguez
                    </p>
                    <p className="text-xs text-slate-500">Freelance Designer</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100/80 backdrop-blur-xl shadow-xl border border-base-300">
              <div className="card-body">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 card-description-light mb-4">
                  "The reporting features are incredible. I've increased my
                  team's productivity by 40% since using WorkLogix."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-secondary/30 to-secondary/20 flex items-center justify-center text-secondary font-bold">
                    MK
                  </div>
                  <div>
                    <p className="font-bold text-sm card-text-light">
                      Michael Kim
                    </p>
                    <p className="text-xs text-slate-500">Project Manager</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100/80 backdrop-blur-xl shadow-xl border border-base-300">
              <div className="card-body">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 card-description-light mb-4">
                  "Simple, elegant, and powerful. WorkLogix is exactly what I
                  needed for my consulting business."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-accent/30 to-accent/20 flex items-center justify-center text-accent font-bold">
                    EP
                  </div>
                  <div>
                    <p className="font-bold text-sm card-text-light">
                      Emily Parker
                    </p>
                    <p className="text-xs text-slate-500">
                      Business Consultant
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 card">
          <div className="card-body items-center text-center py-12">
            <Zap
              className="card-icon w-12 h-12 text-primary mb-4"
              strokeWidth={2.5}
            />
            <h2 className="text-3xl font-bold mb-4 cta-title">
              Ready to boost your productivity?
            </h2>
            <p className="cta-description max-w-xl mb-6 font-medium">
              Join thousands of professionals who trust WorkLogix to manage
              their time effectively.
            </p>
            <div className="flex gap-4">
              <Link href="/register" className="btn btn-primary btn-lg">
                Start Free Trial
              </Link>
              <Link href="/about" className="btn btn-ghost btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
