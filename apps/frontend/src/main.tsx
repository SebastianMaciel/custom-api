import { ClickToComponent } from "click-to-react-component";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      defaultTheme='dark'
      storageKey='vite-ui-theme'
    >
      <App />
      <ClickToComponent />
    </ThemeProvider>
  </StrictMode>
);
