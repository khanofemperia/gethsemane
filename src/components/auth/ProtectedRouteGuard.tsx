"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRouteGuard({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Prevent back navigation to admin routes after logout
    const handlePopState = () => {
      if (!user && window.location.pathname.startsWith("/auth/admin/")) {
        window.history.replaceState(null, "", "/");
        router.replace("/");
      }
    };

    // Add popstate listener to handle back button
    window.addEventListener("popstate", handlePopState);

    // Immediately redirect if we know user is not authenticated
    if (!loading && !user) {
      // Clear any admin routes from browser history
      if (window.location.pathname.startsWith("/auth/admin/")) {
        // Clear entire history and replace with homepage
        window.history.pushState(null, "", "/");
        window.history.pushState(null, "", "/");
        window.history.go(-1);
      } else {
        // Normal redirect for non-admin routes
        router.prefetch("/");
        queueMicrotask(() => {
          window.history.replaceState(null, "", "/");
          router.replace("/");
        });
      }
      return;
    }

    // Handle admin check
    if (!loading && user && requireAdmin) {
      user.getIdTokenResult().then((tokenResult) => {
        if (tokenResult.claims.role !== "admin") {
          router.prefetch("/");
          queueMicrotask(() => {
            window.history.replaceState(null, "", "/");
            router.replace("/");
          });
        }
      });
    }

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [user, loading, router, requireAdmin]);

  // Return a minimal loading state instead of null
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Optional: Add a loading spinner or placeholder here */}
      </div>
    );
  }

  // Return homepage shell while redirecting
  if (!user) {
    return <div className="min-h-screen bg-white" />;
  }

  // If admin is required, show loading state until role check completes
  if (requireAdmin) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  requireAdmin = false
) {
  return function WrappedComponent(props: P) {
    return (
      <ProtectedRouteGuard requireAdmin={requireAdmin}>
        <Component {...props} />
      </ProtectedRouteGuard>
    );
  };
}
