import { useSearchParams } from "react-router-dom";
import LoginPage from "./LoginPage";
import ResetPasswordPage from "./ResetPasswordPage";

export default function AuthenticatePage() {
  const [searchParams] = useSearchParams();
  const tokenType = searchParams.get("stytch_token_type");

  if (tokenType === "reset_password") {
    return <ResetPasswordPage />;
  }

  return <LoginPage />;
}
