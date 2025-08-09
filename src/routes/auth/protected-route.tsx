import { ReactNode } from "react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
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
