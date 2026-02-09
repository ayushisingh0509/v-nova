import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { products } from "@/data/products";
import { prompts } from "@/lib/prompts";

// Shared Gemini utilities - will be imported from parent
type RunGeminiText = (prompt: string) => Promise<string>;
type ExtractJson = (text: string) => string;
type LogAction = (action: string, success?: boolean) => void;

interface UseNavigationHandlerProps {
    runGeminiText: RunGeminiText;
    extractJson: ExtractJson;
    logAction: LogAction;
}

export const useNavigationHandler = ({
    runGeminiText,
    extractJson,
    logAction,
}: UseNavigationHandlerProps) => {
    const navigate = useNavigate();
    // Navigation cooldown to prevent rapid re-navigation
    const lastNavigationTimeRef = useRef<number>(0);
    const NAVIGATION_COOLDOWN_MS = 3000; // 3 second cooldown after navigation

    const handleNavigationCommand = async (transcript: string) => {
        try {
            // Check navigation cooldown
            const now = Date.now();
            if (now - lastNavigationTimeRef.current < NAVIGATION_COOLDOWN_MS) {
                console.log("[Voice Debug] Navigation on cooldown, skipping navigation command");
                return false;
            }

            const prompt = prompts.navigationCommand.replace("{transcript}", transcript);
            const responseText = await runGeminiText(prompt);
            const cleaned = extractJson(responseText);
            const response = JSON.parse(cleaned);

            if (response.action === "back") {
                lastNavigationTimeRef.current = Date.now();
                window.history.back();
                logAction("Going back");
                return true;
            } else if (response.action === "home") {
                lastNavigationTimeRef.current = Date.now();
                await navigate("/");
                logAction("Navigating to home");
                return true;
            }
            return false;
        } catch (error) {
            console.error("Navigation error:", error);
            return false;
        }
    };

    const handleCartNavigation = async (transcript: string) => {
        try {
            const prompt = prompts.cartNavigation.replace("{transcript}", transcript);
            const response = (await runGeminiText(prompt)).trim().toLowerCase();
            if (response === "yes") {
                await navigate("/cart");
                logAction("Opening cart");
                return true;
            }
            return false;
        } catch (error) {
            console.error("Cart navigation error:", error);
            return false;
        }
    };

    const handleCategoryNavigation = async (transcript: string) => {
        try {
            const prompt = prompts.categoryNavigation.replace("{transcript}", transcript);
            const responseText = await runGeminiText(prompt);
            const cleaned = extractJson(responseText);
            const parsed = JSON.parse(cleaned);
            const target = parsed.target?.toLowerCase();

            if (target === "gym") {
                await navigate("/products/gym");
                logAction("Showing gym products");
                return true;
            } else if (target === "yoga") {
                await navigate("/products/yoga");
                logAction("Showing yoga products");
                return true;
            } else if (target === "running") {
                await navigate("/products/jogging");
                logAction("Showing running gear");
                return true;
            }
            return false;
        } catch (error) {
            console.error("Category navigation error:", error);
            return false;
        }
    };

    const handleProductDetailNavigation = async (transcript: string) => {
        try {
            // Check navigation cooldown
            const now = Date.now();
            if (now - lastNavigationTimeRef.current < NAVIGATION_COOLDOWN_MS) {
                console.log("[Voice Debug] Navigation on cooldown, skipping product navigation");
                return false;
            }

            const productListText = products
                .map((p) => `ID: ${p.id} - Name: ${p.name} - Desc: ${p.description.substring(0, 50)}...`)
                .join("\n");

            const prompt = prompts.productDetailNavigation
                .replace("{transcript}", transcript)
                .replace("{productList}", productListText);

            const responseText = await runGeminiText(prompt);
            const cleaned = extractJson(responseText);
            const parsed = JSON.parse(cleaned);

            if (parsed.productId && parsed.confidence >= 0.7) {
                const product = products.find(p => p.id === parsed.productId);
                if (product) {
                    lastNavigationTimeRef.current = Date.now(); // Set cooldown
                    await navigate(`/product/${product.id}`);
                    logAction(`Navigating to ${product.name}`);
                    return true;
                }
            } else if (parsed.productId && parsed.confidence < 0.7) {
                console.log(`[Voice Debug] Product navigation rejected: low confidence ${parsed.confidence}`);
            }
            return false;
        } catch (error) {
            console.error("Product detail nav error:", error);
            return false;
        }
    };

    return {
        handleNavigationCommand,
        handleCartNavigation,
        handleCategoryNavigation,
        handleProductDetailNavigation,
    };
};
