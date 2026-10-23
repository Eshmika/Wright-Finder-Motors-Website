export interface DetailedVehicle {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    availabilities: string;
    titleStatus: string;
    trim: string;
    bodyStyle: string;
    mileage: string;
    exteriorColor: string;
    interiorColor: string;
    seatMaterial: string;
    engine: string;
    engineTypeSize: string;
    transmission: string;
    driveline: string;
    fuelType: string;
    powerOptions: string;
    condition: string;
    driveCondition: string;
    interiorFeatures: string[];
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    purchaseDate: string;
    price: number;
    originalPrice: number;
    discount: number;
    rentPrice?: number;
    rentDiscount?: number;
    rentOrSell?: string;
    mainImageUrl?: string;
    images: string[];
}

export function formatDriveImageUrl(url: string): string {
    if (!url) return "";
    const trimmed = url.trim();
    if (!trimmed) return "";

    const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }

    const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1]) {
        return `https://lh3.googleusercontent.com/d/${matchId[1]}`;
    }

    return trimmed;
}

export function parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentCell += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === "," && !insideQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = "";
        } else if ((char === "\r" || char === "\n") && !insideQuotes) {
            if (char === "\r" && nextChar === "\n") {
                i++;
            }
            currentRow.push(currentCell.trim());
            if (currentRow.some((c) => c !== "")) {
                rows.push(currentRow);
            }
            currentRow = [];
            currentCell = "";
        } else {
            currentCell += char;
        }
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c !== "")) {
            rows.push(currentRow);
        }
    }

    return rows;
}

export const SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/16dhtw1POBIeifrAEk0ZqmH3jV8s20quo9Si3GfebifE/gviz/tq?tqx=out:csv&sheet=Vehicle%20details";

