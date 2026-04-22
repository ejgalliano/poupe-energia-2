import * as React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const HelmetProviderComponent = HelmetProvider as unknown as React.ComponentType<React.PropsWithChildren>;

createRoot(document.getElementById("root")!).render(
  <HelmetProviderComponent>
    <App />
  </HelmetProviderComponent>
);
