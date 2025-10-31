import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { SocketDataProvider } from "./contexts/SocketDataContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ErrorBoundary>
            <SocketDataProvider>
                <App />
            </SocketDataProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
