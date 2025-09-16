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
  ChatLayout,
  ChatPage,
} from "@/routes";
import { AuthSplashGate, UserProvider } from "@/features/auth";

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AuthSplashGate>
          <Routes>
            {/* Chat as primary interface at root */}
            <Route path="/" element={<ChatLayout />}>
              <Route index element={<ChatPage />} />
              <Route path="chat/:threadId" element={<ChatPage />} />
            </Route>

            {/* Other routes with shared layout */}
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route
                path="/docs"
                element={
                  <ProtectedRoute>
                    <Docs />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Independent routes without layout */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthSplashGate>
      </UserProvider>
    </BrowserRouter>
  );
}
