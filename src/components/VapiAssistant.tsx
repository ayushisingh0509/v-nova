
import { useEffect, useState, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { useVoiceCommandHandlers } from "./useVoiceCommandHandlers";

export const VapiAssistant = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const vapiRef = useRef<any>(null);
  const { processVoiceCommand } = useVoiceCommandHandlers();

  useEffect(() => {
    const ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;
    const API_KEY = import.meta.env.VITE_VAPI_API_KEY;

    if (!ASSISTANT_ID || !API_KEY) {
      console.error("Missing Vapi keys");
      return;
    }

    const vapi = new Vapi(API_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      console.log("Vapi call started");
      setIsSessionActive(true);
    });

    vapi.on("call-end", () => {
      console.log("Vapi call ended");
      setIsSessionActive(false);
      setIsSpeechActive(false);
    });

    vapi.on("speech-start", () => {
      setIsSpeechActive(true);
    });

    vapi.on("speech-end", () => {
      setIsSpeechActive(false);
    });

    // Listen for transcripts instead of tool calls
    vapi.on("message", async (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const transcriptText = message.transcript;
        console.log("Final transcript received:", transcriptText);

        // Pass the transcript to our restored client-side Gemini logic
        if (transcriptText) {
          await processVoiceCommand(transcriptText);
        }
      }
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const toggleCall = () => {
    const vapi = vapiRef.current;
    if (!vapi) return;

    if (isSessionActive) {
      vapi.stop();
    } else {
      const ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;
      // Start WITHOUT tool definitions, just plain Vapi for STT
      vapi.start(ASSISTANT_ID);
    }
  };


  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        className={`flex items-center justify-center rounded-full w-14 h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg transition-all duration-300 ${isSessionActive ? "shadow-xl ring-2 ring-white/30" : "shadow-md"
          }`}
        onClick={toggleCall}
        aria-label="Voice Assistant"
        title={isSessionActive ? "End Voice Session" : "Start Voice Assistant"}
        style={{
          transform: "scale(1)",
          transition: "transform 0.2s ease-in-out",
        }}
      >
        {isSessionActive ? (
          <div className="relative h-6 w-12 flex items-center justify-center">
            {/* Simple Active Animation */}
            <div className={`w-3 h-3 bg-white rounded-full mx-1 ${isSpeechActive ? "animate-bounce" : ""}`} style={{ animationDelay: "0s" }}></div>
            <div className={`w-3 h-3 bg-white rounded-full mx-1 ${isSpeechActive ? "animate-bounce" : ""}`} style={{ animationDelay: "0.1s" }}></div>
            <div className={`w-3 h-3 bg-white rounded-full mx-1 ${isSpeechActive ? "animate-bounce" : ""}`} style={{ animationDelay: "0.2s" }}></div>
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
