import { useState, useCallback } from "react";

export interface UseAsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export interface UseAsyncActions<T> {
    execute: (...args: any[]) => Promise<T | null>;
    reset: () => void;
    setData: (data: T | null) => void;
}

export function useAsync<T = any>(
    asyncFunction: (...args: any[]) => Promise<T>,
    immediate = false
): UseAsyncState<T> & UseAsyncActions<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(
        async (...args: any[]): Promise<T | null> => {
            setLoading(true);
            setError(null);

            try {
                const response = await asyncFunction(...args);
                setData(response);
                return response;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "An error occurred";
                setError(errorMessage);
                setData(null);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [asyncFunction]
    );

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    return {
        data,
        loading,
        error,
        execute,
        reset,
        setData,
    };
}

// Hook specifically for fetch requests
export function useFetch<T = any>(
    url: string | null,
    options?: RequestInit,
    immediate = true
) {
    const fetchFunction = useCallback(async () => {
        if (!url) throw new Error("URL is required");

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success === false) {
            throw new Error(result.message || "Request failed");
        }

        return result.data || result;
    }, [url, options]);

    const asyncState = useAsync<T>(fetchFunction, false);

    // Execute immediately if requested and URL is available
    if (
        immediate &&
        url &&
        !asyncState.loading &&
        !asyncState.data &&
        !asyncState.error
    ) {
        asyncState.execute();
    }

    return asyncState;
}
