import {
  IdentityProvider,
  StytchLogin,
  useStytch,
  useStytchUser,
} from "@stytch/react";
import { useEffect, useState } from "react";
import { FiCheck, FiFileText, FiLock, FiMail, FiShield } from "react-icons/fi";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

// Stytch configuration
const stytchConfig = {
  products: ["passwords"],
  passwordOptions: {
    loginRedirectURL: window.location.origin,
    resetPasswordRedirectURL: `${window.location.origin}/authenticate`,
  },
};

const stytchStyles = {
  container: { width: "100%" },
  colors: {
    primary: "#18181b",
    secondary: "#71717a",
    success: "#22c55e",
    error: "#ef4444",
  },
  buttons: {
    primary: {
      backgroundColor: "#18181b",
      borderColor: "#18181b",
      borderRadius: "8px",
      textColor: "#ffffff",
    },
    secondary: {
      backgroundColor: "#ffffff",
      borderColor: "#e4e4e7",
      borderRadius: "8px",
      textColor: "#18181b",
    },
  },
  inputs: {
    backgroundColor: "#ffffff",
    borderColor: "#e4e4e7",
    borderRadius: "8px",
    placeholderColor: "#a1a1aa",
    textColor: "#18181b",
  },
  fontFamily: "'Inter', system-ui, sans-serif",
};

// Password requirements display component
function PasswordRequirements() {
  return (
    <div className="mt-4 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
      <p className="text-xs font-medium text-zinc-600 mb-2">
        Password must contain:
      </p>
      <ul className="text-xs text-zinc-500 space-y-1">
        <li>At least 8 characters</li>
        <li>One uppercase letter (A-Z)</li>
        <li>One lowercase letter (a-z)</li>
        <li>One number (0-9)</li>
      </ul>
    </div>
  );
}

// OAuth Authorization Page - styled wrapper for Stytch IdentityProvider
function OAuthPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
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
            className="hover:text-zinc-600"
          >
            Stytch
          </a>
        </p>
      </div>
    </div>
  );
}

// Reset Password Page
function ResetPasswordPage() {
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
        <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-red-600">
              <FiLock size={24} />
            </div>
            <h1 className="text-xl font-semibold text-zinc-900 mb-2">
              Invalid Link
            </h1>
            <p className="text-sm text-zinc-500 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link
              to="/login"
              className="block w-full py-2.5 px-4 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
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
        <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-green-600">
              <FiCheck size={24} />
            </div>
            <h1 className="text-xl font-semibold text-zinc-900 mb-2">
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
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
            <FiLock size={24} />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Reset Password
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 mb-1.5"
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
              className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-zinc-700 mb-1.5"
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
              className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-50 disabled:cursor-not-allowed"
            />
          </div>

          <PasswordRequirements />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          <Link
            to="/login"
            className="text-zinc-900 font-medium hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

// Forgot Password Page
function ForgotPasswordPage() {
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
        <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-green-600">
              <FiMail size={24} />
            </div>
            <h1 className="text-xl font-semibold text-zinc-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-sm text-zinc-500 mb-6">
              We sent a reset link to{" "}
              <span className="font-medium text-zinc-700">{email}</span>
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="w-full py-2.5 px-4 border border-zinc-200 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors mb-3"
            >
              Try Again
            </button>
            <Link
              to="/login"
              className="text-sm text-zinc-500 hover:text-zinc-700"
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
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
            <FiLock size={24} />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Forgot Password?
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            We'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 mb-1.5"
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
              className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          <Link
            to="/login"
            className="text-zinc-900 font-medium hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

// Login Page
function LoginPage() {
  const { user } = useStytchUser();

  // Check for OAuth return URL after login
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
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
            <FiLock size={24} />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">Welcome back</h1>
          <p className="text-sm text-zinc-500 mt-1">Sign in to your account</p>
        </div>

        <StytchLogin config={stytchConfig} styles={stytchStyles} />

        <div className="mt-6 pt-4 border-t border-zinc-100 space-y-2">
          <p className="text-center text-sm text-zinc-500">
            <Link
              to="/forgot-password"
              className="text-zinc-900 font-medium hover:underline"
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
              className="hover:text-zinc-600"
            >
              Stytch
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Signup Page
function SignupPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
            <FiLock size={24} />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Create an account
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Get started with Personal Notes
          </p>
        </div>

        <StytchLogin config={stytchConfig} styles={stytchStyles} />

        <PasswordRequirements />

        <div className="mt-6 pt-4 border-t border-zinc-100">
          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-zinc-900 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Dashboard
function Dashboard() {
  const { user } = useStytchUser();
  const stytch = useStytch();

  const handleLogout = async () => {
    await stytch.session.revoke();
  };

  const getInitials = () => {
    if (user?.name?.first_name && user?.name?.last_name) {
      return `${user.name.first_name[0]}${user.name.last_name[0]}`.toUpperCase();
    }
    if (user?.emails?.[0]?.email) {
      return user.emails[0].email[0].toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (user?.name?.first_name) {
      return `${user.name.first_name}${
        user.name.last_name ? ` ${user.name.last_name}` : ""
      }`;
    }
    return user?.emails?.[0]?.email || "User";
  };

  const getEmail = () => user?.emails?.[0]?.email || "";

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
              <FiFileText size={20} />
            </div>
            <span className="font-semibold text-zinc-900">Personal Notes</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors bg-transparent shadow-none"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">
            Welcome, {getDisplayName()}!
          </h2>
          <p className="text-sm text-zinc-500">
            Your personal notes dashboard is ready.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center gap-4 pb-4 border-b border-zinc-100 mb-4">
            <div className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center text-white text-lg font-semibold">
              {getInitials()}
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">
                {getDisplayName()}
              </h3>
              <p className="text-sm text-zinc-500">{getEmail()}</p>
            </div>
          </div>
          <p className="text-sm text-zinc-600">
            You are authenticated and can access your personal notes securely.
          </p>
        </div>
      </main>
    </div>
  );
}

// Authenticate page wrapper - handles reset password tokens
function AuthenticatePage() {
  const [searchParams] = useSearchParams();
  const tokenType = searchParams.get("stytch_token_type");

  if (tokenType === "reset_password") {
    return <ResetPasswordPage />;
  }

  return <LoginPage />;
}

// Root page - checks for OAuth params or shows dashboard/login
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

// Main App
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
