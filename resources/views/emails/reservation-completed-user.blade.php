<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Renting with WFM!</title>
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
            }
        }
    </style>
</head>

<body style="margin: 0; padding: 20px 0; background-color: #0b041c;">
    @php
    $firstName = $data['firstName'] ?? '';
    $lastName = $data['lastName'] ?? '';
    $fullName = trim("{$firstName} {$lastName}");

    $carYear = $data['carYear'] ?? '';
    $carMake = $data['carMake'] ?? '';
    $carModel = $data['carModel'] ?? '';
    $carTitle = $data['carTitle'] ?? '';

    // Build [Year], [Car Name], [Model]
    $vehicleParts = array_filter([$carYear, $carMake, $carModel]);
    $vehicleDisplay = !empty($vehicleParts) ? implode(', ', $vehicleParts) : ($carTitle ?: 'Vehicle');

    $confirmationNumber = $data['confirmationNumber'] ?? 'N/A';

    // Actual Return Date & Time in EST
    $actualReturnDateTime = $data['actualReturnDateTime'] ?? (date('Y-m-d h:i A') . ' EST');

    $rawTotal = $data['estimatedTotal'] ?? ($data['totalEstimate'] ?? ($data['rentalRate'] ?? 0));
    $estimatedTotal = is_numeric($rawTotal) ? '$' . number_format((float)$rawTotal, 2) : (string)$rawTotal;

    $paymentStatus = $data['paymentStatus'] ?? 'Paid';

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
                                    ✓ Rental Completed
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
                            <p style="font-size: 14px; color: #475569; line-height: 1.65; margin: 0 0 20px 0;">
                                Your rental has been successfully completed. Thank you for choosing Wright Finder Motors!
                            </p>

                            <!-- Rental Summary Card -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
                                <tr>
                                    <td class="details-padding" style="padding: 20px 22px; border-bottom: 2px solid #16a34a; background: #ffffff;">
                                        <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #170a3d; text-transform: uppercase; letter-spacing: 0.8px;">
                                            Rental Summary
                                        </h3>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="details-padding" style="padding: 16px 22px;">
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td class="detail-label" style="padding: 8px 0; font-size: 13px; color: #64748b; width: 42%; vertical-align: top; font-weight: 600;">
                                                    &bull; Reservation ID:
                                                </td>
                                                <td class="detail-value" style="padding: 8px 0; font-size: 14px; color: #170a3d; font-weight: 800; font-family: monospace;">
                                                    {{ $confirmationNumber }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="detail-label" style="padding: 8px 0; font-size: 13px; color: #64748b; vertical-align: top; font-weight: 600;">
                                                    &bull; Vehicle:
                                                </td>
                                                <td class="detail-value" style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 700;">
                                                    {{ $vehicleDisplay }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="detail-label" style="padding: 8px 0; font-size: 13px; color: #64748b; vertical-align: top; font-weight: 600;">
                                                    &bull; Actual Return Date:
                                                </td>
                                                <td class="detail-value" style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 700;">
                                                    {{ $actualReturnDateTime }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="detail-label" style="padding: 8px 0; font-size: 13px; color: #64748b; vertical-align: top; font-weight: 600;">
                                                    &bull; Final Rental Total:
                                                </td>
                                                <td class="detail-value" style="padding: 8px 0; font-size: 15px; color: #16a34a; font-weight: 800;">
                                                    {{ $estimatedTotal }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="detail-label" style="padding: 8px 0; font-size: 13px; color: #64748b; vertical-align: top; font-weight: 600;">
                                                    &bull; Payment Status:
                                                </td>
                                                <td class="detail-value" style="padding: 8px 0; font-size: 13px;">
                                                    <span style="display: inline-block; padding: 3px 10px; background-color: #dcfce7; border: 1px solid #86efac; border-radius: 9999px; font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">
                                                        {{ $paymentStatus }}
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Notice Callout -->
                            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1.5px solid #cbd5e1; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
                                <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155; line-height: 1.55; font-weight: 600;">
                                    Your rental is complete, so cancellation is no longer available.
                                </p>
                                <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                                    For reference, you can review our policy here:<br>
                                    <a href="{{ $policyUrl }}" style="color: #fd2a29; font-weight: 700; text-decoration: underline;">
                                        WFM Rental Cancellation Policy
                                    </a>
                                </p>
                            </div>

                            <p style="font-size: 14px; color: #170a3d; font-weight: 600; line-height: 1.6; margin: 0 0 16px 0;">
                                We appreciate your business and hope to serve you again!
                            </p>

                            <!-- Signoff -->
                            <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 4px 0;">
                                Thank you,<br>
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