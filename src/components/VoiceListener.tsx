import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { products } from "@/data/products";
import { prompts } from "@/lib/prompts";
import { useFilters, FilterState } from "@/context/FilterContext";
import { filterOptions } from "@/data/products";
import { useProduct } from "@/context/ProductContext";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useCart } from "@/context/CartContext";

declare global {
  interface Window {
    handleExternalVoiceCommand?: (text: string) => void;
  }
}

// Initialize Gemini with Vite environment variable
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
if (!geminiApiKey) {
  console.error("Missing VITE_GEMINI_API_KEY. Set it in your .env.local file.");
}
const genAI = new GoogleGenerativeAI(geminiApiKey ?? "");

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-1.5-flash"];

const callGeminiWithFallback = async <T>(
  action: (model: ReturnType<typeof genAI.getGenerativeModel>) => Promise<T>
): Promise<T> => {
  let lastError: any = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      return await action(model);
    } catch (error: any) {
      lastError = error;
      const status =
        error?.status ??
        error?.cause?.status ??
        error?.response?.status ??
        error?.code ??
        error?.message;

      console.warn(
        `Gemini model ${modelName} failed${status ? ` with status ${status}` : ""}.`,
        error
      );

      const isRetryable =
        (typeof status === "number" && status >= 500) ||
        (typeof status === "string" && /5\d{2}/.test(status)) ||
        /overloaded|unavailable|temporarily|try again/i.test(String(error));

      if (isRetryable) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
};

const runGeminiText = async (prompt: string): Promise<string> => {
  const responseText = await callGeminiWithFallback(async (model) => {
    const result = await model.generateContent(prompt);
    return await result.response.text();
  });
  return responseText;
};

// Add this to the availableFunctions object
// Update UserInfo interface to include credit card details
interface UserInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
  cardName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

const availableFunctions = {
  showGymClothes: {
    name: "showGymClothes",
    description:
      "Execute this function if the user is interested in gym clothes or any related activities or equipment associated with the gym only.",
    parameters: {},
  },
  showYogaEquipment: {
    name: "showYogaEquipment",
    description:
      "Execute this function if the user is interested in any yoga activities or asks about yoga in general.",
    parameters: {},
  },
  navigateToCategory: {
    name: "navigateToCategory",
    description:
      "Navigate to a specific product category (gym, yoga, or running/jogging)",
    parameters: {
      category: {
        type: "string",
        enum: ["gym", "yoga", "running"],
        description: "The category to navigate to",
      },
    },
  },
  goToCart: {
    name: "goToCart",
    description: "Navigate to shopping cart",
    parameters: {},
  },
  checkout: {
    name: "checkout",
    description: "Start checkout process",
    parameters: {},
  },
  showRunningGear: {
    name: "showRunningGear",
    description:
      "Execute this function if the user is interested in running, jogging, or any running-related activities or equipment",
    parameters: {},
  },
  applyFilters: {
    name: "applyFilters",
    description:
      "Apply filters to the product listing page, such as colors, sizes, price ranges, brands, etc.",
    parameters: {},
  },
  clearFilters: {
    name: "clearFilters",
    description: "Clear all applied filters on the product listing page",
    parameters: {},
  },
};

