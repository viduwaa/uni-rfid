import React from "react";
import { Spinner } from "./ui/spinner";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader } from "./ui/card";

interface LoadingStateProps {
    loading: boolean;
    error?: string | null;
    children: React.ReactNode;
    loadingComponent?: React.ReactNode;
    errorComponent?: React.ReactNode;
    type?: "spinner" | "skeleton";
}

export function LoadingState({
    loading,
    error,
    children,
    loadingComponent,
    errorComponent,
    type = "spinner",
}: LoadingStateProps) {
    if (loading) {
        if (loadingComponent) {
            return <>{loadingComponent}</>;
        }

        if (type === "skeleton") {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            );
        }

        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Spinner size="lg" className="text-primary" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        if (errorComponent) {
            return <>{errorComponent}</>;
        }

        return (
            <Card className="border-destructive">
                <CardHeader>
                    <h3 className="text-lg font-semibold text-destructive">
                        Error
                    </h3>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return <>{children}</>;
}
