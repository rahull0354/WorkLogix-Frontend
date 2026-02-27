import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/projects",
  "/timer",
  "/time-entries",
  "/reports",
  "/profile",
];

// if user visits this routes being logged in then will be redirected to dashboard
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // get token from local storage
  const token = request.cookies.get("token")?.value;

  // check if current path is an protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // check ifg current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // redirect to login if trying to access protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // redirect to dashboard if tryinh to access auth routes while logged in
  if (isAuthRoute && token) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
