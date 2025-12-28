import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

import { StytchProvider } from "@stytch/react";
import { createStytchUIClient } from "@stytch/react/ui";

const stytch = createStytchUIClient(
  "public-token-test-2ba490e5-5abe-4b30-ad2b-dffa7e63131f"
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StytchProvider stytch={stytch}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StytchProvider>
  </StrictMode>
);
