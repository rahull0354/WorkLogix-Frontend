import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "WorkLogix",
  description: "Track your time and manage your projects efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <div className="min-h-screen flex flex-col floating-orbs">
              {/* Header */}
              <Header />

              {/* Main Content */}
              <main className="flex-1 relative">
                {children}
              </main>

              {/* Footer */}
              <Footer />
            </div>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--bcd))',
                  color: 'hsl(var(--bc))',
                },
                success: {
                  iconTheme: {
                    primary: 'hsl(var(--su))',
                    secondary: 'hsl(var(--bc))',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'hsl(var(--er))',
                    secondary: 'hsl(var(--bc))',
                  },
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
