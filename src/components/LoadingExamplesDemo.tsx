"use client";

/**
 * Example Component Demonstrating All Loading Features
 *
 * This file shows how to use all the loading components and patterns
 * in a real-world scenario. Use this as a reference for your own components.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Spinner,
    SpinnerOverlay,
    LoadingButton,
} from "@/components/ui/spinner";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/LoadingState";
import { useAsync, useFetch } from "@/hooks/useAsync";
import { toast } from "sonner";

export default function LoadingExamplesDemo() {
    // Example 1: Manual loading state
    const [manualLoading, setManualLoading] = useState(false);

    // Example 2: Using useAsync hook
    const {
        data: asyncData,
        loading: asyncLoading,
        error: asyncError,
        execute: fetchAsyncData,
    } = useAsync(async (searchTerm: string) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API delay
        return { result: `Results for: ${searchTerm}`, items: [1, 2, 3] };
    });

    // Example 3: Using useFetch hook (won't auto-execute since URL is null initially)
    const [apiUrl, setApiUrl] = useState<string | null>(null);
    const {
        data: fetchData,
        loading: fetchLoading,
        error: fetchError,
    } = useFetch(apiUrl);

    // Example 4: Form submission
    const [formSubmitting, setFormSubmitting] = useState(false);

    // Example 5: Full page loading
    const [showOverlay, setShowOverlay] = useState(false);

    // Handlers
    const handleManualLoad = async () => {
        setManualLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            toast.success("Manual operation completed!");
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setManualLoading(false);
        }
    };

    const handleAsyncLoad = () => {
        fetchAsyncData("test search");
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            toast.success("Form submitted!");
        } catch (error) {
            toast.error("Submission failed");
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleOverlayDemo = async () => {
        setShowOverlay(true);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setShowOverlay(false);
        toast.success("Overlay operation completed!");
    };

    return (
        <div className="container mx-auto py-10 space-y-8">
            {showOverlay && (
                <SpinnerOverlay message="Processing your request..." />
            )}

            <div className="space-y-4">
                <h1 className="text-3xl font-bold">Loading Effects Demo</h1>
                <p className="text-muted-foreground">
                    Examples of all loading patterns available in the
                    application
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Example 1: Basic Spinner */}
                <Card>
                    <CardHeader>
                        <CardTitle>1. Basic Spinners</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center gap-2">
                                <Spinner size="sm" />
                                <span className="text-xs">Small</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Spinner size="md" />
                                <span className="text-xs">Medium</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Spinner size="lg" />
                                <span className="text-xs">Large</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Spinner size="xl" />
                                <span className="text-xs">XL</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Example 2: Loading Button */}
                <Card>
                    <CardHeader>
                        <CardTitle>2. Loading Button</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <LoadingButton
                            loading={manualLoading}
                            onClick={handleManualLoad}
                            className="w-full"
                        >
                            {manualLoading ? "Loading..." : "Click to Load"}
                        </LoadingButton>

                        <Button
                            onClick={handleManualLoad}
                            disabled={manualLoading}
                            className="w-full"
                        >
                            {manualLoading ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Processing...
                                </>
                            ) : (
                                "Alternative Style"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Example 3: Skeleton Loaders */}
                <Card>
                    <CardHeader>
                        <CardTitle>3. Skeleton Loaders</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {manualLoading ? (
                            <>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-20 w-full" />
                            </>
                        ) : (
                            <>
                                <p className="font-medium">Content Loaded!</p>
                                <p className="text-sm text-muted-foreground">
                                    This is the actual content that appears
                                    after loading completes.
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Example 4: useAsync Hook */}
                <Card>
                    <CardHeader>
                        <CardTitle>4. useAsync Hook</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={handleAsyncLoad}
                            disabled={asyncLoading}
                            className="w-full"
                        >
                            Fetch Data with useAsync
                        </Button>

                        <LoadingState
                            loading={asyncLoading}
                            error={asyncError}
                            type="skeleton"
                        >
                            {asyncData && (
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="font-medium text-green-800">
                                        {asyncData.result}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        Items: {asyncData.items.join(", ")}
                                    </p>
                                </div>
                            )}
                        </LoadingState>
                    </CardContent>
                </Card>

                {/* Example 5: Form with Loading */}
                <Card>
                    <CardHeader>
                        <CardTitle>5. Form Submission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <Input
                                placeholder="Enter some data..."
                                disabled={formSubmitting}
                            />
                            <Button
                                type="submit"
                                disabled={formSubmitting}
                                className="w-full"
                            >
                                {formSubmitting ? (
                                    <>
                                        <Spinner size="sm" className="mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Form"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Example 6: Full Screen Overlay */}
                <Card>
                    <CardHeader>
                        <CardTitle>6. Full Screen Overlay</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleOverlayDemo}
                            disabled={showOverlay}
                            className="w-full"
                        >
                            Show Overlay Loading
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            Demonstrates full-screen blocking operation
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Skeleton Card Example */}
            <div>
                <h2 className="text-xl font-semibold mb-4">
                    Skeleton Card Example
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {manualLoading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Card 1</CardTitle>
                                </CardHeader>
                                <CardContent>Actual content here</CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Card 2</CardTitle>
                                </CardHeader>
                                <CardContent>Actual content here</CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Card 3</CardTitle>
                                </CardHeader>
                                <CardContent>Actual content here</CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>

            {/* Code Examples */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Reference</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="font-semibold mb-2">
                                Basic Loading Pattern:
                            </p>
                            <pre className="bg-muted p-4 rounded overflow-x-auto">
                                {`const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await someAsyncOperation();
  } finally {
    setLoading(false);
  }
};`}
                            </pre>
                        </div>

                        <div>
                            <p className="font-semibold mb-2">
                                Using LoadingState:
                            </p>
                            <pre className="bg-muted p-4 rounded overflow-x-auto">
                                {`<LoadingState loading={loading} error={error}>
  <YourContent />
</LoadingState>`}
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
