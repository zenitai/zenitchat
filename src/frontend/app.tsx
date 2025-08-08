import { BrowserRouter, Route, Routes } from "react-router";
import { Layout, Home, Docs, NotFound, SignupPage, LoginPage } from "@/routes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes with shared layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="docs" element={<Docs />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Independent routes without layout */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
