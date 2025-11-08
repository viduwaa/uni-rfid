import { cn } from "@/lib/utils";

interface SpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
    xl: "h-16 w-16 border-4",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
    return (
        <div
            className={cn(
                "inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
                sizeClasses[size],
                className
            )}
            role="status"
        >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
            </span>
        </div>
    );
}

export function SpinnerOverlay({ message }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <Spinner size="xl" className="text-primary" />
                {message && (
                    <p className="text-sm font-medium text-muted-foreground">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export function LoadingButton({
    loading,
    children,
    disabled,
    className,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
    return (
        <button
            disabled={disabled || loading}
            className={cn(
                "relative inline-flex items-center justify-center",
                className
            )}
            {...props}
        >
            {loading && (
                <Spinner
                    size="sm"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                />
            )}
            <span className={cn(loading && "invisible")}>{children}</span>
        </button>
    );
}