export const VoiceListener = () => {
  const { updateUserInfo, getUserInfo } = useUserInfo();
  const { updateFilters, clearFilters, removeFilter, filters } = useFilters();
  const { setSelectedSize, setQuantity, selectedSize, quantity } = useProduct();
  const { items, totalItems, subtotal } = useCart();
  const location = useLocation();
  const params = useParams();

  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [lastAction, setLastAction] = useState<string>("");
  const [actionLog, setActionLog] = useState<
    Array<{ timestamp: number; action: string; success: boolean }>
  >([]);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);

  // Add logging function to track all actions for diagnostics
  const logAction = (action: string, success: boolean = true) => {
    console.log(`Voice Action [${success ? "SUCCESS" : "FAILURE"}]: ${action}`);

    // Add to internal log for debugging
    setActionLog((prevLog) => {
      const newLog = [
        { timestamp: Date.now(), action, success },
        ...prevLog.slice(0, 19), // Keep last 20 actions
      ];
      return newLog;
    });

    // Reset or increment error counter
    if (success) {
      setConsecutiveErrors(0);
    } else {
      setConsecutiveErrors((prev) => prev + 1);
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
          handleVoiceCommand(text.toLowerCase());
        }
      } catch (err) {
        console.error("Failed to forward external voice command:", err);
      }
    };

    window.handleExternalVoiceCommand = (text: string) => {
      if (!text) return;
      console.log("handleExternalVoiceCommand called:", text);
      setTranscript(text.toLowerCase());
      handleVoiceCommand(text.toLowerCase());
    };

    window.addEventListener("voice:external-command", forward as EventListener);
    window.addEventListener("vapi:transcript", forward as EventListener);
    window.addEventListener("vapi:final", forward as EventListener);

    return () => {
      window.removeEventListener("voice:external-command", forward as EventListener);
      window.removeEventListener("vapi:transcript", forward as EventListener);
      window.removeEventListener("vapi:final", forward as EventListener);
    };
  }, []);

  // New error recovery function
  const handleRecovery = () => {
    // If we have 3+ consecutive errors, try restarting the recognition service
    if (consecutiveErrors >= 3) {
      console.log("Multiple errors detected, restarting voice recognition");
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      setConsecutiveErrors(0);

      // Delayed restart
      setTimeout(() => {
        startListening();
        setLastAction("Voice assistant restarted after detecting issues");
      }, 1000);
    }
  };

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
          const transcript = result[0].transcript.toLowerCase();
          setTranscript(transcript);
          console.log("Processing command:", transcript);
          logAction(`Received command: "${transcript}"`);

          try {
            // Handle voice commands
            await handleVoiceCommand(transcript);
          } catch (error) {
            console.error("Error in command handling:", error);
            logAction(`Failed to process: "${transcript}"`, false);
            setLastAction(`Error processing: "${transcript}"`);

            // Try recovery if needed
            handleRecovery();
          }
        }

        // Resume listening after processing
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

  // Implement robust two-tier intent classification and handling system
  const handleVoiceCommand = async (command: string) => {
    console.log("Processing command:", command);
    logAction(`Processing command: "${command}"`);

    // Show feedback that we're processing the command
    setLastAction(`Processing: "${command}"`);

    try {
      // Fast-path: try deterministic handlers before LLM
      const directHandled = await handleDirectCommands(command);
      if (directHandled) {
        logAction(`Handled via direct rules: "${command}"`);
        return;
      }

      // Record start time for performance tracking
      const startTime = performance.now();

      // FIRST TIER: Identify the primary intent using the master classifier
      const primaryIntent = await classifyPrimaryIntent(command);
      console.log("Primary intent identified:", primaryIntent);
      logAction(`Identified primary intent: ${primaryIntent}`);

      // Record classification time
      const classificationTime = performance.now() - startTime;
      console.log(
        `Intent classification took ${classificationTime.toFixed(2)}ms`
      );

      // SECOND TIER: Route to specialized handlers based on primary intent
      let handled = false;
      let handlerStartTime = performance.now();

      switch (primaryIntent) {
        case "navigation":
          handled = await handleNavigationCommand(command);
          break;

        case "order_completion":
          handled = await handleOrderCompletion(command);
          break;

        case "user_info":
          handled = await handleUserInfoUpdate(command);
          break;

        case "cart":
          handled = await handleCartNavigation(command);
          if (handled) {
            setLastAction(`Navigating to cart: "${command}"`);
          }
          break;

        case "product_action":
          handled = await handleProductActions(command);
          if (handled) {
            setLastAction(`Product action completed: "${command}"`);
          }
          break;

        case "product_navigation":
          handled = await handleProductDetailNavigation(command);
          if (handled) {
            setLastAction(`Navigating to product: "${command}"`);
          }
          break;

        case "remove_filter":
          handled = await handleRemoveFilters(command);
          break;

        case "category_navigation": {
          // Special case: handle both category navigation and potential filters in one command
          const categoryNavigated = await handleCategoryNavigation(command);

          // If we're on a category now, check for filters in the same command
          if (categoryNavigated) {
            setLastAction(`Navigating to category based on: "${command}"`);

            // Also check for filters in the same command
            const filtersApplied = await interpretFilterCommand(command);
            if (filtersApplied === "filters_updated") {
              setLastAction(
                `Navigated to category and applied filters based on: "${command}"`
              );
            }

            handled = true;
          }
          break;
        }

        case "apply_filter":
          const filterResult = await interpretFilterCommand(command);
          if (filterResult === "filters_updated") {
            setLastAction(`Filters updated based on: "${command}"`);
            console.log("Filters updated via voice");
            handled = true;
          }
          break;

        case "clear_filters":
          clearFilters();
          setLastAction(`All filters cleared based on: "${command}"`);
          console.log("All filters cleared via dedicated handler");
          handled = true;
          break;

        case "general_command":
          // Fall back to the general command interpreter
          const action = await interpretCommand(command);
          console.log("General action interpreted:", action);

          // Handle general commands
          switch (action) {
            case "showGymClothes":
              setLastAction("Navigating to gym products");
              await navigate("/products/gym");
              handled = true;
              break;
            case "showYogaEquipment":
              setLastAction("Navigating to yoga products");
              await navigate("/products/yoga");
              handled = true;
              break;
            case "goToCart":
              setLastAction("Navigating to cart");
              await navigate("/cart");
              handled = true;
              break;
            case "checkout":
              // Updated to use the same logic as handleOrderCompletion
              const pageStateCheckout = getCurrentPageState();
              const isOnPaymentPage = pageStateCheckout.isPaymentPage;

              if (isOnPaymentPage) {
                // Check if the user has provided the necessary payment information
                const userInfo = getUserInfo();
                const hasRequiredInfo =
                  userInfo.cardNumber &&
                  userInfo.expiryDate &&
                  userInfo.cvv &&
                  userInfo.name &&
                  userInfo.email &&
                  userInfo.address;

                if (hasRequiredInfo) {
                  // If on payment page and has required info, complete the order
                  console.log(
                    "Completing order and navigating to confirmation page"
                  );
                  setLastAction("Completing your order...");

                  // Simulate a button click to submit the form
                  const submitButton = document.querySelector(
                    'button[type="submit"]'
                  ) as HTMLElement;
                  if (submitButton) {
                    submitButton.click();
                  } else {
                    // If button not found, navigate directly
                    await navigate("/confirmation");
                  }
                } else {
                  setLastAction("Please complete your payment information");
                }
              } else {
                // If not on payment page, navigate to it
                setLastAction("Navigating to checkout");
                await navigate("/payment");
              }
              handled = true;
              break;
            case "showRunningGear":
              setLastAction("Navigating to running products");
              await navigate("/products/jogging");
              handled = true;
              break;
            case "clearFilters":
              clearFilters();
              setLastAction("All filters cleared");
              console.log("All filters cleared via action handler");
              handled = true;
              break;
          }
          break;
      }

      // If no handler successfully processed the command
      if (!handled) {
        setLastAction(`Command not recognized: "${command}"`);
        console.log("No handler successfully processed the command.");
        logAction(`No handler processed: "${command}"`, false);
      } else {
        // Log performance of the handler
        const handlerTime = performance.now() - handlerStartTime;
        console.log(`Handler execution took ${handlerTime.toFixed(2)}ms`);
        logAction(`Successfully handled "${command}" (${primaryIntent})`);
      }
    } catch (error) {
      console.error("Error processing voice command:", error);
      setLastAction(`Error processing: "${command}"`);
      logAction(`Error processing: "${command}"`, false);

      // Try recovery if needed
      handleRecovery();
    }
  };

  // Read current page state for context-aware actions
  const getCurrentPageState = () => {
    const currentPath = location.pathname;
    const currentCategory = params.category;
    const currentProductId = params.id;
    
    // Read visible products from DOM (if on product listing page)
    const visibleProducts: Array<{ name: string; id: string }> = [];
    if (currentPath.startsWith("/products/")) {
      const productCards = document.querySelectorAll('[data-product-id], [data-product-name]');
      productCards.forEach((card) => {
        const id = card.getAttribute('data-product-id') || '';
        const name = card.getAttribute('data-product-name') || 
                     card.querySelector('h3, h2, .product-name')?.textContent?.trim() || '';
        if (id && name) {
          visibleProducts.push({ id, name });
        }
      });
    }
    
    // Read current product info (if on product detail page)
    let currentProduct = null;
    if (currentProductId) {
      currentProduct = products.find(p => p.id === currentProductId);
    }
    
    return {
      path: currentPath,
      category: currentCategory,
      productId: currentProductId,
      currentProduct,
      visibleProducts,
      isProductPage: currentPath.startsWith("/product/"),
      isCategoryPage: currentPath.startsWith("/products/"),
      isCartPage: currentPath === "/cart",
      isPaymentPage: currentPath === "/payment",
      isHomePage: currentPath === "/" || currentPath === "/intro",
    };
  };

  // Deterministic, regex-based handlers to reduce LLM dependency for common actions
  const handleDirectCommands = async (transcript: string): Promise<boolean> => {
    const text = transcript.toLowerCase().trim();
    const pageState = getCurrentPageState();

    // Cart queries - read ACTUAL cart state, not LLM guesses
    if (/(how many|how much|what|count|items?|products?|things?)\s+(items?|products?|things?)?\s*(are|do|is|in)\s+(in|my|the)?\s*(cart|basket|bag)/.test(text) ||
        /(cart|basket|bag)\s+(has|have|contains|items?|count|quantity)/.test(text) ||
        /(total|number|amount)\s+(of|items?|products?)\s+(in|my|the)?\s*(cart|basket)/.test(text)) {
      // Read actual cart data
      const actualCount = totalItems;
      const itemCount = items.length;
      
      let response = "";
      if (actualCount === 0) {
        response = "Your cart is empty. There are no items in your cart.";
      } else if (actualCount === 1) {
        response = `You have ${actualCount} item in your cart.`;
      } else {
        response = `You have ${actualCount} items in your cart${itemCount !== actualCount ? ` (${itemCount} different products)` : ""}.`;
      }
      
      // If asking about specific items, list them
      if (/(what|which|list|show|name|items?|products?)\s+(are|is|in|do)/.test(text)) {
        if (items.length > 0) {
          const itemList = items.map((item, idx) => 
            `${idx + 1}. ${item.name}${item.size ? ` (${item.size})` : ""} x${item.quantity}`
          ).join(", ");
          response += ` Items: ${itemList}`;
        }
      }
      
      setLastAction(response);
      logAction(`Cart query answered: ${response}`);
      return true;
    }

    // Cart total/subtotal queries
    if (/(how much|what|total|subtotal|price|cost|value)\s+(is|are|does|will|is the|total|subtotal|price|cost|value)\s+(my|the)?\s*(cart|basket|order|items?|total|subtotal)/.test(text) ||
        /(cart|basket|order|total|subtotal)\s+(is|are|total|subtotal|price|cost|value|worth)/.test(text)) {
      const actualTotal = subtotal;
      const actualCount = totalItems;
      
      let response = "";
      if (actualCount === 0) {
        response = "Your cart is empty, so the total is $0.00.";
      } else {
        response = `Your cart total is $${actualTotal.toFixed(2)} for ${actualCount} ${actualCount === 1 ? 'item' : 'items'}.`;
      }
      
      setLastAction(response);
      logAction(`Cart total query answered: ${response}`);
      return true;
    }

    // Navigation: home/back/cart/payment/categories
    if (/(^|\b)(go\s+)?home(\b|$)/.test(text)) {
      await navigate("/");
      setLastAction("Navigating to home");
      return true;
    }
    if (/(^|\b)(go\s+)?back(\b|$)/.test(text)) {
      window.history.back();
      setLastAction("Going back");
      return true;
    }
    if (/(open|go to|show)\s+cart/.test(text)) {
      await navigate("/cart");
      setLastAction("Opening cart");
      return true;
    }
    if (/(checkout|proceed to payment|go to payment|pay now)/.test(text)) {
      await navigate("/payment");
      setLastAction("Navigating to checkout");
      return true;
    }
    const catMatch = text.match(/(go to|open|show)\s+(gym|yoga|running|jogging)/);
    if (catMatch) {
      const cat = catMatch[2];
      if (cat === "gym") {
        await navigate("/products/gym");
      } else if (cat === "yoga") {
        await navigate("/products/yoga");
      } else {
        await navigate("/products/jogging");
      }
      setLastAction(`Navigating to ${cat} products`);
      return true;
    }

    // Clear filters quickly
    if (/(clear|reset|remove)\s+(all\s+)?filters?/.test(text)) {
      clearFilters();
      setLastAction("All filters cleared");
      return true;
    }

    // Product detail page actions (size/quantity/add to cart)
    if (pageState.isProductPage && pageState.currentProduct) {
      // Size selection like: "size medium" / "select size L"
      const sizeMatch = text.match(/(size|select size)\s+([a-z0-9]+)/);
      if (sizeMatch) {
        const requested = sizeMatch[2];
        const product = pageState.currentProduct;
        if (product.sizes) {
          const matched = product.sizes.find(
            (s) => s.toLowerCase() === requested.toLowerCase()
          );
          if (matched) {
            setSelectedSize(matched);
            setLastAction(`Selected size: ${matched}`);
            return true;
          } else {
            setLastAction(`Size ${requested} not available. Available sizes: ${product.sizes.join(", ")}`);
            return true;
          }
        }
      }

      // Quantity: "quantity 2", "set quantity to 3", "set 3"
      const qtyMatch = text.match(/(quantity|set(\s+quantity)?\s+to|set)\s+(\d{1,2})/);
      if (qtyMatch) {
        const q = parseInt(qtyMatch[3], 10);
        if (!Number.isNaN(q) && q > 0) {
          setQuantity(q);
          setLastAction(`Quantity set to ${q}`);
          return true;
        }
      }

      // Add to cart
      if (/(add to cart|add this|add item)/.test(text)) {
        const addBtn = document.querySelector(
          'button[data-action="add-to-cart"]'
        ) as HTMLElement | null;
        if (addBtn) {
          addBtn.click();
          setLastAction("Added to cart");
          return true;
        }
        const buttons = Array.from(document.querySelectorAll("button"));
        const byText = buttons.find((b) =>
          (b.textContent || "").toLowerCase().includes("add to cart")
        ) as HTMLElement | undefined;
        if (byText) {
          byText.click();
          setLastAction("Added to cart");
          return true;
        }
      }
    }

    return false;
  };

  // First-tier intent classification using the master classifier
  const classifyPrimaryIntent = async (transcript: string): Promise<string> => {
    try {
      const prompt = prompts.masterIntentClassifier.replace(
        "{transcript}",
        transcript
      );

      const intent = (await runGeminiText(prompt)).trim();

      // Return the identified intent category
      return intent;
    } catch (error) {
      console.error("Intent classification error:", error);
      // Default to general_command if classification fails
      return "general_command";
    }
  };

  // Enhanced handleUserInfoUpdate function to fully handle credit card information
  const handleUserInfoUpdate = async (transcript: string) => {
    try {
      const prompt = prompts.userInfoUpdate.replace("{transcript}", transcript);

      const responseText = await runGeminiText(prompt);
      const cleanedResponse = responseText
        .replace("```json", "")
        .replace("```", "");

      try {
        const response = JSON.parse(cleanedResponse);

        if (response.isUserInfoUpdate) {
          // Get current user info
          const currentInfo = getUserInfo();

          // Update with new information
          const updatedInfo: UserInfo = { ...currentInfo };
          const updatedFields = [];

          // Update personal information
          if (response.name) {
            updatedInfo.name = response.name;
            updatedFields.push("name");
          }
          if (response.email) {
            updatedInfo.email = response.email;
            updatedFields.push("email");
          }
          if (response.address) {
            updatedInfo.address = response.address;
            updatedFields.push("address");
          }
          if (response.phone) {
            updatedInfo.phone = response.phone;
            updatedFields.push("phone");
          }

          // Update credit card information
          if (response.cardName) {
            updatedInfo.cardName = response.cardName;
            updatedFields.push("card name");
          }
          if (response.cardNumber) {
            updatedInfo.cardNumber = response.cardNumber;
            updatedFields.push("card number");
          }
          if (response.expiryDate) {
            updatedInfo.expiryDate = response.expiryDate;
            updatedFields.push("card expiry date");
          }
          if (response.cvv) {
            updatedInfo.cvv = response.cvv;
            updatedFields.push("CVV");
          }

          // Only proceed if we have actual updates
          if (updatedFields.length > 0) {
            // Update user info in localStorage
            updateUserInfo(updatedInfo);

            // Log updates for debugging
            console.log("User info updated:", updatedFields);
            console.log("Updated data:", {
              cardName: updatedInfo.cardName,
              cardNumber: updatedInfo.cardNumber ? "****" : null,
              expiryDate: updatedInfo.expiryDate,
              cvv: updatedInfo.cvv ? "***" : null,
            });

            // Create a feedback message
            const feedbackMessage = `Updated your ${updatedFields.join(", ")}`;

            // Dispatch a custom event to notify other components
            window.dispatchEvent(
              new CustomEvent("userInfoUpdated", {
                detail: {
                  message: feedbackMessage,
                  updatedFields: updatedFields,
                },
              })
            );

            setLastAction(feedbackMessage);
            return true;
          }
        }

        return false;
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        return false;
      }
    } catch (error) {
      console.error("Error in handleUserInfoUpdate:", error);
      return false;
    }
  };

  // Move handleCategoryNavigation inside the component
  const handleCategoryNavigation = async (transcript: string) => {
    try {
      const prompt = prompts.categoryNavigation.replace(
        "{transcript}",
        transcript
      );
      const response = (await runGeminiText(prompt)).trim().toLowerCase();

      if (response === "gym") {
        console.log("Navigating to gym category");
        await navigate("/products/gym");
        return true;
      } else if (response === "yoga") {
        console.log("Navigating to yoga category");
        await navigate("/products/yoga");
        return true;
      } else if (response === "running") {
        console.log("Navigating to running category");
        await navigate("/products/jogging");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Category navigation detection error:", error);
      return false;
    }
  };
  const handleProductActions = async (transcript: string) => {
    try {
      // Read actual page state
      const pageState = getCurrentPageState();
      if (!pageState.isProductPage || !pageState.currentProduct) {
        return false;
      }

      const product = pageState.currentProduct;

      const prompt = prompts.productAction
        .replace("{productName}", product.name)
        .replace("{sizes}", product.sizes.join(", "))
        .replace("{transcript}", transcript);
      const response = await runGeminiText(prompt);
      const cleanedResponse = response
        .replace("```json", "")
        .replace("```", "");

      try {
        const parsedAction = JSON.parse(cleanedResponse.trim());
        console.log("Detected product action:", parsedAction);

        if (parsedAction.action === "none") {
          return false;
        }

        // Handle size selection - update to use context
        if (parsedAction.action === "size" && parsedAction.size) {
          // Find the matching size (case-insensitive)
          const matchedSize = product.sizes.find(
            (size) => size.toLowerCase() === parsedAction.size.toLowerCase()
          );

          if (matchedSize) {
            // Update the context with the correct case
            setSelectedSize(matchedSize);
            console.log(`Selected size: ${matchedSize}`);
            return true;
          } else {
            console.log(`Size not found: ${parsedAction.size}`);
          }
        }

        // Handle quantity change - update to use context
        if (parsedAction.action === "quantity" && parsedAction.quantity) {
          const newQuantity = parseInt(parsedAction.quantity);
          if (!isNaN(newQuantity) && newQuantity > 0) {
            setQuantity(newQuantity);
            console.log(`Set quantity to: ${newQuantity}`);
            return true;
          }
        }

        // Handle add to cart - keep DOM manipulation for this action
        if (parsedAction.action === "addToCart") {
          const addToCartButton = document.querySelector(
            'button[data-action="add-to-cart"]'
          ) as HTMLElement;
          if (addToCartButton) {
            addToCartButton.click();
            console.log("Added product to cart");
          } else {
            // Try to find button by text content
            const buttons = document.querySelectorAll("button");
            for (const button of Array.from(buttons)) {
              if (button.textContent?.toLowerCase().includes("add to cart")) {
                (button as HTMLElement).click();
                console.log("Added product to cart");
                break;
              }
            }
          }
        }

        return true;
      } catch (error) {
        console.error("Error parsing product action JSON:", error);
        return false;
      }
    } catch (error) {
      console.error("Product action error:", error);
      return false;
    }
  };

  const handleCartNavigation = async (transcript: string) => {
    try {
      const prompt = prompts.cartNavigation.replace("{transcript}", transcript);

      const response = (await runGeminiText(prompt)).trim().toLowerCase();

      if (response === "yes") {
        console.log("Navigating to cart page");
        await navigate("/cart");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Cart navigation detection error:", error);
      return false;
    }
  };

  // Create a dedicated function for clearing filters
  const handleClearFilters = async (transcript: string) => {
    try {
      const prompt = prompts.clearFilters.replace("{transcript}", transcript);
      const response = (await runGeminiText(prompt)).trim().toLowerCase();

      if (response === "yes") {
        clearFilters();
        console.log("All filters cleared via dedicated function");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Clear filters detection error:", error);
      return false;
    }
  };

  // Add a new function to handle product detail navigation
  const handleProductDetailNavigation = async (transcript: string) => {
    try {
      const pageState = getCurrentPageState();
      
      // Use visible products from page if on category page, otherwise use all products
      const productsToSearch = pageState.isCategoryPage && pageState.visibleProducts.length > 0
        ? pageState.visibleProducts.map(vp => {
            const fullProduct = products.find(p => p.id === vp.id);
            return fullProduct || { id: vp.id, name: vp.name, description: "" };
          })
        : products;

      // Create a list of product names and IDs for reference
      const productList = productsToSearch.map((p) => ({
        id: p.id,
        name: p.name.toLowerCase(),
        keywords: p.name.toLowerCase().split(" "),
      }));

      const productListText = productsToSearch
        .map((p) => `- ${p.name}: ${p.description?.substring(0, 50) || ""}...`)
        .join("\n");

      const prompt = prompts.productDetailNavigation
        .replace("{transcript}", transcript)
        .replace("{productList}", productListText);

      const response = (await runGeminiText(prompt)).trim();

      if (response.toLowerCase() !== "none") {
        // Try to find the product by name (case insensitive)
        const productName = response.toLowerCase();

        // First try exact match
        let matchedProduct = productsToSearch.find(
          (p) => p.name.toLowerCase() === productName
        );

        // If no exact match, try partial match
        if (!matchedProduct) {
          matchedProduct = productsToSearch.find(
            (p) =>
              p.name.toLowerCase().includes(productName) ||
              productName.includes(p.name.toLowerCase())
          );
        }

        // If still no match, try keyword matching
        if (!matchedProduct) {
          const words = productName.split(" ").filter((w) => w.length > 3);
          for (const word of words) {
            matchedProduct = productsToSearch.find((p) =>
              p.name.toLowerCase().includes(word)
            );
            if (matchedProduct) break;
          }
        }

        if (matchedProduct) {
          console.log(`Navigating to product: ${matchedProduct.name}`);
          await navigate(`/product/${matchedProduct.id}`);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Product detail navigation error:", error);
      return false;
    }
  };

  // Improve the interpretFilterCommand function to ensure case matching
  const interpretFilterCommand = async (transcript: string) => {
    try {
      // Create reference maps for exact casing AND sets for quick validation (lowercase)
      const validColors = new Set(
        filterOptions.colors.map((c) => c.toLowerCase())
      );
      const colorMap = Object.fromEntries(
        filterOptions.colors.map((c) => [c.toLowerCase(), c])
      );

      const validSizes = new Set(
        filterOptions.sizes.map((s) => s.toLowerCase())
      );
      const sizeMap = Object.fromEntries(
        filterOptions.sizes.map((s) => [s.toLowerCase(), s])
      );

      const validMaterials = new Set(
        filterOptions.materials.map((m) => m.toLowerCase())
      );
      const materialMap = Object.fromEntries(
        filterOptions.materials.map((m) => [m.toLowerCase(), m])
      );

      const validGenders = new Set(
        filterOptions.genders.map((g) => g.toLowerCase())
      );
      const genderMap = Object.fromEntries(
        filterOptions.genders.map((g) => [g.toLowerCase(), g])
      );

      const validBrands = new Set(
        filterOptions.brands.map((b) => b.toLowerCase())
      );
      const brandMap = Object.fromEntries(
        filterOptions.brands.map((b) => [b.toLowerCase(), b])
      );

      const validSubCategories = new Set(
        filterOptions.subCategories.map((c) => c.toLowerCase())
      );
      const categoryMap = Object.fromEntries(
        filterOptions.subCategories.map((c) => [c.toLowerCase(), c])
      );

      const prompt = prompts.filterCommand
        .replace("{transcript}", transcript)
        .replace("{colors}", filterOptions.colors.join(", "))
        .replace("{sizes}", filterOptions.sizes.join(", "))
        .replace("{materials}", filterOptions.materials.join(", "))
        .replace("{genders}", filterOptions.genders.join(", "))
        .replace("{brands}", filterOptions.brands.join(", "))
        .replace("{categories}", filterOptions.subCategories.join(", "));

      const response = await runGeminiText(prompt);
      const cleanedResponse = response.replace(
        /^\s*```json\s*|\s*```\s*$/g,
        ""
      ); // More robust cleaning
      console.log("Cleaned AI Response for Filters:", cleanedResponse);

      try {
        const parsedFilters = JSON.parse(cleanedResponse.trim());
        console.log("Parsed Filters from AI:", parsedFilters);

        const normalizedFilters: Partial<FilterState> = {};
        let filtersApplied = false;

        // Validate and normalize each filter type
        if (parsedFilters.colors && Array.isArray(parsedFilters.colors)) {
          const validatedColors = parsedFilters.colors
            .map((c: string) => c.toLowerCase())
            .filter((lc: string) => validColors.has(lc))
            .map((lc: string) => colorMap[lc]); // Restore casing
          if (validatedColors.length > 0) {
            normalizedFilters.colors = validatedColors;
            filtersApplied = true;
            console.log("Validated Colors:", validatedColors);
          }
        }

        if (parsedFilters.sizes && Array.isArray(parsedFilters.sizes)) {
          const validatedSizes = parsedFilters.sizes
            .map((s: string) => s.toLowerCase())
            .filter((ls: string) => validSizes.has(ls))
            .map((ls: string) => sizeMap[ls]); // Restore casing
          if (validatedSizes.length > 0) {
            normalizedFilters.sizes = validatedSizes;
            filtersApplied = true;
            console.log("Validated Sizes:", validatedSizes);
          }
        }

        if (parsedFilters.materials && Array.isArray(parsedFilters.materials)) {
          const validatedMaterials = parsedFilters.materials
            .map((m: string) => m.toLowerCase())
            .filter((lm: string) => validMaterials.has(lm))
            .map((lm: string) => materialMap[lm]); // Restore casing
          if (validatedMaterials.length > 0) {
            normalizedFilters.materials = validatedMaterials;
            filtersApplied = true;
            console.log("Validated Materials:", validatedMaterials);
          }
        }

        if (parsedFilters.genders && Array.isArray(parsedFilters.genders)) {
          const validatedGenders = parsedFilters.genders
            .map((g: string) => g.toLowerCase())
            .filter((lg: string) => validGenders.has(lg))
            .map((lg: string) => genderMap[lg]); // Restore casing
          if (validatedGenders.length > 0) {
            normalizedFilters.genders = validatedGenders;
            filtersApplied = true;
            console.log("Validated Genders:", validatedGenders);
          }
        }

        if (parsedFilters.brands && Array.isArray(parsedFilters.brands)) {
          const validatedBrands = parsedFilters.brands
            .map((b: string) => b.toLowerCase())
            .filter((lb: string) => validBrands.has(lb))
            .map((lb: string) => brandMap[lb]); // Restore casing
          if (validatedBrands.length > 0) {
            normalizedFilters.brands = validatedBrands;
            filtersApplied = true;
            console.log("Validated Brands:", validatedBrands);
          }
        }

        if (
          parsedFilters.subCategories &&
          Array.isArray(parsedFilters.subCategories)
        ) {
          const validatedSubCategories = parsedFilters.subCategories
            .map((c: string) => c.toLowerCase())
            .filter(
              (lc: string) => validSubCategories.has(lc) && lc !== "equipment"
            ) // Explicitly check for valid subcategories AND exclude 'equipment' here unless explicitly requested (prompt should handle this better now)
            .map((lc: string) => categoryMap[lc]); // Restore casing
          if (validatedSubCategories.length > 0) {
            normalizedFilters.subCategories = validatedSubCategories;
            filtersApplied = true;
            console.log("Validated SubCategories:", validatedSubCategories);
          }
        }

        if (
          parsedFilters.price &&
          Array.isArray(parsedFilters.price) &&
          parsedFilters.price.length === 2
        ) {
          const [min, max] = parsedFilters.price;
          if (
            typeof min === "number" &&
            typeof max === "number" &&
            min >= 0 &&
            max <= 200 &&
            min <= max
          ) {
            normalizedFilters.price = [min, max];
            filtersApplied = true;
            console.log("Validated Price:", normalizedFilters.price);
          }
        }

        if (filtersApplied) {
          updateFilters(normalizedFilters);
          return "filters_updated";
        }
      } catch (error) {
        console.error(
          "Error parsing filter JSON from AI:",
          error,
          "Raw response:",
          cleanedResponse
        );
      }

      return "unknown"; // Return unknown if parsing failed or no valid filters applied
    } catch (error) {
      console.error("Filter interpretation API error:", error);
      return "unknown";
    }
  };

  // Update the interpretCommand function to better detect clearFilters intent
  const interpretCommand = async (transcript: string) => {
    try {
      // First, directly check for clear filter phrases
      const clearFilterPhrases = [
        "clear filter",
        "reset filter",
        "remove filter",
        "clear all filter",
        "reset all filter",
        "remove all filter",
        "clear the filter",
        "start over",
      ];

      // Check if the transcript contains any clear filter phrases
      for (const phrase of clearFilterPhrases) {
        if (transcript.includes(phrase)) {
          console.log("Direct match for clear filters detected");
          return "clearFilters";
        }
      }

      const availableFunctionsText = Object.values(availableFunctions)
        .map((fn) => `- ${fn.name}: ${fn.description}`)
        .join("\n");

      const prompt = prompts.interpretCommand
        .replace("{transcript}", transcript)
        .replace("{availableFunctions}", availableFunctionsText);

      const response = (await runGeminiText(prompt)).trim();
      return response;
    } catch (error) {
      console.error("Gemini API error:", error);
      return "unknown";
    }
  };

  // Handle "place order" or "complete purchase" commands
  const handleOrderCompletion = async (transcript: string) => {
    try {
      const prompt = prompts.orderCompletion.replace(
        "{transcript}",
        transcript
      );

      const response = (await runGeminiText(prompt)).trim().toLowerCase();

      if (response === "yes") {
        // Check if user is on the payment page
        const pageStateOrder = getCurrentPageState();
        const isOnPaymentPage = pageStateOrder.isPaymentPage;

        if (isOnPaymentPage) {
          // Check if the user has provided the necessary payment information
          const userInfo = getUserInfo();
          const hasRequiredInfo =
            userInfo.cardNumber &&
            userInfo.expiryDate &&
            userInfo.cvv &&
            userInfo.name &&
            userInfo.email &&
            userInfo.address;

          if (hasRequiredInfo) {
            // If on payment page and has required info, complete the order
            console.log("Completing order and navigating to confirmation page");
            setLastAction("Completing your order...");

            // Simulate a button click to submit the form
            const submitButton = document.querySelector(
              'button[type="submit"]'
            ) as HTMLElement;
            if (submitButton) {
              submitButton.click();
            } else {
              // If button not found, navigate directly
              await navigate("/confirmation");
            }

            return true;
          }
        }

        // Either not on payment page or missing required info, navigate to payment page
        console.log("Navigating to payment page");
        setLastAction("Taking you to complete your payment...");
        await navigate("/payment");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Order completion error:", error);
      return false;
    }
  };

  // Add a new function to handle navigation commands (back/home)
  const handleNavigationCommand = async (transcript: string) => {
    try {
      const prompt = prompts.navigationCommand.replace(
        "{transcript}",
        transcript
      );

      const responseText = await runGeminiText(prompt);
      const cleanedResponse = responseText
        .replace("```json", "")
        .replace("```", "");

      try {
        const response = JSON.parse(cleanedResponse.trim());
        console.log("Navigation response:", response);

        if (response.action === "back") {
          console.log("Going back to previous page");
          setLastAction("Going back to previous page");
          window.history.back();
          return true;
        } else if (response.action === "home") {
          console.log("Navigating to home page");
          setLastAction("Taking you to the home page");
          await navigate("/");
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error parsing navigation command JSON:", error);
        return false;
      }
    } catch (error) {
      console.error("Navigation command error:", error);
      return false;
    }
  };

  // Add a function to handle removing specific filters
  const handleRemoveFilters = async (transcript: string) => {
    try {
      // Create reference maps for exact casing
      const colorMap = Object.fromEntries(
        filterOptions.colors.map((c) => [c.toLowerCase(), c])
      );
      const sizeMap = Object.fromEntries(
        filterOptions.sizes.map((s) => [s.toLowerCase(), s])
      );
      const materialMap = Object.fromEntries(
        filterOptions.materials.map((m) => [m.toLowerCase(), m])
      );
      const genderMap = Object.fromEntries(
        filterOptions.genders.map((g) => [g.toLowerCase(), g])
      );
      const brandMap = Object.fromEntries(
        filterOptions.brands.map((b) => [b.toLowerCase(), b])
      );
      const categoryMap = Object.fromEntries(
        filterOptions.subCategories.map((c) => [c.toLowerCase(), c])
      );

      const prompt = prompts.removeFilterCommand
        .replace("{transcript}", transcript)
        .replace("{colors}", filterOptions.colors.join(", "))
        .replace("{sizes}", filterOptions.sizes.join(", "))
        .replace("{materials}", filterOptions.materials.join(", "))
        .replace("{genders}", filterOptions.genders.join(", "))
        .replace("{brands}", filterOptions.brands.join(", "))
        .replace("{categories}", filterOptions.subCategories.join(", "));

      const responseText = await runGeminiText(prompt);
      const cleanedResponse = responseText
        .replace("```json", "")
        .replace("```", "");

      try {
        const parsedRemoval = JSON.parse(cleanedResponse.trim());
        console.log("Filter removal response:", parsedRemoval);

        if (!parsedRemoval.isRemoveFilter) {
          return false;
        }

        // Track which filters were removed for UI feedback
        let filtersRemoved = false;
        const removedFilters: string[] = [];

        // Helper function to correctly map and remove filters
        const processFilterRemoval = (
          filterType: keyof FilterState,
          valuesToRemove: string[],
          mappingFn: (val: string) => string
        ) => {
          if (valuesToRemove && valuesToRemove.length > 0) {
            // Map the values to their correct casing
            const normalizedValues = valuesToRemove.map(
              (val) => mappingFn(val) || val
            );

            // Add to our tracking for UI feedback
            filtersRemoved = true;
            normalizedValues.forEach((val) => {
              removedFilters.push(`${filterType}: ${val}`);
            });

            // Use the context function to remove the filters
            removeFilter(filterType, normalizedValues);
          }
        };

        // Process each filter type
        processFilterRemoval(
          "colors",
          parsedRemoval.colors,
          (val) => colorMap[val.toLowerCase()]
        );
        processFilterRemoval(
          "sizes",
          parsedRemoval.sizes,
          (val) => sizeMap[val.toLowerCase()]
        );
        processFilterRemoval(
          "materials",
          parsedRemoval.materials,
          (val) => materialMap[val.toLowerCase()]
        );
        processFilterRemoval(
          "genders",
          parsedRemoval.genders,
          (val) => genderMap[val.toLowerCase()]
        );
        processFilterRemoval(
          "brands",
          parsedRemoval.brands,
          (val) => brandMap[val.toLowerCase()]
        );
        processFilterRemoval(
          "subCategories",
          parsedRemoval.subCategories,
          (val) => categoryMap[val.toLowerCase()]
        );

        // Handle price range removal
        if (parsedRemoval.price === true) {
          removeFilter("price", null);
          filtersRemoved = true;
          removedFilters.push("price range");
        }

        if (filtersRemoved) {
          // Update the UI feedback
          const feedbackMessage = `Removed ${removedFilters.join(", ")}`;
          setLastAction(feedbackMessage);
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error parsing filter removal JSON:", error);
        return false;
      }
    } catch (error) {
      console.error("Filter removal error:", error);
      return false;
    }
  };

  useEffect(() => {
    startListening();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

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
        className={`flex items-center justify-center rounded-full w-14 h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg transition-all duration-300 ${
          isListening ? "shadow-xl ring-2 ring-white/30" : "shadow-md"
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