export async function fetchAllVehicles(): Promise<DetailedVehicle[]> {
    const res = await fetch(SHEET_CSV_URL);
    if (!res.ok) {
        throw new Error(`Failed to fetch vehicles: ${res.statusText}`);
    }
    const text = await res.text();
    const rows = parseCsv(text);
    if (rows.length < 2) return [];

    const headers = rows[0].map((h) => h.trim());
    const getIndex = (name: string): number => {
        return headers.findIndex((h) => h.toLowerCase() === name.toLowerCase());
    };

    const carIdIdx = getIndex("Car ID");
    const carNameIdx = getIndex("Car Name");
    const modelIdx = getIndex("Model");
    const yearIdx = getIndex("Year");
    const mileageIdx = getIndex("Mileage");
    const priceIdx = getIndex("Price");
    const discountIdx = getIndex("Discount");
    const rentPriceIdx = getIndex("Rent Price");
    const rentDiscountIdx = getIndex("Rent Discount");
    const vinIdx = getIndex("VIN") !== -1 ? getIndex("VIN") : 8; // Column I is index 8 (0-indexed: A=0, B=1, ... I=8)
    const statusIdx = getIndex("Status");
    const titleIdx = getIndex("Title");
    const trimIdx = getIndex("Trim");
    const bodyStyleIdx = getIndex("Body Style");
    const rentOrSellIdx = getIndex("Rent or Sell");
    const engineIdx = getIndex("Engine");
    const engineTypeSizeIdx = getIndex("Engine Type/Size");
    const transmissionIdx = getIndex("Transmission");
    const drivelineIdx = getIndex("Driveline");
    const fuelTypeIdx = getIndex("Fuel Type");
    const powerOptionsIdx = getIndex("Power Options");
    const driveConditionIdx = getIndex("Drive Condition");
    const conditionIdx = getIndex("Condition");
    const seatMaterialIdx = getIndex("Seat Material");
    const interiorColorIdx = getIndex("Interior Color");
    const exteriorColorIdx = getIndex("Exterior Color");
    const interiorFeaturesIdx = getIndex("Interior Features");
    const mainImageIdx = getIndex("Main Image URLs");
    const subImagesIdx = getIndex("Sub Image URLs");
    const clientNameIdx = getIndex("CLIENT NAME");
    const purchaseDateIdx = getIndex("PURCHASE DATE");
    const clientPhoneIdx = getIndex("Client Phone");
    const clientEmailIdx = getIndex("Client Email");

    const vehicles: DetailedVehicle[] = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const carId =
            carIdIdx !== -1 ? row[carIdIdx]?.trim() || `car-${i}` : `car-${i}`;
        const carName = carNameIdx !== -1 ? row[carNameIdx]?.trim() || "" : "";
        const model = modelIdx !== -1 ? row[modelIdx]?.trim() || "" : "";
        const yearStr = yearIdx !== -1 ? row[yearIdx]?.trim() || "" : "";

        if (!carName && !model) continue;

        const year = parseInt(yearStr.replace(/[^0-9]/g, ""), 10) || 0;
        const titleParts = [carName, model, yearStr].filter(Boolean);
        const title = titleParts.join(" ") || `Vehicle #${i}`;

        const originalPrice =
            priceIdx !== -1
                ? parseFloat(row[priceIdx]?.replace(/[^0-9.]/g, "") || "0")
                : 0;
        const discount =
            discountIdx !== -1
                ? parseFloat(row[discountIdx]?.replace(/[^0-9.]/g, "") || "0")
                : 0;

        const finalPrice =
            discount > 0 && originalPrice >= discount
                ? originalPrice - discount
                : originalPrice;

        const rawMain = mainImageIdx !== -1 ? row[mainImageIdx] || "" : "";
        const rawSubs = subImagesIdx !== -1 ? row[subImagesIdx] || "" : "";
        const allImageStrings = `${rawMain},${rawSubs}`;
        const images = allImageStrings
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map(formatDriveImageUrl)
            .filter(Boolean);

        const rawFeatures =
            interiorFeaturesIdx !== -1 ? row[interiorFeaturesIdx] || "" : "";
        const interiorFeatures = rawFeatures
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean);

        vehicles.push({
            id: carId,
            title,
            make: carName,
            model,
            year,
            vin: vinIdx !== -1 ? row[vinIdx]?.trim() || "" : "",
            availabilities:
                statusIdx !== -1 ? row[statusIdx]?.trim() || "" : "",
            titleStatus: titleIdx !== -1 ? row[titleIdx]?.trim() || "" : "",
            trim: trimIdx !== -1 ? row[trimIdx]?.trim() || "" : "",
            bodyStyle:
                bodyStyleIdx !== -1 ? row[bodyStyleIdx]?.trim() || "" : "",
            mileage: mileageIdx !== -1 ? row[mileageIdx]?.trim() || "" : "",
            exteriorColor:
                exteriorColorIdx !== -1
                    ? row[exteriorColorIdx]?.trim() || ""
                    : "",
            interiorColor:
                interiorColorIdx !== -1
                    ? row[interiorColorIdx]?.trim() || ""
                    : "",
            seatMaterial:
                seatMaterialIdx !== -1
                    ? row[seatMaterialIdx]?.trim() || ""
                    : "",
            engine: engineIdx !== -1 ? row[engineIdx]?.trim() || "" : "",
            engineTypeSize:
                engineTypeSizeIdx !== -1
                    ? row[engineTypeSizeIdx]?.trim() || ""
                    : "",
            transmission:
                transmissionIdx !== -1
                    ? row[transmissionIdx]?.trim() || ""
                    : "",
            driveline:
                drivelineIdx !== -1 ? row[drivelineIdx]?.trim() || "" : "",
            fuelType: fuelTypeIdx !== -1 ? row[fuelTypeIdx]?.trim() || "" : "",
            powerOptions:
                powerOptionsIdx !== -1
                    ? row[powerOptionsIdx]?.trim() || ""
                    : "",
            condition:
                conditionIdx !== -1 ? row[conditionIdx]?.trim() || "" : "",
            driveCondition:
                driveConditionIdx !== -1
                    ? row[driveConditionIdx]?.trim() || ""
                    : "",
            interiorFeatures,
            clientName:
                clientNameIdx !== -1 ? row[clientNameIdx]?.trim() || "" : "",
            clientPhone:
                clientPhoneIdx !== -1 ? row[clientPhoneIdx]?.trim() || "" : "",
            clientEmail:
                clientEmailIdx !== -1 ? row[clientEmailIdx]?.trim() || "" : "",
            purchaseDate:
                purchaseDateIdx !== -1
                    ? row[purchaseDateIdx]?.trim() || ""
                    : "",
            price: finalPrice,
            originalPrice,
            discount,
            rentPrice:
                rentPriceIdx !== -1
                    ? parseFloat(
                          row[rentPriceIdx]?.replace(/[^0-9.]/g, "") || "0",
                      ) || undefined
                    : undefined,
            rentDiscount:
                rentDiscountIdx !== -1
                    ? parseFloat(
                          row[rentDiscountIdx]?.replace(/[^0-9.]/g, "") || "0",
                      ) || undefined
                    : undefined,
            rentOrSell:
                rentOrSellIdx !== -1 ? row[rentOrSellIdx]?.trim() || "" : "",
            mainImageUrl: images.length > 0 ? images[0] : "",
            images,
        });
    }

    // Status Rank ordering: Available -> Pending -> Sold -> other
    const statusRank = (status?: string): number => {
        const s = (status || "").toLowerCase().trim();
        if (s.startsWith("avail")) return 1;
        if (s.startsWith("pend")) return 2;
        if (s.startsWith("sold")) return 3;
        return 4;
    };

    // Reverse to get newest rows first, then sort stably by status priority
    const reversed = vehicles.reverse();
    return [...reversed].sort((a, b) => {
        return statusRank(a.availabilities) - statusRank(b.availabilities);
    });
}
