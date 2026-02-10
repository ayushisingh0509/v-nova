import { useCallback, useMemo } from "react";
import { prompts } from "@/lib/prompts";
import { useFilters, FilterState } from "@/context/FilterContext";
import { filterOptions } from "@/data/products";

// Shared Gemini utilities - will be imported from parent
type RunGeminiText = (prompt: string) => Promise<string>;
type ExtractJson = (text: string) => string;
type LogAction = (action: string, success?: boolean) => void;

interface UseFilterHandlerProps {
    runGeminiText: RunGeminiText;
    extractJson: ExtractJson;
    logAction: LogAction;
}

export const useFilterHandler = ({
    runGeminiText,
    extractJson,
    logAction,
}: UseFilterHandlerProps) => {
    const { updateFilters, clearFilters, removeFilter } = useFilters();

    const interpretFilterCommand = useCallback(async (transcript: string) => {
        try {
            const prompt = prompts.filterCommand
                .replace("{transcript}", transcript)
                .replace("{colors}", filterOptions.colors.join(", "))
                .replace("{sizes}", filterOptions.sizes.join(", "))
                .replace("{materials}", filterOptions.materials.join(", "))
                .replace("{genders}", filterOptions.genders.join(", "))
                .replace("{brands}", filterOptions.brands.join(", "))
                .replace("{categories}", filterOptions.subCategories.join(", "));

            const responseText = await runGeminiText(prompt);
            const cleaned = extractJson(responseText);
            const parsedFilters = JSON.parse(cleaned);

            const normalizedFilters: Partial<FilterState> = {};
            let filtersApplied = false;

            // Helper to match enum/options
            const matchOption = (val: string, options: string[]) =>
                options.find(o => o.toLowerCase() === val.toLowerCase());

            if (parsedFilters.colors && parsedFilters.colors.length) {
                const colors = parsedFilters.colors.map((c: string) => matchOption(c, filterOptions.colors)).filter(Boolean);
                if (colors.length) { normalizedFilters.colors = colors; filtersApplied = true; }
            }
            if (parsedFilters.sizes && parsedFilters.sizes.length) {
                const sizes = parsedFilters.sizes.map((c: string) => matchOption(c, filterOptions.sizes)).filter(Boolean);
                if (sizes.length) { normalizedFilters.sizes = sizes; filtersApplied = true; }
            }
            if (parsedFilters.materials && parsedFilters.materials.length) {
                const mats = parsedFilters.materials.map((c: string) => matchOption(c, filterOptions.materials)).filter(Boolean);
                if (mats.length) { normalizedFilters.materials = mats; filtersApplied = true; }
            }
            if (parsedFilters.brands && parsedFilters.brands.length) {
                const brands = parsedFilters.brands.map((c: string) => matchOption(c, filterOptions.brands)).filter(Boolean);
                if (brands.length) { normalizedFilters.brands = brands; filtersApplied = true; }
            }
            if (parsedFilters.genders && parsedFilters.genders.length) {
                const genders = parsedFilters.genders.map((c: string) => matchOption(c, filterOptions.genders)).filter(Boolean);
                if (genders.length) { normalizedFilters.genders = genders; filtersApplied = true; }
            }
            if (parsedFilters.price && Array.isArray(parsedFilters.price) && parsedFilters.price.length === 2) {
                normalizedFilters.price = parsedFilters.price;
                filtersApplied = true;
            }

            if (filtersApplied) {
                updateFilters(normalizedFilters);
                logAction("Filters applied");
                return true;
            }
            return false;

        } catch (error) {
            console.error("Filter command error:", error);
            return false;
        }
    }, [updateFilters, logAction, runGeminiText, extractJson]);

    const handleRemoveFilters = useCallback(async (transcript: string) => {
        try {
            const prompt = prompts.removeFilterCommand
                .replace("{transcript}", transcript)
                .replace("{colors}", filterOptions.colors.join(", "))
                .replace("{sizes}", filterOptions.sizes.join(", "))
                .replace("{materials}", filterOptions.materials.join(", "))
                .replace("{genders}", filterOptions.genders.join(", "))
                .replace("{brands}", filterOptions.brands.join(", "))
                .replace("{categories}", filterOptions.subCategories.join(", "));

            const responseText = await runGeminiText(prompt);
            const cleaned = extractJson(responseText);
            const parsed = JSON.parse(cleaned);

            if (parsed.isRemoveFilter) {
                if (parsed.colors && parsed.colors.length) {
                    parsed.colors.forEach((c: string) => removeFilter('colors', [c]));
                }

                // Fallback for clear all
                if (transcript.includes("clear") || transcript.includes("reset") || transcript.includes("remove all")) {
                    clearFilters();
                    logAction("All filters cleared");
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error("Remove filter error:", error);
            return false;
        }
    }, [removeFilter, clearFilters, logAction, runGeminiText, extractJson]);

    const handleClearFilters = useCallback(() => {
        clearFilters();
        logAction("Filters cleared");
        return true;
    }, [clearFilters, logAction]);

    return useMemo(() => ({
        interpretFilterCommand,
        handleRemoveFilters,
        handleClearFilters,
    }), [interpretFilterCommand, handleRemoveFilters, handleClearFilters]);
};
