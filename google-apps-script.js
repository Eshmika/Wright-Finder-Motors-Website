/**
 * Google Apps Script Web App for Wright Finder Motors
 * Compatible with Eshmika/Wright-Finder-Motors Code.gs
 *
 * HOW TO USE / INSTALL:
 * 1. Open your Google Spreadsheet:
 *    https://docs.google.com/spreadsheets/d/16dhtw1POBIeifrAEk0ZqmH3jV8s20quo9Si3GfebifE
 * 2. In the top menu, go to: Extensions > Apps Script.
 * 3. In the script editor (where your existing Code.gs is located), paste this code:
 *    - EITHER add this to the bottom of your Code.gs
 *    - OR create a new script file (click + > Script, name it "ApiSync.gs") and paste this entire code.
 *    (Note: If you already have a doGet(e) in Code.gs, leave that one and only replace or add doPost(e)).
 * 4. Click "Deploy" (blue button at top right) > "New deployment" (or "Manage deployments" > Edit > New version).
 * 5. Configuration:
 *    - Select type: "Web app"
 *    - Description: "WFM Vehicle Webhook Sync"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (CRITICAL: Must be "Anyone" so the website can post data!)
 * 6. Click "Deploy" and Authorize access when prompted.
 * 7. Copy the Web app URL (looks like: https://script.google.com/macros/s/.../exec).
 * 8. In the website Admin panel > Add New Car, paste this URL into the Webhook URL field,
 *    or add it to your .env file as:
 *    GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
 */

/**
 * Handle POST requests from the website Admin Panel (Add New Car)
 */
