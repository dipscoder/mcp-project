import { useStytchUser } from "@stytch/react";
import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import {
  AuthenticatePage,
  Dashboard,
  ForgotPasswordPage,
  LoginPage,
  OAuthPage,
  SignupPage,
} from "./components";

function RootPage() {
  const { user } = useStytchUser();
  const [searchParams] = useSearchParams();

  // Check if this is an OAuth authorization request
  const isOAuthRequest =
    searchParams.get("response_type") === "code" &&
    searchParams.get("client_id");

  if (isOAuthRequest) {
    return <OAuthPage />;
  }

  if (user) {
    return <Dashboard />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  const { user } = useStytchUser();

  return (
    <Routes>
      <Route path="/authenticate" element={<AuthenticatePage />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/" replace /> : <SignupPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/" element={<RootPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
