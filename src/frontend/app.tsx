import { BrowserRouter, Route, Routes } from "react-router";
import {
  Layout,
  Home,
  Docs,
  NotFound,
  SignupPage,
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ProtectedRoute,
} from "@/routes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes with shared layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="docs"
            element={
              <ProtectedRoute>
                <Docs />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Independent routes without layout */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}