function doPost(e) {
    try {
        var rawData = e && e.postData ? e.postData.contents : null;
        if (!rawData) {
            return ContentService.createTextOutput(
                JSON.stringify({
                    status: "error",
                    message: "No post data received in request.",
                }),
            ).setMimeType(ContentService.MimeType.JSON);
        }

        var data = JSON.parse(rawData);

        // Target Google Drive Folder ID
        var FOLDER_ID = "1EUPGHZPwovNhVOsIc-AEEJqUinAqEZKK";
        var folder;
        try {
            folder = DriveApp.getFolderById(FOLDER_ID);
        } catch (fErr) {
            folder = null;
        }

        // Helper to upload Base64 images to Google Drive
        function uploadBase64Image(fileObj, defaultPrefix) {
            if (!fileObj) return "";
            var b64 = fileObj.base64 || fileObj.data;
            if (!b64) return "";

            try {
                var contentType =
                    fileObj.type || fileObj.mimeType || "image/webp";
                var ext =
                    contentType.indexOf("webp") !== -1
                        ? ".webp"
                        : contentType.indexOf("png") !== -1
                          ? ".png"
                          : ".jpg";
                var fileName =
                    fileObj.name ||
                    defaultPrefix + "_" + new Date().getTime() + ext;
                var decodedData = Utilities.base64Decode(b64);
                var blob = Utilities.newBlob(
                    decodedData,
                    contentType,
                    fileName,
                );

                var file = null;
                // Method 1: Create directly in target folder
                if (folder && folder.createFile) {
                    try {
                        file = folder.createFile(blob);
                    } catch (createInFolderErr) {
                        file = null;
                    }
                }

                // Method 2: Fallback to DriveApp root and move to folder
                if (!file) {
                    file = DriveApp.createFile(blob);
                    if (folder) {
                        try {
                            file.moveTo(folder);
                        } catch (moveErr) {
                            // Leave in Drive if moveTo fails
                        }
                    }
                }

                // Try to make file viewable via link (ignore if account permissions restrict it)
                try {
                    file.setSharing(
                        DriveApp.Access.ANYONE_WITH_LINK,
                        DriveApp.Permission.VIEW,
                    );
                } catch (shareErr) {
                    // Non-fatal if domain/workspace restricts public links
                }

                var fileId = file.getId();
                return (
                    "https://drive.google.com/file/d/" +
                    fileId +
                    "/view?usp=drivesdk"
                );
            } catch (err) {
                console.error(
                    "Upload failed for " +
                        defaultPrefix +
                        ": " +
                        err.toString(),
                );
                return "";
            }
        }

        // 1. Process Main Image
        var mainImageUrl = "";
        if (data.mainImage && (data.mainImage.base64 || data.mainImage.data)) {
            mainImageUrl = uploadBase64Image(data.mainImage, "main");
        } else if (
            data.mainImages &&
            Array.isArray(data.mainImages) &&
            data.mainImages.length > 0
        ) {
            var firstMain = data.mainImages[0];
            mainImageUrl = uploadBase64Image(firstMain, "main");
        } else if (typeof data.mainImageUrl === "string" && data.mainImageUrl) {
            mainImageUrl = data.mainImageUrl;
        }

        // 2. Process Sub Images
        var subImageUrls = [];
        if (data.subImages && Array.isArray(data.subImages)) {
            for (var i = 0; i < data.subImages.length; i++) {
                var sub = data.subImages[i];
                if (sub && (sub.base64 || sub.data)) {
                    var uploaded = uploadBase64Image(sub, "sub_" + (i + 1));
                    if (uploaded) subImageUrls.push(uploaded);
                } else if (typeof sub === "string" && sub) {
                    subImageUrls.push(sub);
                }
            }
        } else if (typeof data.subImageUrls === "string" && data.subImageUrls) {
            subImageUrls.push(data.subImageUrls);
        }
        var subImagesJoined = subImageUrls.join(", ");

        // 3. Target Google Sheet: "Vehicle details" tab
        var SPREADSHEET_ID = "16dhtw1POBIeifrAEk0ZqmH3jV8s20quo9Si3GfebifE";
        var ss;
        try {
            ss = SpreadsheetApp.getActiveSpreadsheet();
            if (!ss) ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        } catch (ssErr) {
            ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        }

        var sheet = ss.getSheetByName("Vehicle details");
        if (!sheet) {
            return ContentService.createTextOutput(
                JSON.stringify({
                    status: "error",
                    message:
                        "Sheet tab 'Vehicle details' was not found in the spreadsheet.",
                }),
            ).setMimeType(ContentService.MimeType.JSON);
        }

        // 4. Read headers dynamically from Row 1
        var lastCol = sheet.getLastColumn();
        if (lastCol < 1) {
            return ContentService.createTextOutput(
                JSON.stringify({
                    status: "error",
                    message:
                        "The 'Vehicle details' sheet has no headers in row 1.",
                }),
            ).setMimeType(ContentService.MimeType.JSON);
        }

        var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
        var newRow = new Array(headers.length).fill("");

        // Auto-generate timestamp (e.g. 6/18/2026 21:43:27) if not provided
        var rowTimestamp =
            data.timestamp ||
            Utilities.formatDate(
                new Date(),
                Session.getScriptTimeZone() || "GMT",
                "M/d/yyyy HH:mm:ss",
            );

        // 5. Map fields to exact columns by header name
        for (var col = 0; col < headers.length; col++) {
            var h = headers[col].toString().trim();

            switch (h) {
                case "Timestamp":
                    newRow[col] = rowTimestamp;
                    break;
                case "Car ID":
                    newRow[col] = data.carId || "";
                    break;
                case "Car Name":
                    newRow[col] = data.carName || "";
                    break;
                case "Model":
                    newRow[col] = data.model || "";
                    break;
                case "Year":
                    newRow[col] = data.year || "";
                    break;
                case "Mileage":
                    newRow[col] = data.mileage || "";
                    break;
                case "Price":
                    newRow[col] =
                        data.price !== undefined && data.price !== null
                            ? data.price
                            : "";
                    break;
                case "Discount":
                    newRow[col] =
                        data.discount !== undefined && data.discount !== null
                            ? data.discount
                            : "";
                    break;
                case "VIN":
                    newRow[col] = data.vin || "";
                    break;
                case "Status":
                    newRow[col] = data.status || "";
                    break;
                case "Title":
                    newRow[col] = data.title || "";
                    break;
                case "Trim":
                    newRow[col] = data.trim || "";
                    break;
                case "Body Style":
                    newRow[col] = data.bodyStyle || "";
                    break;
                case "Rent or Sell":
                    newRow[col] = data.rentOrSell || "Sell";
                    break;
                case "Engine":
                    newRow[col] = data.engine || "";
                    break;
                case "Engine Type/Size":
                    newRow[col] = data.engineTypeSize || data.engineType || "";
                    break;
                case "Transmission":
                    newRow[col] = data.transmission || "";
                    break;
                case "Driveline":
                    newRow[col] = data.driveline || "";
                    break;
                case "Fuel Type":
                    newRow[col] = data.fuelType || "";
                    break;
                case "Power Options":
                    newRow[col] = data.powerOptions || data.power || "";
                    break;
                case "Drive Condition":
                    newRow[col] = data.driveCondition || "";
                    break;
                case "Condition":
                    newRow[col] = data.condition || "";
                    break;
                case "Seat Material":
                    newRow[col] = data.seatMaterial || "";
                    break;
                case "Interior Color":
                    newRow[col] = data.interiorColor || "";
                    break;
                case "Exterior Color":
                    newRow[col] = data.exteriorColor || "";
                    break;
                case "Interior Features":
                    newRow[col] =
                        data.interiorFeatures || data.interiorFeaturesStr || "";
                    break;
                case "Main Image URLs":
                    newRow[col] = mainImageUrl;
                    break;
                case "Sub Image URLs":
                    newRow[col] = subImagesJoined;
                    break;
                case "NOTES":
                    newRow[col] = data.notes || "";
                    break;
                case "CLIENT NAME":
                    newRow[col] = data.clientName || "";
                    break;
                case "Client Phone":
                    newRow[col] = data.clientPhone || "";
                    break;
                case "Client Email":
                    newRow[col] = data.clientEmail || "";
                    break;
                case "PURCHASE DATE":
                    newRow[col] = data.purchaseDate || "";
                    break;
                case "Trade status":
                    newRow[col] = data.tradeStatus || "";
                    break;
                default:
                    if (data[h] !== undefined) {
                        newRow[col] = data[h];
                    }
                    break;
            }
        }

        // 6. Save or Update row in "Vehicle details"
        var isEdit =
            data.editMode === true ||
            data.action === "edit" ||
            data.action === "update";
        var targetRowIndex = -1;
        var carIdToFind = (data.originalCarId || data.carId || "")
            .toString()
            .trim()
            .toLowerCase();

        if (isEdit && carIdToFind) {
            var carIdColIdx = -1;
            for (var c = 0; c < headers.length; c++) {
                if (headers[c].toString().trim().toLowerCase() === "car id") {
                    carIdColIdx = c + 1;
                    break;
                }
            }

            if (carIdColIdx !== -1) {
                var totalRows = sheet.getLastRow();
                if (totalRows > 1) {
                    var idValues = sheet
                        .getRange(2, carIdColIdx, totalRows - 1, 1)
                        .getValues();
                    for (var r = 0; r < idValues.length; r++) {
                        if (
                            idValues[r][0] &&
                            idValues[r][0].toString().trim().toLowerCase() ===
                                carIdToFind
                        ) {
                            targetRowIndex = r + 2; // +2 for 1-based index and header row offset
                            break;
                        }
                    }
                }
            }
        }

        var updatedRowNumber;
        if (targetRowIndex > 0) {
            // Update existing row preserving timestamp if not provided
            sheet
                .getRange(targetRowIndex, 1, 1, newRow.length)
                .setValues([newRow]);
            updatedRowNumber = targetRowIndex;
        } else {
            // Append as new row
            sheet.appendRow(newRow);
            updatedRowNumber = sheet.getLastRow();
        }

        // 7. Return JSON response
        return ContentService.createTextOutput(
            JSON.stringify({
                status: "success",
                message:
                    "Vehicle " +
                    (data.carId || "") +
                    (targetRowIndex > 0
                        ? " updated successfully in row "
                        : " saved successfully to row ") +
                    updatedRowNumber,
                isUpdated: targetRowIndex > 0,
                rowNumber: updatedRowNumber,
                carId: data.carId,
                mainImageUrl: mainImageUrl,
                subImageUrls: subImagesJoined,
            }),
        ).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService.createTextOutput(
            JSON.stringify({
                status: "error",
                message: err.toString(),
            }),
        ).setMimeType(ContentService.MimeType.JSON);
    }
}
