import { useCallback, useMemo } from "react";
import { products, Product } from "@/data/products";
import { prompts } from "@/lib/prompts";
import { useProduct } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";

// Shared Gemini utilities - will be imported from parent
type RunGeminiText = (prompt: string) => Promise<string>;
type ExtractJson = (text: string) => string;
type LogAction = (action: string, success?: boolean) => void;

interface UseProductHandlerProps {
    runGeminiText: RunGeminiText;
    extractJson: ExtractJson;
    logAction: LogAction;
    speak: (text: string) => void;
}

export const getCurrentPageState = () => {
    const currentPath = window.location.pathname;
    // Manual params parsing for /product/:id
    let currentProductId = null;
    if (currentPath.startsWith("/product/")) {
        currentProductId = currentPath.split("/product/")[1];
    }

    let currentProduct: Product | null = null;
    if (currentProductId) {
        currentProduct = products.find(p => p.id === currentProductId) || null;
    }

    return {
        path: currentPath,
        currentProduct,
        isProductPage: currentPath.startsWith("/product/"),
        isCartPage: currentPath === "/cart",
        isPaymentPage: currentPath === "/payment",
    };
};

export const useProductHandler = ({
    runGeminiText,
    extractJson,
    logAction,
    speak,
}: UseProductHandlerProps) => {
    const { setSelectedSize, setQuantity, selectedSize, quantity } = useProduct();
    const { addItem } = useCart();

    const handleProductActions = useCallback(async (transcript: string) => {
        try {
            console.log(`[useProductHandler] handleProductActions called. selectedSize: "${selectedSize}"`);

            const pageState = getCurrentPageState();
            let currentProduct = pageState.currentProduct;
            let productName = currentProduct ? currentProduct.name : "current product";
            let productSizes = currentProduct ? currentProduct.sizes.join(", ") : "";

            console.log("[Voice Debug] Product Action Context:", { productName, productSizes, transcript, selectedSize });

            const prompt = prompts.productAction
                .replace("{productName}", productName)
                .replace("{sizes}", productSizes)
                .replace("{transcript}", transcript);

            const responseText = await runGeminiText(prompt);
            const cleaned = extractJson(responseText);
            const parsed = JSON.parse(cleaned);

            console.log("[Voice Debug] Parsed Product Action:", parsed);

            if (parsed.action === "none") {
                console.log("[Voice Debug] Action is 'none'");
                return false;
            }

            // Context switch check
            if (parsed.productName) {
                const targetProduct = products.find(p =>
                    p.name.toLowerCase().includes(parsed.productName.toLowerCase()) ||
                    parsed.productName.toLowerCase().includes(p.name.toLowerCase())
                );
                if (targetProduct) {
                    console.log("[Voice Debug] Switching context to product:", targetProduct.name);
                    currentProduct = targetProduct;
                }
            }

            if (!currentProduct) {
                console.log("[Voice Debug] No current product identified.");
                return false;
            }

            // Handle explicit size setting even if action is addToCart
            if (parsed.size) {
                const matchedSize = currentProduct.sizes.find(s => s.toLowerCase() === parsed.size.toLowerCase());
                if (matchedSize) {
                    if (matchedSize !== selectedSize) {
                        setSelectedSize(matchedSize);
                        logAction(`Size set to ${matchedSize}`);
                    }

                    // If action is JUST size, return here. If addToCart, we continue down.
                    if (parsed.action === "size") {
                        return true;
                    }
                } else {
                    console.log("[Voice Debug] Size mismatch:", parsed.size, "Available:", currentProduct.sizes);
                    // If action was just size, we should probably return or warn
                    if (parsed.action === "size") {
                        speak(`I couldn't find size ${parsed.size}. Available sizes are ${currentProduct.sizes.join(", ")}`);
                        return true;
                    }
                }
            }

            // Ensure quantity is a number
            const parsedQuantity = parsed.quantity ? parseInt(String(parsed.quantity), 10) : undefined;

            if (parsed.action === "quantity" && parsedQuantity) {
                setQuantity(parsedQuantity);
                logAction(`Quantity set to ${parsedQuantity}`);
                return true;
            }

            if (parsed.action === "addToCart") {
                console.log("[Voice Debug] Attempting Add to Cart...");

                // Determine size to add: Explicitly mentioned size > Context size > Single available size
                let sizeToAdd = parsed.size ?
                    currentProduct.sizes.find(s => s.toLowerCase() === parsed.size.toLowerCase()) :
                    selectedSize;

                // Default size logic if needed
                if (!sizeToAdd) {
                    // Try to see if there's only one size available, then we can safe-default
                    if (currentProduct.sizes.length === 1) {
                        sizeToAdd = currentProduct.sizes[0];
                        console.log("[Voice Debug] Auto-selected single available size:", sizeToAdd);
                    }
                }

                // Use quantity from voice command OR default to 1 (not the context quantity which may be stale)
                const quantityToAdd = parsedQuantity || 1;

                if (sizeToAdd) {
                    console.log("[Voice Debug] Adding to cart:", currentProduct.name, sizeToAdd, "qty:", quantityToAdd);
                    addItem({
                        id: currentProduct.id,
                        name: currentProduct.name,
                        price: currentProduct.price,
                        image: currentProduct.image,
                        size: sizeToAdd,
                        quantity: quantityToAdd
                    });
                    logAction(`Added ${quantityToAdd} ${currentProduct.name} to cart`);
                    speak("Item added. Do you want to continue browsing or proceed to checkout?");
                    return true;
                } else {
                    console.log("[Voice Debug] Size required but missing.");
                    logAction("Please select a size first");
                    speak("Please select a size first");
                    return true;
                }
            }

            return true;
        } catch (error) {
            console.error("[Voice Debug] Product action error:", error);
            return false;
        }
    }, [selectedSize, quantity, addItem, runGeminiText, extractJson, logAction, speak, setSelectedSize, setQuantity]);

    return useMemo(() => ({
        handleProductActions,
        getCurrentPageState,
    }), [handleProductActions]);
};
