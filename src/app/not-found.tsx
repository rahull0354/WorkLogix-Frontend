'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-slate-800 to-gray-900 px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-[180px] font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-red-500 leading-none">
            404
          </h1>
        </div>
        <div className="relative">
          <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <h2 className="text-4xl font-bold text-white mb-4">Page Not Found</h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Oops! The page you're looking for seems to have wandered off into the digital void.
              Don't worry, let's get you back on track.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="inline-block px-8 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Go Back Home
              </a>
              <button
                onClick={() => window.history.back()}
                className="inline-block px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-200 border border-gray-600 hover:border-gray-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <div className="mt-12 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse delay-100"></div>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
}
