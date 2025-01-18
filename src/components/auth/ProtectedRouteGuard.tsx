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
    if (!loading) {
      if (!user) {
        // Replace the current history entry with the home page
        // This prevents going back to the protected page
        window.history.replaceState(null, "", "/");
        router.replace("/");
        return;
      }

      // Additional check for admin routes
      if (requireAdmin) {
        user.getIdTokenResult().then((tokenResult) => {
          if (tokenResult.claims.role !== "admin") {
            window.history.replaceState(null, "", "/");
            router.replace("/");
          }
        });
      }
    }
  }, [user, loading, router, requireAdmin]);

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // If not authenticated, render nothing
  if (!user) {
    return null;
  }

  // If admin is required, wait for role check
  if (requireAdmin) {
    // You might want to add a loading state here
    return <>{children}</>;
  }

  // If authenticated and no admin required, render children
  return <>{children}</>;
}

// Higher-order function to wrap protected pages
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
