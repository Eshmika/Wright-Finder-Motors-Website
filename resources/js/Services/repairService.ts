import { parseCsv, formatDriveImageUrl } from "@/Services/vehicleService";

export interface ServiceCategory {
    id: string;
    name: string;
    icon: string; // SVG code, Drive URL, or identifier
    description?: string;
    status: "Active" | "Inactive";
    serviceCount?: number;
}

export interface RepairService {
    id: string;
    name: string;
    image?: string;
    category: string;
    price: number | string;
    laborTime: string; // e.g. "30 min", "1 hr 30 min"
    description?: string;
    includes: string[]; // Unordered list items
    status: "Active" | "Inactive";
}

export const CATEGORY_SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/16dhtw1POBIeifrAEk0ZqmH3jV8s20quo9Si3GfebifE/gviz/tq?tqx=out:csv&sheet=Category";

export const SERVICE_SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/16dhtw1POBIeifrAEk0ZqmH3jV8s20quo9Si3GfebifE/gviz/tq?tqx=out:csv&sheet=Service";

export const ESTIMATE_SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/16dhtw1POBIeifrAEk0ZqmH3jV8s20quo9Si3GfebifE/gviz/tq?tqx=out:csv&sheet=Estimate";

export interface EstimateRequest {
    id: string;
    year: string;
    make: string;
    model: string;
    mileage: string;
    servicesNeeded: string;
    additionalDetails: string;
    serviceLocation: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    timestamp: string;
}

// Standard preset icons available for quick selection or preview
export const PRESET_CATEGORY_ICONS: {
    [key: string]: { label: string; svg: string; color: string; bg: string };
} = {
    Maintenance: {
        label: "Maintenance",
        color: "text-blue-600",
        bg: "bg-blue-50 border-blue-200",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/></svg>`,
    },
    Brakes: {
        label: "Brakes",
        color: "text-rose-600",
        bg: "bg-rose-50 border-rose-200",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/></svg>`,
    },
    Tires: {
        label: "Tires",
        color: "text-emerald-600",
        bg: "bg-emerald-50 border-emerald-200",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    },
    HVAC: {
        label: "HVAC",
        color: "text-sky-600",
        bg: "bg-sky-50 border-sky-200",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M12 2v20"/><path d="M2 12h20"/><path d="m4.93 4.93 14.14 14.14"/><path d="m19.07 4.93-14.14 14.14"/></svg>`,
    },
    Electrical: {
        label: "Electrical",
        color: "text-purple",
        bg: "bg-purple/10 border-purple/20",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect width="16" height="10" x="4" y="7" rx="2"/><line x1="6" x2="6" y1="4" y2="7"/><line x1="18" x2="18" y1="4" y2="7"/><line x1="8" x2="10" y1="12" y2="12"/><line x1="14" x2="16" y1="12" y2="12"/><line x1="15" x2="15" y1="11" y2="13"/></svg>`,
    },
    Diagnostics: {
        label: "Diagnostics",
        color: "text-amber-600",
        bg: "bg-amber-50 border-amber-200",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M4 10h16M2 14h20M9 6v12M15 6v12"/></svg>`,
    },
};

// Default fallback categories if sheet is initial/empty
export const DEFAULT_CATEGORIES: ServiceCategory[] = [];

