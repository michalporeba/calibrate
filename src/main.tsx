import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { StorageProvider } from "./components/StorageProvider";
import "./styles.css";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");
document.body.dataset.theme = __APP_THEME__;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <StorageProvider>
        <App />
      </StorageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
