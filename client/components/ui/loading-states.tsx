import React from "react";
import { Skeleton } from "./skeleton";
import { RefreshCw, Loader2 } from "lucide-react";

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border">
    <div className="px-4 py-3 border-b border-gray-200">
      <Skeleton className="h-6 w-48" />
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-4 py-4 flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      ))}
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-gray-200">
    <div className="flex items-center">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="ml-4 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  </div>
);

export const NavigationSkeleton = () => (
  <div className="flex space-x-2 py-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-32 rounded-xl" />
    ))}
  </div>
);

export const QuickActionsSkeleton = () => (
  <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-6">
      <Skeleton className="h-6 w-6 rounded" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-2 p-4 bg-white/20 rounded-lg"
        >
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  </div>
);

export const LoadingSpinner = ({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

export const RefreshIndicator = () => (
  <div className="flex items-center bg-blue-50 px-3 py-1 rounded-md">
    <RefreshCw className="h-4 w-4 text-blue-600 mr-1 animate-spin" />
    <span className="text-xs text-blue-600 font-medium">Updating...</span>
  </div>
);

export const DataLoadingState = ({
  message = "Loading data...",
}: {
  message?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-12">
    <LoadingSpinner size="lg" className="text-teal-600 mb-4" />
    <p className="text-gray-600 text-sm">{message}</p>
  </div>
);

export const ActionLoadingState = ({
  children,
  isLoading = false,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
}) => (
  <div className="relative">
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
        <LoadingSpinner className="text-teal-600" />
      </div>
    )}
  </div>
);
