
import React, { useEffect, useState, useRef } from "react";
import { useVoiceCommandHandlers } from "./useVoiceCommandHandlers";

declare global {
  interface Window {
    handleExternalVoiceCommand?: (text: string) => void;
  }
}

export const VoiceListener = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Forward declaration for the recovery function so it can be passed to the hook
  // We use a ref to accessing the latest version if needed, or just define it stable.
  // Actually, capturing variables works if we just define the function.
  // But wait, the hook is called at the top level.
  // We need to pass the function to the hook.

  // Implementation of restart logic
  const handleRestart = () => {
    console.log("Restarting voice recognition requested by handler");
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);

    // Delayed restart
    setTimeout(() => {
      startListening();
    }, 1000);
  };

  const { processVoiceCommand, logAction, setLastAction } = useVoiceCommandHandlers({
    onRequestRestart: handleRestart
  });

  // Keep the latest processVoiceCommand in a ref to avoid stale closures in the onresult callback
  const processVoiceCommandRef = useRef(processVoiceCommand);

  useEffect(() => {
    processVoiceCommandRef.current = processVoiceCommand;
  }, [processVoiceCommand]);

  const startListening = async () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec && !isListening) {
      // Proactively request mic permission to avoid NotAllowedError on first start
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } catch (permErr) {
        console.error("Microphone permission error:", permErr);
        setLastAction("Please allow microphone access to use voice assistant");
        return;
      }

      recognitionRef.current = new SpeechRec();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        console.log("Voice recognition activated");
        logAction("Voice recognition started");
      };

      recognitionRef.current.onresult = async (event: any) => {
        // Temporarily stop listening while processing
        recognitionRef.current.stop();

        const results = Array.from(event.results);
        for (let result of results) {
          const transcriptText = (result as any)[0].transcript.toLowerCase();
          setTranscript(transcriptText);
          console.log("Processing command:", transcriptText);

          // Use the ref to ensure we call the latest version of the handler with fresh closures
          await processVoiceCommandRef.current(transcriptText);
        }

        startListening();
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Error occurred in recognition:", event.error);
        logAction(`Recognition error: ${event.error}`, false);

        if (event.error !== "aborted") {
          setIsListening(false);
          recognitionRef.current = null;
          // Restart listening after error
          setTimeout(startListening, 1000);
        }
      };

      recognitionRef.current.onend = () => {
        // Only restart if we're not actively processing a command
        if (isListening) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error("Restart failed:", error);
            logAction("Failed to restart recognition", false);
            setIsListening(false);
            recognitionRef.current = null;
            setTimeout(startListening, 300);
          }
        }
      };

      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Failed to start recognition:", error);
        logAction("Failed to start recognition", false);
        setIsListening(false);
        recognitionRef.current = null;
      }
    }
  };

  // Bridge external widget transcripts/intents into our handler
  useEffect(() => {
    const forward = (e: any) => {
      try {
        const detail = e?.detail;
        const text = (typeof detail === 'string') ? detail : (detail?.text || detail?.transcript || detail?.message || "");
        if (text) {
          console.log("Forwarding external voice command:", text);
          setTranscript(text.toLowerCase());
          processVoiceCommandRef.current(text.toLowerCase());
        }
      } catch (err) {
        console.error("Failed to forward external voice command:", err);
      }
    };

    window.handleExternalVoiceCommand = (text: string) => {
      if (!text) return;
      console.log("handleExternalVoiceCommand called:", text);
      setTranscript(text.toLowerCase());
      processVoiceCommandRef.current(text.toLowerCase());
    };

    window.addEventListener("voice:external-command", forward as EventListener);
    window.addEventListener("vapi:transcript", forward as EventListener);
    window.addEventListener("vapi:final", forward as EventListener);

    return () => {
      window.removeEventListener("voice:external-command", forward as EventListener);
      window.removeEventListener("vapi:transcript", forward as EventListener);
      window.removeEventListener("vapi:final", forward as EventListener);
    };
  }, []); // Empty dependency array is safe because we use the ref

  useEffect(() => {
    startListening();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Create a restart button that's positioned over the voice assistant button
  const handleRestartClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsListening(false);
    console.log("Manual restart of voice recognition");
    logAction("Manual restart of voice recognition");

    // Start listening again regardless of current state
    setTimeout(() => {
      startListening();
      setLastAction("Voice recognition manually restarted");
    }, 300);
  };

  // Render a visible button that matches the VoiceAssistant design
  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        className={`flex items-center justify-center rounded-full w-14 h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg transition-all duration-300 ${isListening ? "shadow-xl ring-2 ring-white/30" : "shadow-md"
          }`}
        onClick={handleRestartClick}
        aria-label="Voice Recognition"
        title="Click to restart voice recognition"
        style={{
          transform: "scale(1)",
          transition: "transform 0.2s ease-in-out",
        }}
      >
        {isListening ? (
          <div className="relative h-6 w-12 flex items-center justify-center">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="bg-white w-1.5 mx-0.5 rounded-full mic-bar"
                style={{
                  height: "15px",
                  animationDelay: `${index * 0.1}s`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
            <div className="absolute inset-0 rounded-full border-2 border-white/50 mic-pulse" />
          </div>
        )}
      </button>

      {/* Add CSS animations for the mic animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes voicePulse {
          0%, 100% { height: 5px; }
          50% { height: 15px; }
        }
        .mic-bar {
          animation: voicePulse 0.8s infinite ease-in-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .mic-pulse {
          animation: pulse 2s infinite;
        }
      `,
        }}
      />
    </div>
  );
};
