function doPost(e) {
    try {
        var rawData = e.postData ? e.postData.contents : null;
        if (!rawData) {
            return ContentService.createTextOutput(
                JSON.stringify({
                    status: "error",
                    message: "No post data received",
                }),
            ).setMimeType(ContentService.MimeType.JSON);
        }

        var data = JSON.parse(rawData);
        var action = data.action || "saveVehicle";

        // Shared Target Google Drive Folder ID
        var FOLDER_ID = "1EUPGHZPwovNhVOsIc-AEEJqUinAqEZKK";
        var folder = DriveApp.getFolderById(FOLDER_ID);

        // Function to upload base64 file to Google Drive and return viewable/direct URL
        function uploadBase64(fileObj) {
            if (!fileObj || !fileObj.base64) return "";
            var contentType = fileObj.type || "image/jpeg";
            var fileName =
                fileObj.name || "vehicle_" + new Date().getTime() + ".jpg";
            var decodedData = Utilities.base64Decode(fileObj.base64);
            var blob = Utilities.newBlob(decodedData, contentType, fileName);
            var file = folder.createFile(blob);
            file.setSharing(
                DriveApp.Access.ANYONE_WITH_LINK,
                DriveApp.Permission.VIEW,
            );
            return file.getUrl();
        }

        var mainImageUrl = "";
        if (data.mainImage && data.mainImage.base64) {
            mainImageUrl = uploadBase64(data.mainImage);
        } else if (typeof data.mainImageUrl === "string") {
            mainImageUrl = data.mainImageUrl;
        }

        var subImageUrls = [];
        if (data.subImages && Array.isArray(data.subImages)) {
            for (var i = 0; i < data.subImages.length; i++) {
                var sub = data.subImages[i];
                if (sub && sub.base64) {
                    subImageUrls.push(uploadBase64(sub));
                } else if (typeof sub === "string" && sub) {
                    subImageUrls.push(sub);
                }
            }
        } else if (typeof data.subImageUrls === "string" && data.subImageUrls) {
            subImageUrls.push(data.subImageUrls);
        }
        var subImagesJoined = subImageUrls.join(", ");

        // Target Google Spreadsheet ID
        var SPREADSHEET_ID = "16dhtw1POBIeifrAEk0ZqmH3jV8s20quo9Si3GfebifE";
        var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        var sheet = ss.getSheetByName("Vehicle details");
        if (!sheet) {
            return ContentService.createTextOutput(
                JSON.stringify({
                    status: "error",
                    message: "Sheet 'Vehicle details' not found",
                }),
            ).setMimeType(ContentService.MimeType.JSON);
        }

        // Read headers to map each field to its exact column
        var headers = sheet
            .getRange(1, 1, 1, sheet.getLastColumn())
            .getValues()[0];
        var newRow = new Array(headers.length).fill("");

        // Map values by header name
        for (var col = 0; col < headers.length; col++) {
            var h = headers[col].toString().trim();

            switch (h) {
                case "Timestamp":
                    newRow[col] =
                        data.timestamp ||
                        Utilities.formatDate(
                            new Date(),
                            Session.getScriptTimeZone(),
                            "M/d/yyyy HH:mm:ss",
                        );
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
                    newRow[col] = data.price || "";
                    break;
                case "Discount":
                    newRow[col] = data.discount || "";
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
                    newRow[col] = data.engineTypeSize || "";
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
                    newRow[col] = data.powerOptions || "";
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
                    newRow[col] = data.interiorFeatures || "";
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
                default:
                    if (data[h] !== undefined) {
                        newRow[col] = data[h];
                    }
                    break;
            }
        }

        // Append the row to the sheet
        sheet.appendRow(newRow);

        return ContentService.createTextOutput(
            JSON.stringify({
                status: "success",
                message: "Vehicle added successfully",
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

function doGet(e) {
    return ContentService.createTextOutput(
        JSON.stringify({
            status: "ok",
            message:
                "Google Apps Script Web App for Wright Finder Motors is online.",
        }),
    ).setMimeType(ContentService.MimeType.JSON);
}
