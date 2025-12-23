
import { useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { products } from "@/data/products";
import { prompts } from "@/lib/prompts";
import { useFilters, FilterState } from "@/context/FilterContext";
import { filterOptions } from "@/data/products";
import { useProduct } from "@/context/ProductContext";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useCart } from "@/context/CartContext";

// Initializing Gemini
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
if (!geminiApiKey) {
    console.error("Missing VITE_GEMINI_API_KEY. Set it in your .env.local file.");
}
const genAI = new GoogleGenerativeAI(geminiApiKey ?? "");

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

const callGeminiWithFallback = async <T,>(
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
        return result.response.text();
    });
    return responseText;
};

// Types
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

interface UseVoiceCommandHandlersProps {
    onRequestRestart?: () => void;
}

export const useVoiceCommandHandlers = ({ onRequestRestart }: UseVoiceCommandHandlersProps = {}) => {
    const { updateUserInfo, getUserInfo } = useUserInfo();
    const { updateFilters, clearFilters, removeFilter } = useFilters();
    const { setSelectedSize, setQuantity, selectedSize, quantity } = useProduct();
    const { items, totalItems, subtotal, addItem } = useCart();
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();

    const [lastAction, setLastAction] = useState<string>("");
    const [actionLog, setActionLog] = useState<
        Array<{ timestamp: number; action: string; success: boolean }>
    >([]);
    const [consecutiveErrors, setConsecutiveErrors] = useState(0);

    // Logging function
    const logAction = (action: string, success: boolean = true) => {
        console.log(`Voice Action [${success ? "SUCCESS" : "FAILURE"}]: ${action}`);

        setActionLog((prevLog) => {
            const newLog = [
                { timestamp: Date.now(), action, success },
                ...prevLog.slice(0, 19),
            ];
            return newLog;
        });

        if (success) {
            setConsecutiveErrors(0);
        } else {
            const newErrorCount = consecutiveErrors + 1;
            setConsecutiveErrors(newErrorCount);

            // Trigger recovery if errors threshold met
            if (newErrorCount >= 3 && onRequestRestart) {
                console.log("Multiple errors detected, triggering voice recognition restart");
                onRequestRestart();
                setConsecutiveErrors(0);
                setLastAction("Voice assistant restarted after detecting issues");
            }
        }
    };

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

    const handleDirectCommands = async (transcript: string): Promise<boolean> => {
        const text = transcript.toLowerCase().trim();
        const pageState = getCurrentPageState();

        // Cart queries
        if (/(how many|how much|what|count|items?|products?|things?)\s+(items?|products?|things?)?\s*(are|do|is|in)\s+(in|my|the)?\s*(cart|basket|bag)/.test(text) ||
            /(cart|basket|bag)\s+(has|have|contains|items?|count|quantity)/.test(text) ||
            /(total|number|amount)\s+(of|items?|products?)\s+(in|my|the)?\s*(cart|basket)/.test(text)) {
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

        // Navigation
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
        if (/(checkout|proceed to payment|go to payment|pay now|buy now)/.test(text)) {
            setLastAction("Navigating to checkout");
            await navigate("/payment");
            return true;
        }
        const catMatch = text.match(/(go to|open|show|view|see|get|want|need)\s+(.*?)?(gym|yoga|running|jogging)/);
        if (catMatch) {
            const cat = catMatch[3];
            clearFilters();
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

        // Clear filters
        if (/(clear|reset|remove)\s+(all\s+)?filters?/.test(text)) {
            clearFilters();
            setLastAction("All filters cleared");
            return true;
        }

        // Product detail page actions
        if (pageState.isProductPage && pageState.currentProduct) {
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

            const qtyMatch = text.match(/(quantity|set(\s+quantity)?\s+to|set)\s+(\d{1,2})/);
            if (qtyMatch) {
                const q = parseInt(qtyMatch[3], 10);
                if (!Number.isNaN(q) && q > 0) {
                    setQuantity(q);
                    setLastAction(`Quantity set to ${q}`);
                    return true;
                }
            }

            if (/(add to cart|add this|add item)/.test(text)) {
                if (selectedSize) {
                    addItem({
                        id: pageState.currentProduct.id,
                        name: pageState.currentProduct.name,
                        price: pageState.currentProduct.price,
                        image: pageState.currentProduct.image,
                        size: selectedSize,
                        quantity: quantity
                    });
                    setLastAction(`Added ${quantity} ${pageState.currentProduct.name} to cart`);
                    return true;
                } else {
                    setLastAction("Please select a size first");
                    return true;
                }
            }
        }

        return false;
    };

    const classifyPrimaryIntent = async (transcript: string): Promise<string> => {
        try {
            const prompt = prompts.masterIntentClassifier.replace(
                "{transcript}",
                transcript
            );
            const intent = (await runGeminiText(prompt)).trim();
            return intent;
        } catch (error) {
            console.error("Intent classification error:", error);
            return "general_command";
        }
    };

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
                    const currentInfo = getUserInfo();
                    const updatedInfo: UserInfo = { ...currentInfo };
                    const updatedFields = [];

                    if (response.name) { updatedInfo.name = response.name; updatedFields.push("name"); }
                    if (response.email) { updatedInfo.email = response.email; updatedFields.push("email"); }
                    if (response.address) { updatedInfo.address = response.address; updatedFields.push("address"); }
                    if (response.phone) { updatedInfo.phone = response.phone; updatedFields.push("phone"); }
                    if (response.cardName) { updatedInfo.cardName = response.cardName; updatedFields.push("card name"); }
                    if (response.cardNumber) { updatedInfo.cardNumber = response.cardNumber; updatedFields.push("card number"); }
                    if (response.expiryDate) { updatedInfo.expiryDate = response.expiryDate; updatedFields.push("card expiry date"); }
                    if (response.cvv) { updatedInfo.cvv = response.cvv; updatedFields.push("CVV"); }

                    if (updatedFields.length > 0) {
                        updateUserInfo(updatedInfo);

                        const feedbackMessage = `Updated your ${updatedFields.join(", ")}`;

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

    const handleNavigationCommand = async (transcript: string) => {
        try {
            const prompt = prompts.navigationCommand.replace("{transcript}", transcript);
            const responseText = await runGeminiText(prompt);
            const cleanedResponse = responseText.replace("```json", "").replace("```", "");

            try {
                const response = JSON.parse(cleanedResponse.trim());
                if (response.action === "back") {
                    setLastAction("Going back to previous page");
                    window.history.back();
                    return true;
                } else if (response.action === "home") {
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

    const handleOrderCompletion = async (transcript: string) => {
        try {
            const prompt = prompts.orderCompletion.replace("{transcript}", transcript);
            const response = (await runGeminiText(prompt)).trim().toLowerCase();

            if (response === "yes") {
                const pageStateOrder = getCurrentPageState();
                const isOnPaymentPage = pageStateOrder.isPaymentPage;

                if (isOnPaymentPage) {
                    const userInfo = getUserInfo();
                    const hasRequiredInfo =
                        userInfo.cardNumber &&
                        userInfo.expiryDate &&
                        userInfo.cvv &&
                        userInfo.name &&
                        userInfo.email &&
                        userInfo.address;

                    if (hasRequiredInfo) {
                        setLastAction("Completing your order...");
                        const submitButton = document.querySelector('button[type="submit"]') as HTMLElement;
                        if (submitButton) {
                            submitButton.click();
                        } else {
                            await navigate("/confirmation");
                        }
                        return true;
                    }
                }

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

    const handleCartNavigation = async (transcript: string) => {
        try {
            const prompt = prompts.cartNavigation.replace("{transcript}", transcript);
            const response = (await runGeminiText(prompt)).trim().toLowerCase();
            if (response === "yes") {
                await navigate("/cart");
                return true;
            }
            return false;
        } catch (error) {
            console.error("Cart navigation detection error:", error);
            return false;
        }
    };

    const handleProductActions = async (transcript: string) => {
        try {
            const pageState = getCurrentPageState();

            // Determine context for the prompt
            let productName = "current product";
            let productSizes = "";
            let currentProduct = pageState.currentProduct;

            if (currentProduct) {
                productName = currentProduct.name;
                productSizes = currentProduct.sizes.join(", ");
            }

            const prompt = prompts.productAction
                .replace("{productName}", productName)
                .replace("{sizes}", productSizes)
                .replace("{transcript}", transcript);

            const response = await runGeminiText(prompt);
            const cleanedResponse = response.replace("```json", "").replace("```", "");

            try {
                const parsedAction = JSON.parse(cleanedResponse.trim());
                if (parsedAction.action === "none") return false;

                // Handle cross-page add to cart via product name
                if (parsedAction.productName) {
                    const targetProduct = products.find(p =>
                        p.name.toLowerCase().includes(parsedAction.productName.toLowerCase()) ||
                        parsedAction.productName.toLowerCase().includes(p.name.toLowerCase())
                    );

                    if (targetProduct) {
                        currentProduct = targetProduct; // Switch context to the mentioned product
                    }
                }

                if (!currentProduct) return false;

                if (parsedAction.action === "size" && parsedAction.size) {
                    const matchedSize = currentProduct.sizes.find(
                        (size) => size.toLowerCase() === parsedAction.size.toLowerCase()
                    );
                    if (matchedSize) {
                        setSelectedSize(matchedSize); // Note: This might only affect the provider state, not visual UI if not on product page, but intent is captured
                        return true;
                    }
                }

                if (parsedAction.action === "quantity" && parsedAction.quantity) {
                    const newQuantity = parseInt(parsedAction.quantity);
                    if (!isNaN(newQuantity) && newQuantity > 0) {
                        setQuantity(newQuantity);
                        return true;
                    }
                }

                if (parsedAction.action === "addToCart") {
                    // Use selected size if on product page and size selected, otherwise default or try to extract from transcript (future improvement)
                    // For now, if adding via voice from listing/home without explicit size, execute safely or error

                    let sizeToAdd = selectedSize;

                    // If switching context (adding different product from home), we might not have a size selected. 
                    // Auto-select first size for smoother experience or prompt user (simplification for this task: default to first size)
                    if (!sizeToAdd && currentProduct.sizes.length > 0) {
                        sizeToAdd = currentProduct.sizes[0];
                    }

                    if (sizeToAdd) {
                        addItem({
                            id: currentProduct.id,
                            name: currentProduct.name,
                            price: currentProduct.price,
                            image: currentProduct.image,
                            size: sizeToAdd,
                            quantity: quantity // Use current quantity state (default 1)
                        });
                        setLastAction(`Added ${quantity} ${currentProduct.name} to cart`);
                        return true;
                    } else {
                        setLastAction("Please select a size first");
                        return true;
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

    const handleProductDetailNavigation = async (transcript: string) => {
        try {
            const pageState = getCurrentPageState();
            // Always search all products to ensure "Show me X" works from anywhere
            const productsToSearch = products;

            const productListText = productsToSearch
                .map((p) => `ID: ${p.id} - Name: ${p.name} - Desc: ${p.description?.substring(0, 50) || ""}...`)
                .join("\n");

            const prompt = prompts.productDetailNavigation
                .replace("{transcript}", transcript)
                .replace("{productList}", productListText);

            const responseText = await runGeminiText(prompt);
            const cleanedResponse = responseText.replace("```json", "").replace("```", "");

            try {
                const parsed = JSON.parse(cleanedResponse.trim());
                if (parsed.productId) {
                    const product = products.find(p => p.id === parsed.productId);
                    if (product) {
                        console.log(`Navigating to product ${product.name} (ID: ${product.id})`);
                        setLastAction(`Navigating to ${product.name}`);
                        await navigate(`/product/${product.id}`);
                        return true;
                    }
                }
            } catch (jsonError) {
                console.error("Error parsing product ID JSON:", jsonError);
            }

            return false;
        } catch (error) {
            console.error("Product detail navigation error:", error);
            return false;
        }
    };

    const handleCategoryNavigation = async (transcript: string) => {
        try {
            const prompt = prompts.categoryNavigation.replace("{transcript}", transcript);
            const responseText = await runGeminiText(prompt);
            const cleanedResponse = responseText.replace("```json", "").replace("```", "");

            try {
                const parsed = JSON.parse(cleanedResponse.trim());
                const target = parsed.target?.toLowerCase();

                if (target === "gym") {
                    clearFilters();
                    await navigate("/products/gym");
                    return true;
                } else if (target === "yoga") {
                    clearFilters();
                    await navigate("/products/yoga");
                    return true;
                } else if (target === "running") {
                    clearFilters();
                    await navigate("/products/jogging");
                    return true;
                } else if (target && target !== "none") {
                    // Fallback for direct "Show me X" if X is valid
                    if (target.includes("gym")) {
                        clearFilters();
                        await navigate("/products/gym");
                        return true;
                    }
                    if (target.includes("yoga")) {
                        clearFilters();
                        await navigate("/products/yoga");
                        return true;
                    }
                    if (target.includes("run") || target.includes("jog")) {
                        clearFilters();
                        await navigate("/products/jogging");
                        return true;
                    }
                }

                return false;
            } catch (jsonErr) {
                console.error("Category JSON parse error:", jsonErr);
                return false;
            }
        } catch (error) {
            console.error("Category navigation detection error:", error);
            return false;
        }
    };

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

            try {
                const parsedFilters = JSON.parse(cleanedResponse.trim());
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
                    }
                }

                if (filtersApplied) {
                    updateFilters(normalizedFilters);
                    return "filters_updated";
                }
            } catch (error) {
                console.error("Error parsing filter JSON from AI:", error);
            }
            return "unknown";
        } catch (error) {
            console.error("Filter interpretation API error:", error);
            return "unknown";
        }
    };

    const handleRemoveFilters = async (transcript: string) => {
        try {
            const colorMap = Object.fromEntries(filterOptions.colors.map((c) => [c.toLowerCase(), c]));
            const sizeMap = Object.fromEntries(filterOptions.sizes.map((s) => [s.toLowerCase(), s]));
            const materialMap = Object.fromEntries(filterOptions.materials.map((m) => [m.toLowerCase(), m]));
            const genderMap = Object.fromEntries(filterOptions.genders.map((g) => [g.toLowerCase(), g]));
            const brandMap = Object.fromEntries(filterOptions.brands.map((b) => [b.toLowerCase(), b]));
            const categoryMap = Object.fromEntries(filterOptions.subCategories.map((c) => [c.toLowerCase(), c]));

            const prompt = prompts.removeFilterCommand
                .replace("{transcript}", transcript)
                .replace("{colors}", filterOptions.colors.join(", "))
                .replace("{sizes}", filterOptions.sizes.join(", "))
                .replace("{materials}", filterOptions.materials.join(", "))
                .replace("{genders}", filterOptions.genders.join(", "))
                .replace("{brands}", filterOptions.brands.join(", "))
                .replace("{categories}", filterOptions.subCategories.join(", "));

            const responseText = await runGeminiText(prompt);
            const cleanedResponse = responseText.replace("```json", "").replace("```", "");

            try {
                const parsedRemoval = JSON.parse(cleanedResponse.trim());
                if (!parsedRemoval.isRemoveFilter) return false;

                let filtersRemoved = false;
                const removedFilters: string[] = [];

                const processFilterRemoval = (
                    filterType: keyof FilterState,
                    valuesToRemove: string[],
                    mappingFn: (val: string) => string
                ) => {
                    if (valuesToRemove && valuesToRemove.length > 0) {
                        const normalizedValues = valuesToRemove.map((val) => mappingFn(val) || val);
                        filtersRemoved = true;
                        normalizedValues.forEach((val) => {
                            removedFilters.push(`${filterType}: ${val}`);
                        });
                        removeFilter(filterType, normalizedValues);
                    }
                };

                processFilterRemoval("colors", parsedRemoval.colors, (val) => colorMap[val.toLowerCase()]);
                processFilterRemoval("sizes", parsedRemoval.sizes, (val) => sizeMap[val.toLowerCase()]);
                processFilterRemoval("materials", parsedRemoval.materials, (val) => materialMap[val.toLowerCase()]);
                processFilterRemoval("genders", parsedRemoval.genders, (val) => genderMap[val.toLowerCase()]);
                processFilterRemoval("brands", parsedRemoval.brands, (val) => brandMap[val.toLowerCase()]);
                processFilterRemoval("subCategories", parsedRemoval.subCategories, (val) => categoryMap[val.toLowerCase()]);

                if (parsedRemoval.price === true) {
                    removeFilter("price", null);
                    filtersRemoved = true;
                    removedFilters.push("price range");
                }

                if (filtersRemoved) {
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

    const interpretCommand = async (transcript: string) => {
        try {
            const clearFilterPhrases = [
                "clear filter", "reset filter", "remove filter", "clear all filter",
                "reset all filter", "remove all filter", "clear the filter", "start over",
            ];
            for (const phrase of clearFilterPhrases) {
                if (transcript.includes(phrase)) return "clearFilters";
            }

            const availableFunctionsText = Object.values(availableFunctions)
                .map((fn) => `- ${fn.name}: ${fn.description}`)
                .join("\n");

            const prompt = prompts.interpretCommand
                .replace("{transcript}", transcript)
                .replace("{availableFunctions}", availableFunctionsText);

            return (await runGeminiText(prompt)).trim();
        } catch (error) {
            console.error("Gemini API error:", error);
            return "unknown";
        }
    };

    const processVoiceCommand = async (command: string) => {
        console.log("Processing command:", command);
        logAction(`Processing command: "${command}"`);
        setLastAction(`Processing: "${command}"`);

        try {
            const directHandled = await handleDirectCommands(command);
            if (directHandled) {
                logAction(`Handled via direct rules: "${command}"`);
                return;
            }

            const startTime = performance.now();
            const primaryIntent = await classifyPrimaryIntent(command);
            const classificationTime = performance.now() - startTime;
            console.log(`Intent classification took ${classificationTime.toFixed(2)}ms`);

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
                    if (handled) setLastAction(`Navigating to cart: "${command}"`);
                    break;
                case "product_action":
                    handled = await handleProductActions(command);
                    if (handled) setLastAction(`Product action completed: "${command}"`);
                    break;
                case "product_navigation":
                    handled = await handleProductDetailNavigation(command);
                    if (handled) setLastAction(`Navigating to product: "${command}"`);
                    break;
                case "remove_filter":
                    handled = await handleRemoveFilters(command);
                    break;
                case "category_navigation": {
                    const categoryNavigated = await handleCategoryNavigation(command);
                    if (categoryNavigated) {
                        setLastAction(`Navigating to category based on: "${command}"`);
                        const filtersApplied = await interpretFilterCommand(command);
                        if (filtersApplied === "filters_updated") {
                            setLastAction(`Navigated to category and applied filters based on: "${command}"`);
                        }
                        handled = true;
                    }
                    break;
                }
                case "apply_filter":
                    const filterResult = await interpretFilterCommand(command);
                    if (filterResult === "filters_updated") {
                        setLastAction(`Filters updated based on: "${command}"`);
                        handled = true;
                    }
                    break;
                case "clear_filters":
                    clearFilters();
                    setLastAction(`All filters cleared based on: "${command}"`);
                    handled = true;
                    break;
                case "general_command":
                    const action = await interpretCommand(command);
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
                            const pageStateCheckout = getCurrentPageState();
                            if (pageStateCheckout.isPaymentPage) {
                                const userInfo = getUserInfo();
                                if (userInfo.cardNumber && userInfo.expiryDate && userInfo.cvv && userInfo.name && userInfo.email && userInfo.address) {
                                    setLastAction("Completing your order...");
                                    const submitButton = document.querySelector('button[type="submit"]') as HTMLElement;
                                    if (submitButton) submitButton.click();
                                    else await navigate("/confirmation");
                                } else {
                                    setLastAction("Please complete your payment information");
                                }
                            } else {
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
                            handled = true;
                            break;
                    }
                    break;
            }

            if (!handled) {
                setLastAction(`Command not recognized: "${command}"`);
                logAction(`No handler processed: "${command}"`, false);
            } else {
                const handlerTime = performance.now() - handlerStartTime;
                console.log(`Handler execution took ${handlerTime.toFixed(2)}ms`);
                logAction(`Successfully handled "${command}" (${primaryIntent})`);
            }
        } catch (error) {
            console.error("Error processing voice command:", error);
            setLastAction(`Error processing: "${command}"`);
            logAction(`Error processing: "${command}"`, false);
        }
    };

    return {
        processVoiceCommand,
        logAction,
        lastAction,
        actionLog,
        setLastAction
    };
};
