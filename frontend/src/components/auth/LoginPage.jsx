import { StytchLogin, useStytchUser } from "@stytch/react";
import { useEffect } from "react";
import { FiLock } from "react-icons/fi";
import { Link } from "react-router-dom";
import { stytchConfig, stytchStyles } from "../../config/constants";

export default function LoginPage() {
  const { user } = useStytchUser();

  useEffect(() => {
    if (user) {
      const returnUrl = sessionStorage.getItem("oauth_return_url");
      if (returnUrl) {
        sessionStorage.removeItem("oauth_return_url");
        window.location.assign(returnUrl);
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
            <FiLock size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900">Welcome back</h1>
          <p className="text-sm text-zinc-500 mt-2">Sign in to your account</p>
        </div>

        <div className="stytch-wrapper">
          <StytchLogin config={stytchConfig} styles={stytchStyles} />
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 space-y-3">
          <p className="text-center text-sm text-zinc-500">
            <Link
              to="/forgot-password"
              className="text-zinc-900 font-medium hover:underline cursor-pointer"
            >
              Forgot your password?
            </Link>
          </p>
          <p className="text-center text-xs text-zinc-400">
            Secured by{" "}
            <a
              href="https://stytch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-600 cursor-pointer"
            >
              Stytch
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
