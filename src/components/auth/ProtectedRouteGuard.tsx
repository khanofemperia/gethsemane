"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/ui/Spinners/Default";

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
    const checkAccess = async () => {
      if (loading) return;

      if (!user) {
        // Replace history and redirect to clear back navigation
        window.history.replaceState(null, "", "/");
        router.replace("/");
        return;
      }

      if (requireAdmin) {
        const tokenResult = await user.getIdTokenResult();
        if (tokenResult.claims.role !== "admin") {
          window.history.replaceState(null, "", "/");
          router.replace("/");
        }
      }
    };

    checkAccess();
  }, [user, loading, router, requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner color="gray" size={28} />
      </div>
    );
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
