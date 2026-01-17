import React, { useEffect, useState, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { useVoiceCommandHandlers } from "./useVoiceCommandHandlers";
import { useLanguage } from "@/context/LanguageContext";

const VapiAssistantComponent = () => {
  const { t, language } = useLanguage();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: typeof window !== 'undefined' ? window.innerHeight - 80 : 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const mouseDownStartRef = useRef<{ x: number, y: number } | null>(null);
  const hasMovedRef = useRef(false);

  const vapiRef = useRef<any>(null);
  const { processVoiceCommand } = useVoiceCommandHandlers();

  const getAssistantId = () => {
    const id = import.meta.env.VITE_VAPI_ASSISTANT_ID_AR;
    console.log("VapiAssistant: Using Arabic Assistant ID:", id);
    return id;
  };

  // Use a ref to always keep the latest version of processVoiceCommand
  // preventing stale closures in the Vapi event listener
  const processVoiceCommandRef = useRef(processVoiceCommand);

  useEffect(() => {
    processVoiceCommandRef.current = processVoiceCommand;
  }, [processVoiceCommand]);

  // Debugging Instance ID
  const instanceId = useRef(Math.random().toString(36).substring(7)).current;

  useEffect(() => {
    // Initialize position on client-side mount
    setPosition({ x: 24, y: window.innerHeight - 80 });
    console.log(`[VapiAssistant ${instanceId}] MOUNTED - Path: ${window.location.pathname}`);

    const API_KEY = import.meta.env.VITE_VAPI_API_KEY_AR;

    if (!API_KEY) {
      console.error("Missing Vapi API Key (VITE_VAPI_API_KEY_AR)");
      return;
    }

    const vapi = new Vapi(API_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      console.log(`[VapiAssistant ${instanceId}] Call started`);
      setIsSessionActive(true);
    });

    vapi.on("call-end", () => {
      console.log(`[VapiAssistant ${instanceId}] Call ended`);
      setIsSessionActive(false);
      setIsSpeechActive(false);
    });

    vapi.on("speech-start", () => {
      setIsSpeechActive(true);
    });

    vapi.on("speech-end", () => {
      setIsSpeechActive(false);
    });

    vapi.on("error", (error: any) => {
      console.error(`[VapiAssistant ${instanceId}] Vapi Error:`, error);
      setIsSessionActive(false);
      setIsSpeechActive(false);
    });

    // Listen for transcripts instead of tool calls
    vapi.on("message", async (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const transcriptText = message.transcript;
        console.log(`[VapiAssistant ${instanceId}] Final transcript:`, transcriptText);

        // Pass the transcript to our restored client-side Gemini logic
        if (transcriptText) {
          await processVoiceCommandRef.current(transcriptText);
        }
      }
    });

    // Auto-start the assistant
    const assistantId = getAssistantId();
    if (assistantId) {
      console.log(`[VapiAssistant ${instanceId}] Auto-starting session...`);
      vapi.start(assistantId).catch((error: any) => {
        console.error(`[VapiAssistant ${instanceId}] Failed to auto-start Vapi:`, error);
      });
    }


    return () => {
      console.log(`[VapiAssistant ${instanceId}] UNMOUNTED - Path: ${window.location.pathname}`);
      vapi.stop();
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !dragStartRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      // Calculate new position
      let newX = clientX - dragStartRef.current.x;
      let newY = clientY - dragStartRef.current.y;

      // Simple boundary checking to keep it somewhat on screen
      const boundsPadding = 10;
      const maxX = window.innerWidth - 60; // 60 is approx width
      const maxY = window.innerHeight - 60;

      newX = Math.max(boundsPadding, Math.min(newX, maxX));
      newY = Math.max(boundsPadding, Math.min(newY, maxY));

      setPosition({ x: newX, y: newY });

      // Check if moved more than a threshold to consider it a drag
      if (mouseDownStartRef.current) {
        const dist = Math.hypot(clientX - mouseDownStartRef.current.x, clientY - mouseDownStartRef.current.y);
        if (dist > 5) {
          hasMovedRef.current = true;
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      mouseDownStartRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    dragStartRef.current = { x: clientX - position.x, y: clientY - position.y };
    mouseDownStartRef.current = { x: clientX, y: clientY };
    setIsDragging(true);
    hasMovedRef.current = false;
  };

  const toggleCall = (e: React.MouseEvent) => {
    // Prevent toggle if we just dragged
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const vapi = vapiRef.current;
    if (!vapi) return;

    if (isSessionActive) {
      vapi.stop();
    } else {
      const assistantId = getAssistantId();
      if (!assistantId) {
        console.error("No Arabic Assistant ID found (VITE_VAPI_ASSISTANT_ID_AR)");
        return;
      }
      // Start WITHOUT tool definitions, just plain Vapi for STT
      vapi.start(assistantId).catch((err: any) => {
        console.error("Failed to start Vapi session:", err);
        setIsSessionActive(false);
      });
    }
  };


  return (
    <div
      className="fixed z-50 touch-none"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      <button
        className={`flex items-center justify-center rounded-full w-14 h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg transition-all duration-300 ${isDragging ? "cursor-grabbing scale-105" : "cursor-grab"} ${isSessionActive ? "shadow-xl ring-2 ring-white/30" : "shadow-md"
          }`}
        onClick={toggleCall}
        aria-label={t('intro.subtitle')}
        title={isSessionActive ? t('voice.end') : t('voice.start')}
        style={{
          transform: "scale(1)",
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
      {/* Debug Info */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap">
        ID: ...{getAssistantId()?.slice(-4) || 'None'}
      </div>
    </div>
  );
};

export const VapiAssistant = React.memo(VapiAssistantComponent);
