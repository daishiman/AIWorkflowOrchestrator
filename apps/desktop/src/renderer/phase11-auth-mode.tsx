import React from "react";
import ReactDOM from "react-dom/client";
import { SettingsView } from "./views/SettingsView";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
    <SettingsView />
  </div>,
);
