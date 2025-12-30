import { IdentityProvider } from "@stytch/react";
import { FiShield } from "react-icons/fi";

export default function OAuthPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <FiShield size={28} />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Authorize Access
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            An application is requesting access to your account
          </p>
        </div>

        <div className="[&>div]:!shadow-none [&>div]:!border-0">
          <IdentityProvider />
        </div>

        <p className="text-xs text-zinc-400 text-center mt-6">
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
  );
}
