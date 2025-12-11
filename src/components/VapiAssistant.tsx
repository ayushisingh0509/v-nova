import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Create a global singleton tracker
if (typeof window !== "undefined") {
  window.__VAPI_SINGLETON = window.__VAPI_SINGLETON || {
    initialized: false,
    scriptLoaded: false,
    instanceId: null,
    isActive: false,
  };
}

interface VapiConfig {
  position?: "bottom-right" | "bottom-left";
  size?: "small" | "medium" | "large";
  backgroundColor?: string;
  iconColor?: string;
}

interface VapiProps {
  config?: VapiConfig;
}

declare global {
  interface Window {
    vapiSDK: {
      run: (config: {
        apiKey: string;
        assistant: string;
        config?: VapiConfig;
      }) => any;
    };
    vapiInstance: any;
    __VAPI_SINGLETON: {
      initialized: boolean;
      scriptLoaded: boolean;
      instanceId: string | null;
      isActive: boolean;
    };
  }
}

export const VapiAssistant = ({ config }: VapiProps) => {
  const location = useLocation();

  // Function to inject custom CSS
  const injectVapiStyles = () => {
    if (document.getElementById("vapi-custom-styles")) return;

    const styleSheet = document.createElement("style");
    styleSheet.id = "vapi-custom-styles";
    styleSheet.innerHTML = `
      /* Position the Vapi button in the bottom right */
      .vapi-btn-container {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        left: auto !important;
        z-index: 2147483647 !important; /* Maximum possible z-index */
      }
      
      /* Change button color to red when active */
      .vapi-call-status-indicator {
        background-color: #ef4444 !important; /* Red color when active */
      }
      
      /* Make button always green when inactive */
      .vapi-button {
        background-color: #22c55e !important; /* Green color for inactive state */
      }
      
      /* Add additional styles to make sure it's visible and well-positioned */
      #vapi-container {
        position: fixed !important;
        z-index: 2147483647 !important;
        pointer-events: auto !important;
        bottom: 0 !important;
        right: 0 !important;
      }
    `;
    document.head.appendChild(styleSheet);
    console.log("Vapi custom styles injected");
  };

  useEffect(() => {
    // Inject custom styles first
    injectVapiStyles();

    // If we're on the cart page, try to reinitialize Vapi
    if (
      location.pathname === "/cart" &&
      window.__VAPI_SINGLETON.initialized &&
      !window.vapiInstance
    ) {
      console.log("On cart page, trying to recover Vapi instance");
      window.__VAPI_SINGLETON.initialized = false; // Force reinitialization
    }

    // If Vapi is already initialized, don't initialize it again
    if (window.__VAPI_SINGLETON.initialized && window.vapiInstance) {
      console.log("Vapi instance already exists, skipping initialization");
      return;
    }

    const ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID as string | undefined;
    const API_KEY = import.meta.env.VITE_VAPI_API_KEY as string | undefined;
    if (!ASSISTANT_ID || !API_KEY) {
      console.error("Missing VAPI env vars. Set VITE_VAPI_ASSISTANT_ID and VITE_VAPI_API_KEY in .env.local.");
      return; // Don't attempt to load/init without required configuration
    }

    const buttonConfig: VapiConfig = {
      position: "bottom-right", // Always bottom right
      size: "medium",
      backgroundColor: "#22c55e", // Green when inactive
      iconColor: "#ffffff",
      ...config,
    };

    // Create the script element if it hasn't been loaded yet
    if (!window.__VAPI_SINGLETON.scriptLoaded) {
      console.log("Loading Vapi script...");
      const existingScript = document.getElementById("vapi-script");
      if (existingScript) {
        console.log("Vapi script tag already exists");
        window.__VAPI_SINGLETON.scriptLoaded = true;
      } else {
        const script = document.createElement("script");
        script.id = "vapi-script";
        script.src =
          "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
        script.defer = true;
        script.async = true;

        script.onload = () => {
          console.log("Vapi script loaded successfully");
          window.__VAPI_SINGLETON.scriptLoaded = true;
          setTimeout(() => initializeVapi(), 500); // Add delay for better reliability
        };

        script.onerror = (e) => {
          console.error("Failed to load Vapi script:", e);
          window.__VAPI_SINGLETON.scriptLoaded = false; // Reset so we can try again
        };

        document.body.appendChild(script);
      }
    } else {
      console.log("Vapi script already loaded, initializing directly");
      // If the script is already loaded, initialize Vapi directly
      setTimeout(() => initializeVapi(), 100); // Small delay for better reliability
    }

    // Function to initialize Vapi with the SDK
    function initializeVapi() {
      // Only initialize if the SDK is available and we haven't initialized already
      if (window.vapiSDK && !window.__VAPI_SINGLETON.initialized) {
        console.log("Initializing Vapi instance...");
        try {
          window.vapiInstance = window.vapiSDK.run({
            apiKey: API_KEY as string,
            assistant: ASSISTANT_ID as string,
            config: buttonConfig,
          });

          window.__VAPI_SINGLETON.initialized = true;
          window.__VAPI_SINGLETON.instanceId = ASSISTANT_ID;
          console.log("Vapi instance created successfully");

          // Ensure our custom styles are applied to the button
          setTimeout(fixVapiButtonStyles, 500);
          setTimeout(fixVapiButtonStyles, 1000);
          setTimeout(fixVapiButtonStyles, 2000); // Try multiple times
        } catch (error) {
          console.error("Error initializing Vapi:", error);
          window.__VAPI_SINGLETON.initialized = false; // Reset so we can try again
        }
      }
    }

    // Function to ensure Vapi button has our custom styles
    function fixVapiButtonStyles() {
      try {
        const vapiButton = document.querySelector(".vapi-btn-container");
        if (vapiButton) {
          vapiButton.setAttribute(
            "style",
            "position: fixed !important; bottom: 20px !important; right: 20px !important; left: auto !important; z-index: 2147483647 !important;"
          );
          console.log("Vapi button styles enforced");
        }
      } catch (e) {
        console.error("Failed to enforce Vapi button styles:", e);
      }
    }

    // Listen for page visibility changes to fix potential issues when tab becomes active again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Page became visible, checking Vapi state");
        setTimeout(fixVapiButtonStyles, 100);

        // If initialized but instance is somehow missing, recover
        if (window.__VAPI_SINGLETON.initialized && !window.vapiInstance) {
          console.log("Vapi state mismatch detected, recovering");
          window.__VAPI_SINGLETON.initialized = false;
          initializeVapi();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function - we don't fully clean up the instance on unmount
    // to maintain the singleton pattern, but we do clean up when the window unloads
    const handleBeforeUnload = () => {
      cleanupVapi();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Note: We're NOT destroying the Vapi instance on component unmount
      // This is intentional to keep it as a singleton
    };
  }, [config, location.pathname]);

  // Function to properly cleanup Vapi when the page is actually unloaded
  const cleanupVapi = () => {
    if (window.vapiInstance) {
      // Perform any necessary cleanup for the Vapi instance
      try {
        if (window.vapiInstance.deactivate) {
          window.vapiInstance.deactivate();
        }
        window.vapiInstance = null;
        window.__VAPI_SINGLETON.initialized = false;
        window.__VAPI_SINGLETON.instanceId = null;
        window.__VAPI_SINGLETON.isActive = false;

        // We don't set scriptLoaded to false because the script is still loaded in the DOM
      } catch (error) {
        console.error("Error cleaning up Vapi:", error);
      }
    }
  };

  return null;
};
