import { useStytch } from "@stytch/react";
import { useState } from "react";
import { FiLock, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Spinner } from "../ui";

export default function ForgotPasswordPage() {
  const stytch = useStytch();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await stytch.passwords.resetByEmailStart({
        email,
        reset_password_redirect_url: `${window.location.origin}/authenticate`,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-green-600">
              <FiMail size={28} />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-sm text-zinc-500 mb-6">
              We sent a reset link to{" "}
              <span className="font-medium text-zinc-700">{email}</span>
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="w-full py-3 px-4 border border-zinc-200 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer mb-4"
            >
              Try Again
            </button>
            <Link
              to="/login"
              className="text-sm text-zinc-500 hover:text-zinc-700 cursor-pointer"
            >
              Back to Login
            </Link>
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
            Forgot Password?
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            We'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="border-white/30 border-t-white" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
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
