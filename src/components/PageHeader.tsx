"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Home } from "lucide-react";

export type Breadcrumb = {
  label: string;
  href?: string;
  icon?: ReactNode;
};

type Props = {
  breadcrumbs?: Breadcrumb[];
  title: ReactNode;
  subtitle?: ReactNode;
  backHref?: string; // optional back link (renders a Back to Dashboard button)
  right?: ReactNode; // right-side actions
  centerIcon?: ReactNode;
};

export default function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  backHref,
  right,
  centerIcon,
}: Props) {
  return (
    <>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {b.href ? (
                  <Link
                    href={b.href}
                    className="flex items-center hover:text-gray-700"
                  >
                    {b.icon ? (
                      b.icon
                    ) : i === 0 ? (
                      <Home className="h-4 w-4 mr-1" />
                    ) : null}
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 dark:text-gray-300 font-medium">
                    {b.label}
                  </span>
                )}

                {i < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            ))}
          </nav>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-6">
        <div className="flex items-center">
          {backHref && (
            <Link href={backHref}>
              <Button variant="outline" size="sm" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          )}
        </div>

        <div className="text-center">
          {centerIcon && <div className="mx-auto mb-2">{centerIcon}</div>}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-300">{subtitle}</p>
          )}
        </div>

        <div className="hidden md:flex items-center justify-end">{right}</div>
      </div>
    </>
  );
}
