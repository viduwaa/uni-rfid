import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Providers from "@/providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "RFID Smart Card System",
    description:
        "Manage University attendance, canteen services, and student information",
    keywords: [
        "university",
        "RFID",
        "smart card",
        "attendance",
        "canteen",
        "student management",
    ],
    authors: [{ name: "University Management System" }],
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Get the session on the server side
    const session = await getServerSession(authOptions);

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Providers session={session}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <div className="min-h-screen bg-background font-sans antialiased">
                            <div className="relative flex min-h-screen flex-col">
                                {/* Main content area */}
                                <main className="flex-1">{children}</main>

                                {/* Global components */}
                                <Toaster
                                    richColors
                                    position="top-right"
                                    expand={true}
                                    duration={4000}
                                />

                                {/* Theme toggle - positioned in bottom right */}
                                <div className="fixed bottom-4 right-4 z-50">
                                    <ModeToggle />
                                </div>
                            </div>
                        </div>
                    </ThemeProvider>
                </Providers>
            </body>
        </html>
    );
}
