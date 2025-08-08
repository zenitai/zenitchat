import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  redirectTo = "/login",
  fallback = <div>Loading...</div>,
}: ProtectedRouteProps) {
  return (
    <>
      <AuthLoading>{fallback}</AuthLoading>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <Navigate to={redirectTo} replace />
      </Unauthenticated>
    </>
  );
}
