import { StytchLogin } from "@stytch/react";
import { FiLock } from "react-icons/fi";
import { Link } from "react-router-dom";
import { stytchConfig, stytchStyles } from "../../config/constants";
import PasswordRequirements from "./PasswordRequirements";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
            <FiLock size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Create an account
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Get started with Personal Notes
          </p>
        </div>

        <div className="stytch-wrapper">
          <StytchLogin config={stytchConfig} styles={stytchStyles} />
        </div>

        <PasswordRequirements />

        <div className="mt-8 pt-6 border-t border-zinc-100">
          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-zinc-900 font-medium hover:underline cursor-pointer"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
