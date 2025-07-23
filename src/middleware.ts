// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname.startsWith("/admin/dashboard") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    if (pathname.startsWith("/lecturer/dashboard") && token?.role !== "lecturer") {
      return NextResponse.redirect(new URL("/lecturer", req.url));
    }

    if (pathname.startsWith("/student/dashboard") && token?.role !== "student") {
      return NextResponse.redirect(new URL("/student", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes like login pages
        if (
          pathname === "/" ||
          pathname === "/admin" ||
          pathname === "/lecturer" ||
          pathname === "/student" ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }

        // Block all other protected routes if not authenticated
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/lecturer/:path*",
    "/student/:path*",
  ],
};
