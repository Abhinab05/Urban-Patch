import "leaflet/dist/leaflet.css";
// =========================================
// Project File - Auto Commented
// These comments explain what the code does
// =========================================
// Importing required libraries/components
import React from "react";
// Importing required libraries/components
import ReactDOM from "react-dom/client";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
// Returning JSX/UI content
    return { error };
  }

  render() {
    if (this.state.error) {
// Returning JSX/UI content
      return (
        <pre style={{ whiteSpace: "pre-wrap", padding: 24, fontFamily: "monospace" }}>
          {String(this.state.error?.stack || this.state.error)}
        </pre>
      );
    }

// Returning JSX/UI content
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

async function boot() {
  try {
    const { default: UrbanPatch } = await import("./components/UrbanPatch.jsx");
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <UrbanPatch />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    root.render(
      <pre style={{ whiteSpace: "pre-wrap", padding: 24, fontFamily: "monospace" }}>
        {String(error?.stack || error)}
      </pre>
    );
  }
}

boot();