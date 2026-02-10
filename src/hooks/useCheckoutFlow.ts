import { useState, useCallback, useRef } from "react";
import {
    useUserInfo,
    extractName,
    extractEmail,
    extractAddress,
    extractPhone,
    extractCardNumber,
    extractExpiryDate,
    extractCVV
} from "@/hooks/useUserInfo";

export type CheckoutStep =
    | "idle"
    | "name"
    | "email"
    | "address"
    | "phone"
    | "cardName"
    | "cardNumber"
    | "expiryDate"
    | "cvv"
    | "confirm"
    | "complete";

const STEP_ORDER: CheckoutStep[] = [
    "name",
    "email",
    "address",
    "phone",
    "cardName",
    "cardNumber",
    "expiryDate",
    "cvv",
    "confirm"
];

const STEP_PROMPTS: Record<CheckoutStep, string> = {
    idle: "",
    name: "Let's complete your order. What is your full name?",
    email: "Great! What is your email address?",
    address: "What is your shipping address?",
    phone: "What is your phone number?",
    cardName: "Now for payment details. What name is on your card?",
    cardNumber: "What is your card number?",
    expiryDate: "What is the expiry date? Please say it as month and year.",
    cvv: "What is the CVV or security code on the back of your card?",
    confirm: "I have all your details. Would you like me to place the order?",
    complete: "Your order has been placed successfully!"
};

// All possible assistant phrases that should never be captured as input
const ASSISTANT_PHRASES = [
    "let's complete", "complete your order", "what is your", "what is the",
    "great", "perfect", "excellent", "thank you", "thanks", "now for",
    "please say", "i didn't catch", "i need", "say it as", "i have all",
    "would you like", "place the order", "your order has been", "successfully",
    "let's", "okay", "sure", "alright", "got it", "i understand", "cool", "wait", "hold on"
];

// Phrases that should be ignored if they appear on their own
const IGNORE_PHRASES = [
    "okay", "ok", "sure", "yeah", "yep", "no", "nope", "got it", "right", "alright", "cool", "wait", "hold on"
];

