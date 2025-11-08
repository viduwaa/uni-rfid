"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress
NProgress.configure({
    showSpinner: false,
    trickleSpeed: 200,
    minimum: 0.08,
});

export function PageLoadingBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        NProgress.start();
        const timer = setTimeout(() => {
            NProgress.done();
        }, 300);

        return () => {
            clearTimeout(timer);
            NProgress.done();
        };
    }, [pathname, searchParams]);

    return null;
}
