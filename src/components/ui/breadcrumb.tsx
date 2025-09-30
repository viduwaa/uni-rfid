"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

export interface BreadcrumbItem {
    label: string;
    href?: string;
    current?: boolean;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
    return (
        <nav className={`flex items-center space-x-1 text-sm ${className}`}>
            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    {index > 0 && (
                        <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                    )}
                    {item.href && !item.current ? (
                        <Link
                            href={item.href}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span
                            className={
                                item.current
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-600"
                            }
                        >
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}

interface PageHeaderProps {
    title: string;
    breadcrumbs: BreadcrumbItem[];
    backButton?: {
        href: string;
        label?: string;
    };
    children?: React.ReactNode;
}

export function PageHeader({
    title,
    breadcrumbs,
    backButton,
    children,
}: PageHeaderProps) {
    return (
        <div className="mb-8">
            {/* Breadcrumbs */}
            <div className="mb-4">
                <Breadcrumb items={breadcrumbs} />
            </div>

            {/* Header with back button and title */}
            <div className="flex items-center gap-4 mb-4">
                {backButton && (
                    <Link href={backButton.href}>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-lg bg-transparent"
                        >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                        </Button>
                    </Link>
                )}
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {title}
                    </h1>
                </div>
                {children && (
                    <div className="flex items-center gap-2">{children}</div>
                )}
            </div>
        </div>
    );
}
