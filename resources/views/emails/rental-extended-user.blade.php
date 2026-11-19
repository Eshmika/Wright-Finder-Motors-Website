<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Rental Has Been Extended – WFM</title>
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
                padding: 28px 20px 24px 20px !important;
            }

            .hero-title {
                font-size: 22px !important;
            }

            .details-padding {
                padding: 18px 16px !important;
            }

            .action-button {
                display: block !important;
                width: 100% !important;
                text-align: center !important;
                box-sizing: border-box !important;
            }
        }
    </style>
</head>

<body style="margin: 0; padding: 0; background-color: #0b041c;">
    @php
    $firstName = trim($data['firstName'] ?? '');
    $lastName = trim($data['lastName'] ?? '');
    $fullName = trim("{$firstName} {$lastName}");

    $carYear = $data['carYear'] ?? ($data['year'] ?? '');
    $carMake = $data['carMake'] ?? ($data['make'] ?? '');
    $carModel = $data['carModel'] ?? ($data['model'] ?? '');
    $carTitle = $data['carTitle'] ?? '';

    $vehicleParts = array_filter([$carYear, $carMake, $carModel]);
    $vehicleDisplay = !empty($vehicleParts) ? implode(', ', $vehicleParts) : ($carTitle ?: 'Vehicle');

    $confirmationNumber = $data['confirmationNumber'] ?? 'N/A';

    $previousReturnDateTime = $data['previousReturnDateTime'] ?? ($data['previousReturnDate'] ?? 'N/A');
    $newReturnDateTime = $data['newReturnDateTime'] ?? ($data['newReturnDate'] ?? 'N/A');

    $additionalDays = $data['additionalDays'] ?? ($data['extendDays'] ?? '0');

    $rawExtensionCharge = $data['extensionCharge'] ?? 0;
    $extensionChargeDisplay = is_numeric($rawExtensionCharge)
    ? '$' . number_format((float)$rawExtensionCharge, 2)
    : (string)$rawExtensionCharge;

    $rawUpdatedTotal = $data['updatedRentalTotal'] ?? ($data['estimatedTotal'] ?? 0);
    $updatedRentalTotalDisplay = is_numeric($rawUpdatedTotal)
    ? '$' . number_format((float)$rawUpdatedTotal, 2)
    : (string)$rawUpdatedTotal;

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
                        <td class="header-padding" style="background: linear-gradient(135deg, #170a3d 0%, #20134e 50%, #2e1047 100%); padding: 36px 32px 30px 32px; text-align: center; border-bottom: 4px solid #16a34a;">
                            <div style="display: inline-block; padding: 5px 14px; background-color: rgba(22, 163, 74, 0.2); border: 1px solid rgba(22, 163, 74, 0.5); border-radius: 9999px; margin-bottom: 12px;">
                                <span style="color: #4ade80; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                                    ✓ Rental Extension Confirmed
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
                            <p style="font-size: 15px; color: #16a34a; line-height: 1.6; margin: 0 0 20px 0; font-weight: 700;">
                                Your rental extension has been confirmed.
                            </p>

                            <!-- Updated Rental Details Card -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
                                <tr>
                                    <td class="details-padding" style="padding: 20px 22px; border-bottom: 2px solid #16a34a; background: #ffffff;">
                                        <h3 style="font-size: 14px; font-weight: 800; color: #170a3d; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px 0;">
                                            Updated Rental Details
                                        </h3>

                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #334155; line-height: 1.8;">
                                            <tr>
                                                <td style="padding: 4px 0; vertical-align: top; width: 22px; color: #16a34a; font-weight: bold;">•</td>
                                                <td style="padding: 4px 0; font-weight: 600; width: 170px; color: #475569;">Reservation ID:</td>
                                                <td style="padding: 4px 0; font-family: monospace; font-weight: 800; color: #170a3d;">{{ $confirmationNumber }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0; vertical-align: top; color: #16a34a; font-weight: bold;">•</td>
                                                <td style="padding: 4px 0; font-weight: 600; color: #475569;">Vehicle:</td>
                                                <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">{{ $vehicleDisplay }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0; vertical-align: top; color: #16a34a; font-weight: bold;">•</td>
                                                <td style="padding: 4px 0; font-weight: 600; color: #475569;">Previous Return Date:</td>
                                                <td style="padding: 4px 0; font-weight: 700; color: #64748b;">{{ $previousReturnDateTime }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0; vertical-align: top; color: #16a34a; font-weight: bold;">•</td>
                                                <td style="padding: 4px 0; font-weight: 600; color: #475569;">New Return Date:</td>
                                                <td style="padding: 4px 0; font-weight: 800; color: #16a34a;">{{ $newReturnDateTime }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0; vertical-align: top; color: #16a34a; font-weight: bold;">•</td>
                                                <td style="padding: 4px 0; font-weight: 600; color: #475569;">Additional Days:</td>
                                                <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">+{{ $additionalDays }} Day(s)</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0; vertical-align: top; color: #16a34a; font-weight: bold;">•</td>
                                                <td style="padding: 4px 0; font-weight: 600; color: #475569;">Extension Charge:</td>
                                                <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">{{ $extensionChargeDisplay }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0; vertical-align: top; color: #16a34a; font-weight: bold;">•</td>
                                                <td style="padding: 4px 0; font-weight: 600; color: #475569;">Updated Rental Total:</td>
                                                <td style="padding: 4px 0; font-weight: 800; color: #170a3d; font-size: 15px;">{{ $updatedRentalTotalDisplay }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Return Advisory Notice -->
                            <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; border-radius: 8px; margin: 0 0 24px 0;">
                                <p style="margin: 0; font-size: 13.5px; color: #14532d; font-weight: 600; line-height: 1.5;">
                                    Please make sure to return the vehicle by the new return date and time.
                                </p>
                            </div>

                            <!-- Cancellation Link Section -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px 22px;">
                                        <p style="font-size: 14px; font-weight: 700; color: #9f1239; margin: 0 0 10px 0;">
                                            Need to cancel your reservation?
                                        </p>
                                        <p style="font-size: 12.5px; color: #881337; margin: 0 0 14px 0; line-height: 1.5;">
                                            If your travel plans have changed, you can cancel your reservation online using the link below:
                                        </p>
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="border-radius: 8px; background-color: #e11d48;">
                                                    <a href="{{ $cancellationUrl }}" class="action-button" target="_blank" style="display: inline-block; padding: 11px 22px; font-size: 13px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px; background-color: #e11d48; border: 1px solid #be123c;">
                                                        Cancel My Reservation &rarr;
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Cancellation Policy -->
                            <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
                                Please review our cancellation policy:<br>
                                <a href="{{ $policyUrl }}" target="_blank" style="color: #fd2a29; font-weight: 700; text-decoration: underline;">
                                    WFM Rental Cancellation Policy &rarr;
                                </a>
                            </p>

                            <!-- Closing / Sign-off -->
                            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13.5px; color: #475569; line-height: 1.6;">
                                <p style="margin: 0 0 14px 0; font-weight: 700; color: #170a3d;">
                                    Thank you for choosing WFM!
                                </p>
                                <p style="margin: 0; color: #334155;">
                                    <strong>WFM Team</strong><br>
                                    Wright Finder Motors<br>
                                    <a href="{{ $websiteUrl }}" target="_blank" style="color: #fd2a29; text-decoration: none; font-weight: 600;">
                                        wrightfindermotors.com
                                    </a>
                                </p>
                            </div>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0e0524; padding: 22px 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                            <p style="color: #94a3b8; font-size: 11px; margin: 0 0 6px 0; line-height: 1.5;">
                                &copy; {{ date('Y') }} Wright Finder Motors. All rights reserved.
                            </p>
                            <p style="color: #64748b; font-size: 11px; margin: 0; line-height: 1.5;">
                                Dayton, Ohio &bull; Contact: <a href="mailto:contact@wrightfindermotors.com" style="color: #cbd5e1; text-decoration: underline;">contact@wrightfindermotors.com</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>