export async function fetchAllCategories(): Promise<ServiceCategory[]> {
    try {
        const res = await fetch(CATEGORY_SHEET_CSV_URL);
        if (!res.ok) {
            return DEFAULT_CATEGORIES;
        }
        const text = await res.text();
        if (
            text.includes("<!DOCTYPE html") ||
            text.includes("<html") ||
            text.trim().length === 0
        ) {
            return DEFAULT_CATEGORIES;
        }
        const rows = parseCsv(text);
        if (rows.length < 2) return DEFAULT_CATEGORIES;

        const headers = rows[0].map((h) => h.trim().toLowerCase());
        const getIdx = (name: string) =>
            headers.findIndex((h) => h.includes(name));

        const idIdx = getIdx("id");
        const nameIdx = getIdx("name");
        const iconIdx = getIdx("icon");
        const descIdx = getIdx("desc");
        const statusIdx = getIdx("status");

        const sheetCategories: ServiceCategory[] = [];
        const seenNames = new Set<string>();

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;
            const name = nameIdx !== -1 ? row[nameIdx]?.trim() : row[1]?.trim();
            if (!name) continue;

            const id =
                idIdx !== -1 && row[idIdx]?.trim()
                    ? row[idIdx].trim()
                    : `CAT-${i}`;
            const icon = iconIdx !== -1 ? row[iconIdx]?.trim() || name : name;
            const description = descIdx !== -1 ? row[descIdx]?.trim() : "";
            const rawStatus =
                statusIdx !== -1 ? row[statusIdx]?.trim() : "Active";
            const status: "Active" | "Inactive" =
                rawStatus.toLowerCase().includes("inact") ||
                rawStatus.toLowerCase() === "false"
                    ? "Inactive"
                    : "Active";

            seenNames.add(name.toLowerCase());
            sheetCategories.push({ id, name, icon, description, status });
        }

        // Include default preset categories if not already present in the sheet
        const mergedCategories: ServiceCategory[] = [...sheetCategories];
        for (const defCat of DEFAULT_CATEGORIES) {
            if (!seenNames.has(defCat.name.toLowerCase())) {
                mergedCategories.push(defCat);
            }
        }

        return mergedCategories.length > 0
            ? mergedCategories
            : DEFAULT_CATEGORIES;
    } catch {
        return DEFAULT_CATEGORIES;
    }
}

export async function fetchAllServices(): Promise<RepairService[]> {
    try {
        const res = await fetch(SERVICE_SHEET_CSV_URL);
        if (!res.ok) {
            return [];
        }
        const text = await res.text();
        if (
            text.includes("<!DOCTYPE html") ||
            text.includes("<html") ||
            text.trim().length === 0
        ) {
            return [];
        }
        const rows = parseCsv(text);
        if (rows.length < 2) return [];

        const headers = rows[0].map((h) => h.trim().toLowerCase());
        const getIdx = (name: string) =>
            headers.findIndex((h) => h.includes(name));

        const idIdx = getIdx("id");
        const nameIdx =
            getIdx("service name") !== -1
                ? getIdx("service name")
                : getIdx("name");
        const imageIdx = getIdx("image");
        const catIdx = getIdx("category");
        const priceIdx = getIdx("price");
        const laborIdx = getIdx("labor");
        const descIdx = getIdx("desc");
        const incIdx = getIdx("include");
        const statusIdx = getIdx("status");

        const list: RepairService[] = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;
            const name = nameIdx !== -1 ? row[nameIdx]?.trim() : row[1]?.trim();
            if (!name) continue;

            const id =
                idIdx !== -1 && row[idIdx]?.trim()
                    ? row[idIdx].trim()
                    : `SRV-${i}`;
            const rawImage = imageIdx !== -1 ? row[imageIdx]?.trim() : "";
            const image = formatDriveImageUrl(rawImage);
            const category =
                catIdx !== -1 ? row[catIdx]?.trim() : "Maintenance";
            const price = priceIdx !== -1 ? row[priceIdx]?.trim() : "0";
            const laborTime =
                laborIdx !== -1 ? row[laborIdx]?.trim() : "30 min";
            const description = descIdx !== -1 ? row[descIdx]?.trim() : "";
            const rawIncludes = incIdx !== -1 ? row[incIdx]?.trim() : "";
            const includes = rawIncludes
                ? rawIncludes
                      .split("\n")
                      .map((s) => s.replace(/^[•\-\*]\s*/, "").trim())
                      .filter(Boolean)
                : [];
            const rawStatus =
                statusIdx !== -1 ? row[statusIdx]?.trim() : "Active";
            const status: "Active" | "Inactive" =
                rawStatus.toLowerCase().includes("inact") ||
                rawStatus.toLowerCase() === "false"
                    ? "Inactive"
                    : "Active";

            list.push({
                id,
                name,
                image,
                category,
                price,
                laborTime,
                description,
                includes,
                status,
            });
        }
        return list;
    } catch {
        return [];
    }
}

