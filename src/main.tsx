import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("[Flappy Sura] main.tsx loaded");

window.addEventListener("error", (e) => {
  console.error("[Flappy Sura] window error:", e.error || e.message);
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("[Flappy Sura] unhandled rejection:", e.reason);
});

try {
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    throw new Error("Root element #root not found");
  }
  createRoot(rootEl).render(<App />);
  console.log("[Flappy Sura] React app mounted");
} catch (err) {
  console.error("[Flappy Sura] mount error:", err);
}
