// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const token = req.nextauth.token;

        // Admin route protection
        if (
            pathname.startsWith("/admin/") &&
            pathname !== "/admin" &&
            token?.role !== "admin"
        ) {
            return NextResponse.redirect(new URL("/admin", req.url));
        }

        // Lecturer route protection
        if (
            pathname.startsWith("/lecturer/") &&
            pathname !== "/lecturer" &&
            token?.role !== "lecturer"
        ) {
            return NextResponse.redirect(new URL("/lecturer", req.url));
        }

        // Student route protection
        if (
            pathname.startsWith("/student/") &&
            pathname !== "/student" &&
            token?.role !== "student"
        ) {
            return NextResponse.redirect(new URL("/student", req.url));
        }

        // Canteen route protection
        if (
            pathname.startsWith("/canteen/") &&
            pathname !== "/canteen" &&
            token?.role !== "canteen"
        ) {
            return NextResponse.redirect(new URL("/canteen", req.url));
        }

        // Library route protection - allow self-service routes without auth
        if (
            pathname.startsWith("/library/") &&
            pathname !== "/library" &&
            !pathname.startsWith("/library/self-service") &&
            !pathname.startsWith("/library/book-checkout") &&
            !pathname.startsWith("/library/book-returns") &&
            !pathname.startsWith("/library/catalog-search") &&
            token?.role !== "librarian"
        ) {
            return NextResponse.redirect(new URL("/library", req.url));
        }

        // Redirect authenticated users away from login pages to their dashboards
        if (token) {
            if (pathname === "/admin" && token.role === "admin") {
                return NextResponse.redirect(
                    new URL("/admin/dashboard", req.url)
                );
            }
            if (pathname === "/lecturer" && token.role === "lecturer") {
                return NextResponse.redirect(
                    new URL("/lecturer/dashboard", req.url)
                );
            }
            if (pathname === "/student" && token.role === "student") {
                return NextResponse.redirect(
                    new URL("/student/dashboard", req.url)
                );
            }
            if (pathname === "/canteen" && token.role === "canteen") {
                return NextResponse.redirect(
                    new URL("/canteen/dashboard", req.url)
                );
            }
            if (pathname === "/library" && token.role === "librarian") {
                return NextResponse.redirect(
                    new URL("/library/dashboard", req.url)
                );
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Allow public routes like login pages and library self-service
                if (
                    pathname === "/" ||
                    pathname === "/admin" ||
                    pathname === "/lecturer" ||
                    pathname === "/student" ||
                    pathname === "/canteen" ||
                    pathname === "/library" ||
                    pathname.startsWith("/library/self-service") ||
                    pathname.startsWith("/library/book-checkout") ||
                    pathname.startsWith("/library/book-returns") ||
                    pathname.startsWith("/library/catalog-search") ||
                    pathname.startsWith("/api/auth") ||
                    pathname.startsWith("/public")
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
        "/canteen/:path*",
        "/library/:path*",
    ],
};
