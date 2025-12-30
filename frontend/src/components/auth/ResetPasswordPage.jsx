import { useStytch } from "@stytch/react";
import { useState } from "react";
import { FiCheck, FiLock } from "react-icons/fi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "../ui";
import PasswordRequirements from "./PasswordRequirements";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const stytch = useStytch();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (!/[a-z]/.test(pwd)) return "Password must contain a lowercase letter";
    if (!/[A-Z]/.test(pwd)) return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(pwd)) return "Password must contain a number";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await stytch.passwords.resetByEmail({
        token,
        password,
        session_duration_minutes: 60,
      });
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
          <div className="text-center">
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-red-600">
              <FiLock size={28} />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
              Invalid Link
            </h1>
            <p className="text-sm text-zinc-500 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link
              to="/login"
              className="block w-full py-3 px-4 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-green-600">
              <FiCheck size={28} />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
              Password Reset!
            </h1>
            <p className="text-sm text-zinc-500">
              Your password has been updated. Redirecting...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
            <FiLock size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Reset Password
          </h1>
          <p className="text-sm text-zinc-500 mt-2">Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 mb-2"
            >
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-zinc-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-50 disabled:cursor-not-allowed"
            />
          </div>

          <PasswordRequirements />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="border-white/30 border-t-white" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-8">
          <Link
            to="/login"
            className="text-zinc-900 font-medium hover:underline cursor-pointer"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