export function expandYearsSold(yearsSold: string): string[] {
    if (!yearsSold) return [];
    const set = new Set<string>();
    const currentYear = new Date().getFullYear();

    // Match ranges like 2017-2026, 2017–2026, 2017—2026, 2017 to 2026, 2017-Present
    const rangeRegex =
        /\b((?:19|20)\d{2})\s*(?:-|–|—|to)\s*((?:19|20)\d{2}|present)\b/gi;
    let match: RegExpExecArray | null;
    while ((match = rangeRegex.exec(yearsSold)) !== null) {
        const start = Number(match[1]);
        const end =
            match[2].toLowerCase() === "present"
                ? currentYear
                : Number(match[2]);
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let y = min; y <= max; y++) {
            set.add(String(y));
        }
    }

    // Also include any standalone 4-digit years
    const singleMatches = yearsSold.match(/\b(19|20)\d{2}\b/g);
    if (singleMatches) {
        singleMatches.forEach((y) => set.add(y));
    }

    return Array.from(set);
}

export async function fetchAllEstimates(): Promise<EstimateRequest[]> {
    try {
        const res = await fetch(ESTIMATE_SHEET_CSV_URL);
        if (!res.ok) return [];
        const text = await res.text();
        if (
            text.includes("<!DOCTYPE html") ||
            text.includes("<html") ||
            text.trim().length === 0
        ) {
            return [];
        }
        const rows = parseCsv(text);
        if (rows.length < 2) return [];

        const headers = rows[0].map((h) => h.trim().toLowerCase());
        const getIdx = (name: string) =>
            headers.findIndex((h) => h.includes(name));

        const idIdx = getIdx("id");
        const yearIdx = getIdx("year");
        const makeIdx = getIdx("make");
        const modelIdx = getIdx("model");
        const mileageIdx = getIdx("mileage");
        const servicesIdx = getIdx("service");
        const detailsIdx = getIdx("detail");
        const locationIdx = getIdx("location");
        const nameIdx = getIdx("name");
        const emailIdx = getIdx("email");
        const phoneIdx = getIdx("phone");
        const statusIdx = getIdx("status");
        const timestampIdx = getIdx("timestamp");
        const dateIdx = timestampIdx !== -1 ? timestampIdx : getIdx("date");

        const list: EstimateRequest[] = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;
            const id =
                idIdx !== -1 ? row[idIdx]?.trim() || "" : row[0]?.trim() || "";
            const fullName = nameIdx !== -1 ? row[nameIdx]?.trim() || "" : "";
            if (!id && !fullName) continue;

            list.push({
                id: id || `EST-${i}`,
                year: yearIdx !== -1 ? row[yearIdx]?.trim() || "" : "",
                make: makeIdx !== -1 ? row[makeIdx]?.trim() || "" : "",
                model: modelIdx !== -1 ? row[modelIdx]?.trim() || "" : "",
                mileage: mileageIdx !== -1 ? row[mileageIdx]?.trim() || "" : "",
                servicesNeeded:
                    servicesIdx !== -1 ? row[servicesIdx]?.trim() || "" : "",
                additionalDetails:
                    detailsIdx !== -1 ? row[detailsIdx]?.trim() || "" : "",
                serviceLocation:
                    locationIdx !== -1 ? row[locationIdx]?.trim() || "" : "",
                fullName,
                email: emailIdx !== -1 ? row[emailIdx]?.trim() || "" : "",
                phone: phoneIdx !== -1 ? row[phoneIdx]?.trim() || "" : "",
                status:
                    statusIdx !== -1 && row[statusIdx]?.trim()
                        ? row[statusIdx].trim()
                        : "New",
                timestamp: dateIdx !== -1 ? row[dateIdx]?.trim() || "" : "",
            });
        }
        return list.reverse();
    } catch {
        return [];
    }
}
