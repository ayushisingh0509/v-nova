import { useCallback, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { prompts } from "@/lib/prompts";

// Shared Gemini utilities - will be imported from parent
type RunGeminiText = (prompt: string) => Promise<string>;
type ExtractJson = (text: string) => string;
type LogAction = (action: string, success?: boolean) => void;

interface UseCartHandlerProps {
    runGeminiText: RunGeminiText;
    extractJson: ExtractJson;
    logAction: LogAction;
}

export const useCartHandler = ({
    runGeminiText,
    extractJson,
    logAction,
}: UseCartHandlerProps) => {
    const { items, removeItem, updateQuantity } = useCart();

    const handleCartUpdate = useCallback(async (transcript: string) => {
        try {
            const cartItemsText = items
                .map((item) => `- ${item.name} (Qty: ${item.quantity})`)
                .join("\n");

            if (items.length === 0) {
                logAction("Cart is empty");
                return true;
            }

            const prompt = prompts.cartUpdate
                .replace("{transcript}", transcript)
                .replace("{cartItems}", cartItemsText);

            const responseText = await runGeminiText(prompt);
            const cleaned = extractJson(responseText);
            const parsed = JSON.parse(cleaned);

            console.log("[Voice Debug] Cart Update Parsed:", parsed);

            if (parsed.action === "none") {
                return false;
            }

            if (parsed.targetItem) {
                // Fuzzy match target item to cart items
                const targetName = parsed.targetItem.toLowerCase();
                const matchedItem = items.find(item =>
                    item.name.toLowerCase().includes(targetName) ||
                    targetName.includes(item.name.toLowerCase())
                );

                if (matchedItem) {
                    if (parsed.action === "remove") {
                        removeItem(matchedItem.id);
                        logAction(`Removed ${matchedItem.name}`);
                        return true;
                    }

                    if (parsed.action === "increase") {
                        const amount = parsed.quantity || 1;
                        updateQuantity(matchedItem.id, matchedItem.quantity + amount);
                        logAction(`Increased ${matchedItem.name} quantity`);
                        return true;
                    }

                    if (parsed.action === "decrease") {
                        const amount = parsed.quantity || 1;
                        const newQuantity = Math.max(0, matchedItem.quantity - amount);
                        if (newQuantity === 0) {
                            removeItem(matchedItem.id);
                            logAction(`Removed ${matchedItem.name}`);
                        } else {
                            updateQuantity(matchedItem.id, newQuantity);
                            logAction(`Decreased ${matchedItem.name} quantity`);
                        }
                        return true;
                    }

                    if (parsed.action === "set_quantity" && parsed.quantity !== null) {
                        if (parsed.quantity === 0) {
                            removeItem(matchedItem.id);
                            logAction(`Removed ${matchedItem.name}`);
                        } else {
                            updateQuantity(matchedItem.id, parsed.quantity);
                            logAction(`Set ${matchedItem.name} quantity to ${parsed.quantity}`);
                        }
                        return true;
                    }
                } else {
                    console.log("[Voice Debug] Item not found in cart:", parsed.targetItem);
                }
            }

            return false;

        } catch (error) {
            console.error("Cart update error:", error);
            return false;
        }
    }, [items, removeItem, updateQuantity, logAction, runGeminiText, extractJson]);

    return useMemo(() => ({
        handleCartUpdate
    }), [handleCartUpdate]);
};