export const useCheckoutFlow = () => {
    const [currentStep, setCurrentStep] = useState<CheckoutStep>("idle");
    const [collectedData, setCollectedData] = useState<Record<string, string>>({});
    const { updateUserInfo } = useUserInfo();
    const isFlowActiveRef = useRef(false);
    const lastStepChangeRef = useRef<number>(0);

    const startFlow = useCallback(() => {
        console.log("[CheckoutFlow] Starting guided checkout flow");
        setCurrentStep("name");
        setCollectedData({});
        isFlowActiveRef.current = true;
        lastStepChangeRef.current = Date.now();
        return STEP_PROMPTS["name"];
    }, []);

    const stopFlow = useCallback(() => {
        console.log("[CheckoutFlow] Stopping checkout flow");
        setCurrentStep("idle");
        isFlowActiveRef.current = false;
    }, []);

    const getCurrentPrompt = useCallback(() => {
        return STEP_PROMPTS[currentStep];
    }, [currentStep]);

    const getNextStep = (current: CheckoutStep): CheckoutStep => {
        const currentIndex = STEP_ORDER.indexOf(current);
        if (currentIndex === -1 || currentIndex >= STEP_ORDER.length - 1) {
            return "complete";
        }
        return STEP_ORDER[currentIndex + 1];
    };

    // Check if transcript is an echo of assistant speech
    const isEcho = (transcript: string): boolean => {
        const lowerTranscript = transcript.toLowerCase().trim();

        // 1. Check against all assistant phrases
        for (const phrase of ASSISTANT_PHRASES) {
            if (lowerTranscript.includes(phrase)) {
                console.log(`[CheckoutFlow] Echo detected - contains phrase: "${phrase}"`);
                return true;
            }
        }

        // 2. Check against ALL prompts (not just current)
        for (const prompt of Object.values(STEP_PROMPTS)) {
            if (!prompt) continue;
            const cleanPrompt = prompt.toLowerCase().replace(/[^a-z0-9 ]/g, "");
            const cleanTranscript = lowerTranscript.replace(/[^a-z0-9 ]/g, "");

            // If transcript is part of any prompt or vice versa
            if (cleanTranscript.length > 5 && cleanPrompt.includes(cleanTranscript)) {
                console.log(`[CheckoutFlow] Echo detected - matches prompt: "${prompt}"`);
                return true;
            }
        }

        // 3. Too short or just acknowledgment
        const words = lowerTranscript.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 1 && ["yes", "no", "okay", "sure", "ok", "yeah", "yep", "nope"].includes(words[0])) {
            console.log(`[CheckoutFlow] Echo detected - single acknowledgment word: "${words[0]}"`);
            return true;
        }

        return false;
    };

    // Extract actual value from natural language speech using robust helpers
    const extractValue = (step: CheckoutStep, transcript: string): string => {
        const lower = transcript.toLowerCase();

        switch (step) {
            case "name":
            case "cardName":
                return extractName(transcript);
            case "email":
                return extractEmail(transcript);
            case "address":
                return extractAddress(transcript);
            case "phone":
                return extractPhone(transcript);
            case "cardNumber":
                // Aggressively strip everything except digits
                return transcript.replace(/[^0-9]/g, "");
            case "expiryDate":
                return extractExpiryDate(transcript);
            case "cvv":
                // Aggressively strip everything except digits
                return transcript.replace(/[^0-9]/g, "");
            default:
                // Basic cleanup
                return transcript.trim().replace(/[.,!?;:]+$/, "");
        }
    };

    // Validate input format for each field type
    const validateInput = (step: CheckoutStep, value: string): { valid: boolean; extractedValue: string; error: string } => {
        const trimmed = value.trim();
        const lowerValue = trimmed.toLowerCase();

        // Global check for command phrases masquerading as input
        const COMMAND_PHRASES = [
            "complete purchase", "complete the purchase", "place order", "place the order",
            "check out", "buy now", "yes complete", "yes proceed", "confirm order"
        ];
        if (COMMAND_PHRASES.some(phrase => lowerValue.includes(phrase))) {
            return {
                valid: false,
                extractedValue: "",
                error: "I still need this information before we can complete your order."
            };
        }

        switch (step) {
            case "name":
            case "cardName":
                // 1. Check for digits
                if (/\d/.test(trimmed)) {
                    return {
                        valid: false,
                        extractedValue: "",
                        error: "Names usually don't contain numbers. Please say your name again."
                    };
                }

                // 2. Length check
                const nameWords = trimmed.split(/\s+/).filter(w => w.length >= 2);
                if (nameWords.length < 1) {
                    return {
                        valid: false,
                        extractedValue: "",
                        error: "Please say your name."
                    };
                }

                // 3. Command/Question/Filler check
                // "Yes" or "No" answers to "What is your name?" are invalid
                if (["yes", "no", "yep", "nope", "sure", "ok"].includes(lowerValue.replace(/[^\w]/g, ""))) {
                    return {
                        valid: false,
                        extractedValue: "",
                        error: `Please say the ${step === "cardName" ? "name on your card" : "full name"}.`
                    };
                }

                if (lowerValue.includes("what") || lowerValue.includes("card") || lowerValue.includes("can") || lowerValue.includes("how") || lowerValue.includes("pay")) {
                    return { valid: false, extractedValue: "", error: "Please say only your name." };
                }
                return { valid: true, extractedValue: trimmed, error: "" };

            case "email":
                // Try to construct email from spoken words
                let emailValue = trimmed
                    .replace(/\s+at\s+/gi, "@")
                    .replace(/\s+dot\s+/gi, ".")
                    .replace(/\s/g, "");

                // If no @ found but contains "at" and "dot", try alternate extraction
                if (!emailValue.includes("@")) {
                    // Try to find email pattern in the original trimmed value
                    const emailMatch = trimmed.match(/([a-zA-Z0-9._+-]+)\s*(?:at|@)\s*([a-zA-Z0-9.-]+)\s*(?:dot|\.)\s*([a-zA-Z]+)/i);
                    if (emailMatch) {
                        emailValue = `${emailMatch[1].replace(/\s/g, '')}@${emailMatch[2].replace(/\s/g, '')}.${emailMatch[3].replace(/\s/g, '')}`;
                    }
                }

                // Must have @ and . and basic email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailValue)) {
                    return {
                        valid: false,
                        extractedValue: "",
                        error: "I didn't catch a valid email. Please say it like: name at gmail dot com."
                    };
                }
                return { valid: true, extractedValue: emailValue, error: "" };

            case "address":
                // Must have at least 3 words and usually a number
                const addressWords = trimmed.split(/\s+/).filter(w => w.length > 0);
                if (addressWords.length < 3) {
                    return {
                        valid: false,
                        extractedValue: "",
                        error: "Please say your complete shipping address including street and city."
                    };
                }
                if (!/\d/.test(trimmed) && addressWords.length < 4) {
                    return {
                        valid: false,
                        extractedValue: "",
                        error: "Please say your full address with house number and street."
                    };
                }

                if (lowerValue.includes("what") || lowerValue.includes("address") || lowerValue.includes("shipping")) {
                    return { valid: false, extractedValue: "", error: "Please say only your address." };
                }
                return { valid: true, extractedValue: trimmed, error: "" };

            case "phone":
                // Extract only digits
                const phoneDigits = trimmed.replace(/[^0-9]/g, "");
                if (phoneDigits.length < 10) {
                    return {
                        valid: false,
                        extractedValue: "",
                        error: "Please say your complete 10-digit phone number."
                    };
                }
                // Format as (XXX) XXX-XXXX
                const formatted = `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6, 10)}`;
                return { valid: true, extractedValue: formatted, error: "" };

            case "cardNumber":
                const cardDigits = trimmed.replace(/[^0-9]/g, "");
                if (cardDigits.length < 13 || cardDigits.length > 19) {
                    return {
                        valid: false,
                        extractedValue: "",
                        error: "Please say all 16 digits of your card number."
                    };
                }
                const cardFormatted = cardDigits.match(/.{1,4}/g)?.join(" ") || cardDigits;
                return { valid: true, extractedValue: cardFormatted, error: "" };

            case "expiryDate":
                const numbers = trimmed.match(/\d+/g);
                if (!numbers || numbers.length < 2) {
                    return {
                        valid: false,
                        extractedValue: "",
                        error: "Please say the expiry date as month and year, like 12 25."
                    };
                }
                const month = numbers[0].padStart(2, "0");
                let year = numbers[1];
                if (year.length === 4) year = year.slice(2);

                const monthNum = parseInt(month);
                if (monthNum < 1 || monthNum > 12) {
                    return {
                        valid: false,
                        extractedValue: "",
                        error: "Please say a valid month between 1 and 12."
                    };
                }
                return { valid: true, extractedValue: `${month}/${year}`, error: "" };

            case "cvv":
                const cvvDigits = trimmed.replace(/[^0-9]/g, "");
                if (cvvDigits.length < 3 || cvvDigits.length > 4) {
                    return {
                        valid: false,
                        extractedValue: "",
                        error: "The CVV should be 3 or 4 digits."
                    };
                }
                return { valid: true, extractedValue: cvvDigits, error: "" };

            default:
                return { valid: true, extractedValue: trimmed, error: "" };
        }
    };

    const processAnswer = useCallback((transcript: string): {
        success: boolean;
        nextPrompt: string;
        shouldConfirmOrder?: boolean;
    } => {
        console.log("[CheckoutFlow] Processing answer for step:", currentStep, "transcript:", transcript);

        if (currentStep === "idle") {
            return { success: false, nextPrompt: "" };
        }

        // Grace period
        const timeSinceLastChange = Date.now() - lastStepChangeRef.current;
        if (timeSinceLastChange < 500) {
            console.log(`[CheckoutFlow] Ignoring input during grace period (${timeSinceLastChange}ms since step change)`);
            return { success: false, nextPrompt: "" };
        }

        const lowerTranscript = transcript.toLowerCase();

        // 0. Handle Correction/Navigation Commands
        if (lowerTranscript.includes("go back") || lowerTranscript.includes("previous step") || (lowerTranscript.includes("wrong") && lowerTranscript.length < 20)) {
            const currentIndex = STEP_ORDER.indexOf(currentStep);
            if (currentIndex > 0) {
                const prevStep = STEP_ORDER[currentIndex - 1];
                setCurrentStep(prevStep);
                lastStepChangeRef.current = Date.now();
                return {
                    success: true,
                    nextPrompt: `Okay, let's fix that. ${STEP_PROMPTS[prevStep]}`
                };
            }
        }

        // Handle "change X" commands
        // This is a simple implementation, a full map would be better
        if (currentStep !== "confirm" && lowerTranscript.includes("change")) {
            // If user says "change name" while in email step, we could jump back.
            // For now, let's just handle "wrong" generally to go back one step.
        }

        // 1. Handle confirmation step
        if (currentStep === "confirm") {
            if (lowerTranscript.includes("yes") || lowerTranscript.includes("place") ||
                lowerTranscript.includes("confirm") || lowerTranscript.includes("proceed")) {
                setCurrentStep("complete");
                isFlowActiveRef.current = false;
                lastStepChangeRef.current = Date.now();
                return {
                    success: true,
                    nextPrompt: STEP_PROMPTS["complete"],
                    shouldConfirmOrder: true
                };
            } else if (lowerTranscript.includes("no") || lowerTranscript.includes("cancel")) {
                stopFlow();
                return { success: true, nextPrompt: "Order cancelled. Let me know if you need anything else." };
            }
            return { success: false, nextPrompt: "Please say yes to confirm or no to cancel." };
        }

        // 2. Check for echo
        if (isEcho(transcript)) {
            console.log("[CheckoutFlow] Ignoring echo:", transcript);
            return { success: false, nextPrompt: "" };
        }

        // 3. Ignore conversational fillers
        const cleanLower = lowerTranscript.trim().replace(/[^a-z ]/g, "");
        if (IGNORE_PHRASES.includes(cleanLower)) {
            console.log("[CheckoutFlow] Ignoring conversational filler:", transcript);
            return { success: false, nextPrompt: "" };
        }

        // 4. Extract value
        const extractedTranscript = extractValue(currentStep, transcript);
        console.log("[CheckoutFlow] Extracted value:", extractedTranscript, "from transcript:", transcript);

        // 5. Validate
        const validation = validateInput(currentStep, extractedTranscript);
        if (!validation.valid) {
            console.log("[CheckoutFlow] Validation failed:", validation.error);
            return { success: false, nextPrompt: validation.error };
        }

        // 6. Store data & Update Context
        const newData = { ...collectedData, [currentStep]: validation.extractedValue };
        setCollectedData(newData);

        const fieldMapping: Record<string, string> = {
            name: "name",
            email: "email",
            address: "address",
            phone: "phone",
            cardName: "cardName",
            cardNumber: "cardNumber",
            expiryDate: "expiryDate",
            cvv: "cvv"
        };

        const userInfoField = fieldMapping[currentStep];
        if (userInfoField) {
            updateUserInfo({ [userInfoField]: validation.extractedValue });

            window.dispatchEvent(new CustomEvent("userInfoUpdated", {
                detail: {
                    message: `${currentStep} updated`,
                    updatedFields: [userInfoField]
                }
            }));
        }

        // 7. Move to next step
        const nextStep = getNextStep(currentStep);
        setCurrentStep(nextStep);
        lastStepChangeRef.current = Date.now();

        if (nextStep === "complete") {
            isFlowActiveRef.current = false;
        }

        const nextPrompt = STEP_PROMPTS[nextStep];
        return { success: true, nextPrompt };

    }, [currentStep, collectedData, updateUserInfo, stopFlow, extractValue, validateInput]);

    return {
        currentStep,
        isFlowActive: isFlowActiveRef.current || currentStep !== "idle",
        collectedData,
        startFlow,
        stopFlow,
        getCurrentPrompt,
        processAnswer
    };
};