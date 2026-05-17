import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import { App } from "./app/App";
import { ErrorBoundary } from "./app/ErrorBoundary";
import { registerServiceWorker } from "./lib/pwa/register";
import { reportWebVitals } from "./lib/telemetry/webVitals";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LazyMotion features={domAnimation}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LazyMotion>
    </ErrorBoundary>
  </React.StrictMode>,
);

void registerServiceWorker();
void reportWebVitals();
