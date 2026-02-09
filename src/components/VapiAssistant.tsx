import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Vapi from "@vapi-ai/web";
import { useVoiceCommandHandlers } from "./useVoiceCommandHandlers";
import { useLanguage } from "@/context/LanguageContext";

const VapiAssistantComponent = () => {
  const { t } = useLanguage();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 0 }); // Static default for hydration safety
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const mouseDownStartRef = useRef<{ x: number, y: number } | null>(null);
  const hasMovedRef = useRef(false);
  const isSpeechActiveRef = useRef(false);

  const vapiRef = useRef<any>(null);
  const location = useLocation();
  const { processVoiceCommand, startCheckoutFlow, checkoutFlow, speak, registerSpeakCallback } = useVoiceCommandHandlers();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isInitialMountRef = useRef(true);
  const wasActiveRef = useRef(false);
  const hasStartedCheckoutFlowRef = useRef(false);
  const lastSpeechEndRef = useRef<number>(0);
  const lastAssistantMessageRef = useRef<string>("");

  const ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;

  // Use a ref to always keep the latest version of processVoiceCommand
  // preventing stale closures in the Vapi event listener
  const processVoiceCommandRef = useRef(processVoiceCommand);

  useEffect(() => {
    processVoiceCommandRef.current = processVoiceCommand;
  }, [processVoiceCommand]);

  // Debugging Instance ID
  const instanceId = useRef(Math.random().toString(36).substring(7)).current;

  // Handle position on resize (hydration-safe)
  useEffect(() => {
    const updatePosition = () => setPosition({ x: 24, y: window.innerHeight - 80 });
    window.addEventListener('resize', updatePosition);
    updatePosition(); // Set initial position after mount
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  // Register speak callback to use Vapi's say function
  useEffect(() => {
    registerSpeakCallback((text: string) => {
      console.log(`[VapiAssistant] Speaking: ${text}`);
      if (vapiRef.current && isSessionActive) {
        // Use Vapi's send method to make the assistant speak
        vapiRef.current.send({
          type: "add-message",
          message: {
            role: "system",
            content: `Say this to the user: "${text}"`
          }
        });
      }
    });
  }, [registerSpeakCallback, isSessionActive]);

  // Auto-start checkout flow when navigating to payment page
  useEffect(() => {
    if (location.pathname === "/payment" && isSessionActive && !hasStartedCheckoutFlowRef.current) {
      console.log("[VapiAssistant] On payment page - starting guided checkout flow");
      hasStartedCheckoutFlowRef.current = true;

      // Delay slightly to ensure page is rendered
      setTimeout(() => {
        const prompt = startCheckoutFlow();
        speak(prompt);
      }, 1500);
    }

    // Reset flag when leaving payment page
    if (location.pathname !== "/payment") {
      hasStartedCheckoutFlowRef.current = false;
    }
  }, [location.pathname, isSessionActive, startCheckoutFlow, speak]);

  // Initialize Vapi
  useEffect(() => {
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    console.log(`[VapiAssistant ${instanceId}] CONF UPDATE - Path: ${window.location.pathname}`);

    const API_KEY = import.meta.env.VITE_VAPI_API_KEY;

    if (!API_KEY) {
      console.error("Missing VITE_VAPI_API_KEY");
      return;
    }

    // Cleanup previous instance if it exists to strictly prevent duplicates
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
        vapiRef.current = null;
      } catch (e) {
        console.warn("Error stopping previous Vapi instance:", e);
      }
    }

    const vapi = new Vapi(API_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      console.log(`[VapiAssistant ${instanceId}] Call started`);
      setIsSessionActive(true);
      setIsSpeechActive(false);
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful start
    });

    vapi.on("call-end", () => {
      console.log(`[VapiAssistant ${instanceId}] Call ended`);
      setIsSessionActive(false);
      setIsSpeechActive(false);

      // Attempt to reconnect if the call was active unexpectedly ended
      if (wasActiveRef.current && reconnectAttemptsRef.current < 3) {
        console.log(`[VapiAssistant ${instanceId}] Attempting to reconnect (attempt ${reconnectAttemptsRef.current + 1}/3)...`);
        reconnectAttemptsRef.current += 1;

        reconnectTimeoutRef.current = setTimeout(() => {
          if (ASSISTANT_ID && vapiRef.current) {
            vapiRef.current.start(ASSISTANT_ID).catch((error: any) => {
              console.error(`[VapiAssistant ${instanceId}] Reconnection failed:`, error);
            });
          }
        }, 1000); // Wait 1 second before reconnecting
      }

      // Clear instance reference on manual stop to prevent zombie connections
      if (!wasActiveRef.current) {
        vapiRef.current = null;
        reconnectAttemptsRef.current = 0;
      }
    });





    // ... (keep existing code)

    vapi.on("speech-start", () => {
      setIsSpeechActive(true);
      isSpeechActiveRef.current = true;
    });

    vapi.on("speech-end", () => {
      setIsSpeechActive(false);
      isSpeechActiveRef.current = false;
      lastSpeechEndRef.current = Date.now();
    });

    vapi.on("error", (error: any) => {
      console.error(`[VapiAssistant ${instanceId}] Vapi Error:`, JSON.stringify(error, null, 2));

      const errorMsg = error?.error?.msg || error?.message || "Unknown error";

      // Handle known startup errors
      // expanded check to catch more variations of ejection or auth errors
      if (
        (error?.type === 'daily-error') ||
        (errorMsg.includes('ejection')) ||
        (errorMsg.includes('401'))
      ) {
        console.error("CRITICAL: Vapi connection rejected/failed. Checking credentials...");
        reconnectAttemptsRef.current = 999; // Prevent reconnection attempts
        setIsSessionActive(false);
        setIsSpeechActive(false);

        // If we are in the reconnection loop, kill it
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        return;
      }

      setIsSessionActive(false);
      setIsSpeechActive(false);

      // Attempt to reconnect on non-auth errors
      if (reconnectAttemptsRef.current < 3) {
        console.log(`[VapiAssistant ${instanceId}] Attempting to reconnect after error (attempt ${reconnectAttemptsRef.current + 1}/3)...`);
        reconnectAttemptsRef.current += 1;

        reconnectTimeoutRef.current = setTimeout(() => {
          if (ASSISTANT_ID && vapiRef.current) {
            vapiRef.current.start(ASSISTANT_ID).catch((err: any) => {
              console.error(`[VapiAssistant ${instanceId}] Reconnection after error failed:`, err);
            });
          }
        }, 3000); // Wait 3 seconds before reconnecting after error
      }
    });

    // Listen for transcripts and conversation updates
    vapi.on("message", async (message: any) => {
      // 1. Capture Assistant's Speech Content
      if (message.type === "conversation-update") {
        if (message.conversation && message.conversation.length > 0) {
          const lastMsg = message.conversation[message.conversation.length - 1];
          // If the last message was from the assistant, store it
          if (lastMsg.role === "assistant") {
            const content = typeof lastMsg.content === 'string' ? lastMsg.content : "";
            if (content) {
              console.log(`[VapiAssistant] Assistant said: "${content.substring(0, 50)}..."`);
              lastAssistantMessageRef.current = content;
              lastSpeechEndRef.current = Date.now(); // Update timestamp here too for safety
            }
          }
        }
      }

      // 2. Process Transcripts
      if (message.type === "transcript" && message.transcriptType === "final") {
        const transcriptText = message.transcript;
        console.log(`[VapiAssistant ${instanceId}] Final transcript:`, transcriptText);

        // Global Echo Suppression
        // Ignore if assistant is currently speaking
        if (isSpeechActiveRef.current) {
          console.log("[VapiAssistant] Ignoring transcript - Assistant is speaking");
          return;
        }

        // Time-based suppression: increased to 4s
        const timeSinceSpeech = Date.now() - lastSpeechEndRef.current;
        if (timeSinceSpeech < 2000) {
          console.log(`[VapiAssistant] Ignoring transcript - Assistant spoke recently (${timeSinceSpeech}ms ago)`);
          return;
        }

        // Content-based suppression: Check if transcript matches what assistant just said
        if (lastAssistantMessageRef.current) {
          const cleanTranscript = transcriptText.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
          const cleanAssistant = lastAssistantMessageRef.current.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

          // Check for significant overlap
          if (cleanAssistant.length > 5 && (cleanAssistant.includes(cleanTranscript) || cleanTranscript.includes(cleanAssistant))) {
            console.log(`[VapiAssistant] Ignoring transcript - Matched assistant's last message`);
            return;
          }
        }

        // Pass the transcript to our client-side Gemini logic
        if (transcriptText) {
          await processVoiceCommandRef.current(transcriptText);
        }
      }
    });

    if (ASSISTANT_ID) {
      // Auto-start on initial mount
      if (isInitialMountRef.current) {
        console.log(`[VapiAssistant ${instanceId}] Auto-starting session with ID: ${ASSISTANT_ID.slice(0, 8)}...`);
        setTimeout(() => {
          vapi.start(ASSISTANT_ID).catch((error: any) => {
            console.error(`[VapiAssistant ${instanceId}] Failed to auto-start Vapi:`, error);
            setIsSessionActive(false);
            reconnectAttemptsRef.current = 0;
          });
        }, 100);
      }

      // Mark initial mount as complete
      if (isInitialMountRef.current) {
        isInitialMountRef.current = false;
      }
    }

    return () => {
      console.log(`[VapiAssistant ${instanceId}] CLEANUP`);

      // Clear reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      try {
        if (vapiRef.current) {
          vapiRef.current.stop();
        }
      } catch (e) {
        // Ignore stop errors on unmount
      }
      vapiRef.current = null;
    };
  }, []); // Empty dependency array - no language changes

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
      // Clear any pending reconnection attempts when manually stopping
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      reconnectAttemptsRef.current = 999; // Prevent auto-reconnection when manually stopped
      wasActiveRef.current = false;
      vapi.stop();
    } else {
      // Reset reconnect attempts when manually starting
      reconnectAttemptsRef.current = 0;
      wasActiveRef.current = true;

      if (!ASSISTANT_ID) {
        console.error("No Assistant ID found");
        return;
      }
      // Start WITHOUT tool definitions, just plain Vapi for STT
      vapi.start(ASSISTANT_ID).catch((err: any) => {
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
        ID: ...{ASSISTANT_ID?.slice(-4) || 'None'}
      </div>
    </div>
  );
};

export const VapiAssistant = React.memo(VapiAssistantComponent);
