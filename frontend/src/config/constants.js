// Backend API URL
export const BACKEND_URL = "http://localhost:8000";

// Validation limits
export const MAX_TITLE_LENGTH = 100;
export const MAX_CONTENT_LENGTH = 10000;

// Stytch configuration
export const stytchConfig = {
  products: ["passwords"],
  passwordOptions: {
    loginRedirectURL: window.location.origin,
    resetPasswordRedirectURL: `${window.location.origin}/authenticate`,
  },
};

export const stytchStyles = {
  container: {
    width: "100%",
  },
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
