import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

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
        <AuthProvider>
          <ThemeProvider>
            <QueryProvider>
              <div className="min-h-screen flex flex-col floating-orbs">
                <Header />
                <main className="flex-1 relative">{children}</main>
                <Footer />
              </div>
            </QueryProvider>
          </ThemeProvider>
        </AuthProvider>

        {/* Toast Notifications - Outside all providers */}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 5000,
            style: {
              background: "#7c3aed",
              color: "#ffffff",
              border: "1px solid #374151",
              borderRadius: "8px",
              padding: "12px 16px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
