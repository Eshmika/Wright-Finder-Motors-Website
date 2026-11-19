<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>An Alternative Vehicle Is Available – WFM</title>
    <style>
        body,
        table,
        td,
        p,
        a,
        li,
        blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            outline: none;
            text-decoration: none;
        }

        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            height: 100% !important;
            background-color: #0b041c;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #334155;
        }

        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                border-radius: 0 !important;
            }

            .content-padding {
                padding: 24px 18px !important;
            }

            .header-padding {
                padding: 28px 18px !important;
            }

            .details-padding {
                padding: 16px 14px !important;
            }

            .hero-title {
                font-size: 22px !important;
                line-height: 28px !important;
            }

            .detail-label {
                display: block !important;
                width: 100% !important;
                padding-bottom: 2px !important;
            }

            .detail-value {
                display: block !important;
                width: 100% !important;
                padding-bottom: 10px !important;
            }

            .action-btn {
                display: block !important;
                width: 100% !important;
                text-align: center !important;
                box-sizing: border-box !important;
                margin-bottom: 10px !important;
            }

            .btn-stack {
                display: block !important;
                width: 100% !important;
            }
        }
    </style>
</head>

<body style="margin: 0; padding: 20px 0; background-color: #0b041c;">
    @php
    $firstName = $data['firstName'] ?? '';
    $lastName = $data['lastName'] ?? '';
    $fullName = trim("{$firstName} {$lastName}");

    // Original Vehicle Details
    $originalCarYear = $data['originalCarYear'] ?? '';
    $originalCarMake = $data['originalCarMake'] ?? '';
    $originalCarModel = $data['originalCarModel'] ?? '';
    $originalCarTitle = $data['originalCarTitle'] ?? '';
    $origParts = array_filter([$originalCarYear, $originalCarMake, $originalCarModel]);
    $originalVehicleDisplay = !empty($origParts) ? implode(' ', $origParts) : ($originalCarTitle ?: 'Original Vehicle');

    $rawOriginalTotal = $data['originalEstimatedTotal'] ?? 0;
    $originalTotalDisplay = is_numeric($rawOriginalTotal) ? '$' . number_format((float)$rawOriginalTotal, 2) : (string)$rawOriginalTotal;

    // Alternative Vehicle Details
    $altCarYear = $data['alternativeCarYear'] ?? '';
    $altCarMake = $data['alternativeCarMake'] ?? '';
    $altCarModel = $data['alternativeCarModel'] ?? '';
    $altCarTitle = $data['alternativeCarTitle'] ?? '';
    $altParts = array_filter([$altCarYear, $altCarMake, $altCarModel]);
    $alternativeVehicleDisplay = !empty($altParts) ? implode(' ', $altParts) : ($altCarTitle ?: 'Alternative Vehicle');

    $alternativeStockId = $data['alternativeCarId'] ?? ($data['carId'] ?? 'N/A');

    $rawAltTotal = $data['alternativeEstimatedTotal'] ?? 0;
    $altTotalDisplay = is_numeric($rawAltTotal) ? '$' . number_format((float)$rawAltTotal, 2) : (string)$rawAltTotal;

    // Price Difference Calculation
    if (isset($data['priceDifference']) && $data['priceDifference'] !== '') {
    $priceDifferenceDisplay = (string)$data['priceDifference'];
    } else {
    $numOrig = is_numeric($rawOriginalTotal) ? (float)$rawOriginalTotal : 0;
    $numAlt = is_numeric($rawAltTotal) ? (float)$rawAltTotal : 0;
    $diff = $numAlt - $numOrig;
    if (abs($diff) < 0.01) {
        $priceDifferenceDisplay='$0.00 (Same Price)' ;
        } elseif ($diff> 0) {
        $priceDifferenceDisplay = '+$' . number_format($diff, 2) . ' (Upgrade)';
        } else {
        $priceDifferenceDisplay = '-$' . number_format(abs($diff), 2) . ' (Savings)';
        }
        }

        $confirmationNumber = $data['confirmationNumber'] ?? 'N/A';

        // Acceptance URL with target alternative car params
        $acceptQueryParams = [
        'carId' => $alternativeStockId,
        'carTitle' => $alternativeVehicleDisplay,
        'total' => $rawAltTotal,
        ];
        if (isset($data['alternativeRentalRate'])) {
        $acceptQueryParams['rate'] = $data['alternativeRentalRate'];
        }
        $acceptUrl = url("/rent/reservations/{$confirmationNumber}/accept-alternative?" . http_build_query($acceptQueryParams));
        $cancellationUrl = url("/rent/reservations/{$confirmationNumber}/cancel");
        $policyUrl = 'https://wrightfindermotors.com/privacy-policy';
        $websiteUrl = 'https://wrightfindermotors.com/';
        @endphp

        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td align="center" style="padding: 12px;">
                    <!-- Main Card Container -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45); border: 1px solid rgba(255, 255, 255, 0.08);">

                        <!-- Branded Header -->
                        <tr>
                            <td class="header-padding" style="background: linear-gradient(135deg, #170a3d 0%, #20134e 50%, #2e1047 100%); padding: 36px 32px 30px 32px; text-align: center; border-bottom: 4px solid #7c3aed;">
                                <div style="display: inline-block; padding: 5px 14px; background-color: rgba(124, 58, 237, 0.22); border: 1px solid rgba(167, 139, 250, 0.5); border-radius: 9999px; margin-bottom: 12px;">
                                    <span style="color: #c4b5fd; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                                        Alternative Vehicle Offer
                                    </span>
                                </div>
                                <h1 class="hero-title" style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.5px;">
                                    Wright Finder <span style="color: #fd2a29;">Motors</span>
                                </h1>
                                <p style="color: #cbd5e1; font-size: 13px; margin: 0; line-height: 1.5;">
                                    Reliable Vehicle Rentals &amp; Car Sales &bull; Dayton, Ohio
                                </p>
                            </td>
                        </tr>

                        <!-- Body Content -->
                        <tr>
                            <td class="content-padding" style="padding: 32px 32px 28px 32px; background-color: #ffffff;">

                                <!-- User Greeting -->
                                <h2 style="font-size: 18px; color: #170a3d; margin: 0 0 12px 0; font-weight: 700;">
                                    Hello {{ $fullName ?: 'Valued Customer' }},
                                </h2>
                                <p style="font-size: 14px; color: #475569; line-height: 1.65; margin: 0 0 24px 0;">
                                    The vehicle you selected is currently unavailable. However, we have an alternative vehicle available for your requested rental dates.
                                </p>

                                <!-- Original Vehicle Card -->
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 20px; overflow: hidden;">
                                    <tr>
                                        <td class="details-padding" style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                                            <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">
                                                Original Vehicle
                                            </h3>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="details-padding" style="padding: 14px 20px;">
                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td class="detail-label" style="padding: 6px 0; font-size: 13px; color: #64748b; width: 34%; vertical-align: top; font-weight: 600;">
                                                        &bull; Vehicle:
                                                    </td>
                                                    <td class="detail-value" style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">
                                                        {{ $originalVehicleDisplay }}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="detail-label" style="padding: 6px 0; font-size: 13px; color: #64748b; vertical-align: top; font-weight: 600;">
                                                        &bull; Price:
                                                    </td>
                                                    <td class="detail-value" style="padding: 6px 0; font-size: 14px; color: #475569; font-weight: 700;">
                                                        {{ $originalTotalDisplay }}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Alternative Vehicle Card -->
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f3ff; border: 1.5px solid #c4b5fd; border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
                                    <tr>
                                        <td class="details-padding" style="padding: 16px 20px; border-bottom: 2px solid #7c3aed; background: #ffffff;">
                                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                                <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: #5b21b6; text-transform: uppercase; letter-spacing: 0.8px;">
                                                    Alternative Vehicle
                                                </h3>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="details-padding" style="padding: 16px 20px;">
                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td class="detail-label" style="padding: 6px 0; font-size: 13px; color: #5b21b6; width: 34%; vertical-align: top; font-weight: 600;">
                                                        &bull; Vehicle:
                                                    </td>
                                                    <td class="detail-value" style="padding: 6px 0; font-size: 15px; color: #170a3d; font-weight: 800;">
                                                        {{ $alternativeVehicleDisplay }}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="detail-label" style="padding: 6px 0; font-size: 13px; color: #5b21b6; vertical-align: top; font-weight: 600;">
                                                        &bull; Stock ID:
                                                    </td>
                                                    <td class="detail-value" style="padding: 6px 0; font-size: 13px; color: #7c3aed; font-weight: 800; font-family: monospace;">
                                                        #{{ $alternativeStockId }}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="detail-label" style="padding: 6px 0; font-size: 13px; color: #5b21b6; vertical-align: top; font-weight: 600;">
                                                        &bull; New Total:
                                                    </td>
                                                    <td class="detail-value" style="padding: 6px 0; font-size: 15px; color: #16a34a; font-weight: 800;">
                                                        {{ $altTotalDisplay }}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="detail-label" style="padding: 6px 0; font-size: 13px; color: #5b21b6; vertical-align: top; font-weight: 600;">
                                                        &bull; Price Difference:
                                                    </td>
                                                    <td class="detail-value" style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 700;">
                                                        {{ $priceDifferenceDisplay }}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Options Callout / Buttons -->
                                <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1.5px solid #cbd5e1; border-radius: 14px; padding: 22px 22px; margin-bottom: 24px;">
                                    <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #170a3d;">
                                        Please choose one of the options below:
                                    </p>

                                    <div class="btn-stack" style="margin-bottom: 16px;">
                                        <!-- Option 1: Accept -->
                                        <a href="{{ $acceptUrl }}" class="action-btn" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-right: 10px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.28);">
                                            Accept Alternative Vehicle
                                        </a>

                                        <!-- Option 2: Cancel -->
                                        <a href="{{ $cancellationUrl }}" class="action-btn" style="display: inline-block; background-color: #fd2a29; color: #ffffff; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(253, 42, 41, 0.28);">
                                            Cancel My Reservation
                                        </a>
                                    </div>

                                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #475569; line-height: 1.55;">
                                        Your reservation will remain pending until you respond and our team confirms it.
                                    </p>

                                    <div style="padding-top: 10px; border-top: 1px dashed #cbd5e1;">
                                        <p style="margin: 0; font-size: 12px; color: #64748b;">
                                            Please review our cancellation policy: <a href="{{ $policyUrl }}" style="color: #fd2a29; font-weight: 700; text-decoration: underline;">WFM Rental Cancellation Policy</a>
                                        </p>
                                    </div>
                                </div>

                                <!-- Signoff -->
                                <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 4px 0;">
                                    Thank you for choosing WFM!<br>
                                    <strong style="color: #170a3d; font-size: 14px;">WFM Team</strong><br>
                                    <span style="color: #64748b;">Wright Finder Motors</span><br>
                                    <a href="{{ $websiteUrl }}" style="color: #fd2a29; text-decoration: none; font-weight: 700;">wrightfindermotors.com</a>
                                </p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #170a3d; padding: 22px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                                <p style="margin: 0 0 6px 0; color: #e2e8f0; font-size: 12px; font-weight: 600;">
                                    &copy; {{ date('Y') }} Wright Finder Motors. All rights reserved.
                                </p>
                                <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                                    Dayton, OH, United States &bull; Phone: +1 937-475-4737 &bull; <a href="{{ $websiteUrl }}" style="color: #fd2a29; text-decoration: none;">wrightfindermotors.com</a>
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
</body>

</html>