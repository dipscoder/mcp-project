import "./App.css";
import {
  StytchLogin,
  useStytchUser,
  useStytch,
  IdentityProvider,
} from "@stytch/react";

// Lock icon for the logo
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Notes icon for dashboard
const NotesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
    <path d="M15 3v4a2 2 0 0 0 2 2h4" />
  </svg>
);

// Stytch UI configuration with custom styling
const stytchConfig = {
  products: ["passwords"],
  passwordOptions: {
    loginRedirectURL: window.location.origin,
    resetPasswordRedirectURL: `${window.location.origin}/reset-password`,
  },
};

// Custom styles for Stytch components
const stytchStyles = {
  container: {
    width: "100%",
  },
  colors: {
    primary: "#2563eb",
    secondary: "#475569",
    success: "#10b981",
    error: "#ef4444",
  },
  buttons: {
    primary: {
      backgroundColor: "#2563eb",
      borderColor: "#2563eb",
      borderRadius: "12px",
      textColor: "#ffffff",
    },
    secondary: {
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      borderRadius: "12px",
      textColor: "#475569",
    },
  },
  inputs: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: "12px",
    placeholderColor: "#94a3b8",
    textColor: "#0f172a",
  },
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
};

// Login component with styled wrapper
function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <LockIcon />
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to access your personal notes</p>
        </div>

        <div className="stytch-wrapper">
          <StytchLogin config={stytchConfig} styles={stytchStyles} />
        </div>

        <div className="login-footer">
          <p>
            Secured by{" "}
            <a
              href="https://stytch.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stytch
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Dashboard component shown after login
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

  const getEmail = () => {
    return user?.emails?.[0]?.email || "";
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <div className="dashboard-logo-icon">
            <NotesIcon />
          </div>
          <span>Personal Notes</span>
        </div>
        <nav className="dashboard-nav">
          <button className="logout-btn" onClick={handleLogout}>
            Sign out
          </button>
        </nav>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {getDisplayName()}!</h2>
          <p>Your personal notes dashboard is ready.</p>
        </div>

        <div className="user-info-card">
          <div className="user-info-header">
            <div className="user-avatar">{getInitials()}</div>
            <div className="user-details">
              <h3>{getDisplayName()}</h3>
              <p>{getEmail()}</p>
            </div>
          </div>
          <p>
            You are now authenticated and can access your personal notes
            securely.
          </p>
        </div>
      </main>
    </div>
  );
}

// Shield icon for identity verification
const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

// Identity verification modal component
function IdentityModal() {
  return (
    <div className="identity-modal-overlay">
      <div className="identity-modal">
        <div className="identity-modal-header">
          <div className="identity-modal-icon">
            <ShieldIcon />
          </div>
          <h2>Verify Your Identity</h2>
          <p>Please grant permission to access your account securely</p>
        </div>
        <div className="identity-modal-content">
          <IdentityProvider />
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user } = useStytchUser();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      <IdentityModal />
      <Dashboard />
    </>
  );
}

export default App;
