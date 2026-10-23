/**
 * Utility functions for Mileage conversion and formatting.
 *
 * Google Sheet and Admin input provide mileage in MILES.
 * Conversion factor: 1 mile ≈ 1.60934 kilometers.
 */

export interface MileageInfo {
    milesText: string;
    kmText: string;
    hasValue: boolean;
}

/**
 * Parse any raw mileage string (e.g. "16,325", "16325", "16,325 mi", "16,325 km")
 * into numeric miles and calculate converted kilometers.
 */
export function parseMileage(mileage?: string | number | null): MileageInfo {
    if (mileage === undefined || mileage === null) {
        return { milesText: "N/A", kmText: "", hasValue: false };
    }

    const str = String(mileage).trim();
    if (!str || str.toLowerCase() === "n/a" || str === "-") {
        return { milesText: "N/A", kmText: "", hasValue: false };
    }

    // Extract digits and optional decimals
    const numericPart = str.replace(/[^0-9.]/g, "");
    if (!numericPart) {
        return { milesText: str, kmText: "", hasValue: false };
    }

    const milesNum = parseFloat(numericPart);
    if (isNaN(milesNum)) {
        return { milesText: str, kmText: "", hasValue: false };
    }

    // Format miles with commas
    const formattedMiles = Math.round(milesNum).toLocaleString();
    const kmNum = Math.round(milesNum * 1.60934);
    const formattedKm = kmNum.toLocaleString();

    return {
        milesText: `${formattedMiles} miles`,
        kmText: `≈ ${formattedKm} km`,
        hasValue: true,
    };
}
