import React, { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { createPortal } from "react-dom";

// Create a simple VoiceIndicator component that shows the voice status
export const VoiceIndicator = () => {
  const [isListening, setIsListening] = useState(false);
  const [lastAction, setLastAction] = useState("");
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  // Create portal element on mount
  useEffect(() => {
    // Create a div that will be appended directly to body
    const el = document.createElement("div");
    el.id = "voice-indicator-portal";
    // Apply styles directly to the container element
    el.style.position = "fixed";
    el.style.bottom = "24px";
    el.style.right = "24px";  // Ensure this is 24px not 1px
    el.style.zIndex = "999999";
    el.style.pointerEvents = "auto";
    el.style.display = "flex";
    el.style.flexDirection = "column";
    el.style.alignItems = "flex-end";

    document.body.appendChild(el);
    setPortalElement(el);

    return () => {
      if (document.body.contains(el)) {
        document.body.removeChild(el);
      }
    };
  }, []);

  // Listen for voice recognition status changes
  useEffect(() => {
    const handleVoiceStatus = (event: CustomEvent) => {
      setIsListening(event.detail.isListening);
      if (event.detail.lastAction) {
        setLastAction(event.detail.lastAction);
      }
    };

    // Add event listener for voice status updates
    window.addEventListener("voice-status" as any, handleVoiceStatus);

    // Check localStorage for last action on mount
    const storedAction = localStorage.getItem("lastVoiceAction");
    if (storedAction) {
      setLastAction(storedAction);
    }

    return () => {
      window.removeEventListener("voice-status" as any, handleVoiceStatus);
    };
  }, []);

  // Toggle voice recognition
  const toggleListening = () => {
    const newStatus = !isListening;
    setIsListening(newStatus);
    console.log("Voice listening toggled:", newStatus);

    // Dispatch custom event to notify VoiceListener component
    window.dispatchEvent(
      new CustomEvent("toggle-voice", {
        detail: { isListening: newStatus },
      })
    );
  };

  const indicatorContent = (
    <>
      {lastAction && (
        <div
          style={{
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            marginBottom: "8px",
            maxWidth: "300px",
          }}
        >
          <p style={{ fontSize: "14px", margin: 0 }}>{lastAction}</p>
        </div>
      )}
      <button
        onClick={toggleListening}
        style={{
          borderRadius: "50%",
          padding: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          border: "none",
          cursor: "pointer",
          transition: "all 0.3s ease",
          backgroundColor: isListening ? "#ef4444" : "#3b82f6",
          width: "56px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
        aria-label={isListening ? "Stop voice control" : "Start voice control"}
      >
        <Phone style={{ height: "24px", width: "24px", color: "white" }} />
      </button>
    </>
  );

  // Use portal to render outside of normal DOM hierarchy
  return portalElement ? createPortal(indicatorContent, portalElement) : null;
};
