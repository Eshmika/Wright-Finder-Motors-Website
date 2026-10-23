<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Rental Reservation Confirmation - Wright Finder Motors</title>
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
            background-color: #0d071d;
            font-family: 'Poppins', 'Segoe UI', Helvetica, Arial, sans-serif;
            color: #334155;
        }
    </style>
</head>

<body style="margin: 0; padding: 24px 0; background-color: #0d071d;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.35);">

                    <!-- Header with Brand Accent -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #170a3d 0%, #232754 50%, #3a1f62 100%); padding: 40px 32px 32px 32px; text-align: center; border-bottom: 4px solid #fd2a29;">
                            <div style="display: inline-block; padding: 6px 16px; background-color: rgba(253, 42, 41, 0.18); border: 1px solid rgba(253, 42, 41, 0.4); border-radius: 9999px; margin-bottom: 14px;">
                                <span style="color: #fd2a29; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                                    Booking Receipt &amp; Confirmation
                                </span>
                            </div>
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.5px;">
                                Wright Finder <span style="color: #fd2a29;">Motors</span>
                            </h1>
                            <p style="color: #cbd5e1; font-size: 14px; margin: 0; max-width: 480px; margin: 0 auto; line-height: 1.5;">
                                Your vehicle reservation has been successfully received and priority locked.
                            </p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px 32px 24px 32px; background-color: #ffffff;">

                            <!-- Greeting -->
                            <h2 style="font-size: 20px; color: #170a3d; margin: 0 0 12px 0; font-weight: 700;">
                                Hello {{ $data['firstName'] ?? 'Valued Customer' }},
                            </h2>
                            <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 24px 0;">
                                Thank you for booking your rental with <strong>Wright Finder Motors</strong>! Below is your official reservation receipt and confirmation details.
                            </p>

                            <!-- Confirmation Box -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 14px; margin-bottom: 24px; text-align: center;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <span style="font-size: 11px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">
                                            Confirmation Number
                                        </span>
                                        <div style="font-size: 24px; font-weight: 900; font-family: monospace; color: #fd2a29; letter-spacing: 1.5px; margin-bottom: 6px;">
                                            {{ $data['confirmationNumber'] ?? 'N/A' }}
                                        </div>
                                        <span style="display: inline-block; padding: 4px 12px; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 9999px; font-size: 11px; font-weight: 800; color: #92400e; text-transform: uppercase;">
                                            {{ $data['paymentStatus'] ?? 'No payment received (Pending Reservation)' }}
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Vehicle Highlight Card -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #fff5f5 0%, #fff1f2 100%); border: 1.5px solid #fecdd3; border-radius: 14px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 18px 20px;">
                                        <span style="font-size: 10px; font-weight: 800; color: #fd2a29; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">
                                            Reserved Vehicle
                                        </span>
                                        <h3 style="margin: 0; color: #170a3d; font-size: 18px; font-weight: 800;">
                                            {{ $data['carTitle'] ?? 'Vehicle' }}
                                        </h3>
                                        @if(!empty($data['carId']))
                                        <span style="display: inline-block; margin-top: 6px; padding: 2px 8px; background-color: #ffffff; border: 1px solid #fca5a5; border-radius: 6px; font-size: 11px; font-weight: 700; color: #991b1b; font-family: monospace;">
                                            Stock Reference: #{{ $data['carId'] }}
                                        </span>
                                        @endif
                                    </td>
                                </tr>
                            </table>

                            <!-- Itinerary & Rental Details -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h4 style="margin: 0 0 14px 0; color: #170a3d; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">
                                            Reservation Itinerary (EST)
                                        </h4>
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 35%; font-weight: 600;">Pickup Location:</td>
                                                <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 700;">{{ $data['pickupLocation'] ?? 'N/A' }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Pickup Date &amp; Time:</td>
                                                <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 700;">
                                                    {{ $data['pickupDate'] ?? '' }} at {{ $data['pickupTime'] ?? '' }} (EST)
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Return Location:</td>
                                                <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 700;">{{ $data['returnLocation'] ?? 'N/A' }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Return Date &amp; Time:</td>
                                                <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 700;">
                                                    {{ $data['returnDate'] ?? '' }} at {{ $data['returnTime'] ?? '' }} (EST)
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Payment Option:</td>
                                                <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 700;">
                                                    {{ $data['paymentOption'] ?? 'N/A' }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Estimated Rate:</td>
                                                <td style="padding: 6px 0; font-size: 14px; color: #16a34a; font-weight: 800;">
                                                    ${{ isset($data['totalEstimate']) ? number_format((float)$data['totalEstimate'], 2) : number_format((float)($data['rentalRate'] ?? 0), 2) }}
                                                    @if(!empty($data['discount']) && (float)$data['discount'] > 0)
                                                    <span style="font-size: 11px; color: #059669; font-weight: 600;">(Total Savings: ${{ number_format((float)$data['discount'], 2) }})</span>
                                                    @endif
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Payment & Pickup Instructions -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; border-left: 4px solid #fd2a29; border-radius: 8px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <h4 style="margin: 0 0 6px 0; color: #170a3d; font-size: 13px; font-weight: 700;">
                                            Payment &amp; Pickup Instructions
                                        </h4>
                                        <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.6;">
                                            &bull; <strong>For Zelle:</strong> Please transfer your payment to our email: <span style="font-family: monospace; font-weight: 700; color: #170a3d;">contact@wrightfindermotors.com</span><br>
                                            &bull; <strong>For Cash App:</strong> Please transfer your payment to recipient phone: <span style="font-family: monospace; font-weight: 700; color: #170a3d;">(937) 475-4737</span><br>
                                            &bull; <strong>At Pickup:</strong> Please bring your valid Driver's License and debit/credit card for the refundable hold.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Support Box -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #232754 0%, #170a3d 100%); border-radius: 14px; margin-bottom: 24px; color: #ffffff;">
                                <tr>
                                    <td style="padding: 22px 24px;">
                                        <h4 style="margin: 0 0 6px 0; color: #ffffff; font-size: 15px; font-weight: 700;">
                                            Have Questions About Your Reservation?
                                        </h4>
                                        <p style="margin: 0 0 14px 0; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
                                            Our reservation coordinators are available 24/7 to assist with pickup scheduling, extensions, or questions.
                                        </p>
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-right: 12px;">
                                                    <a href="tel:+19374754737" style="display: inline-block; background-color: #fd2a29; color: #ffffff; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 9999px; text-decoration: none;">
                                                        📞 Call +1 937-475-4737
                                                    </a>
                                                </td>
                                                <td>
                                                    <a href="mailto:contact@wrightfindermotors.com" style="display: inline-block; background-color: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); color: #ffffff; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: 9999px; text-decoration: none;">
                                                        ✉️ Email Us
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0;">
                                Warm regards,<br>
                                <strong style="color: #170a3d;">The Wright Finder Motors Team</strong><br>
                                Dayton, OH
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #170a3d; padding: 24px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08);">
                            <p style="margin: 0 0 6px 0; color: #e2e8f0; font-size: 12px; font-weight: 600;">
                                &copy; {{ date('Y') }} Wright Finder Motors. All rights reserved.
                            </p>
                            <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                                Dayton, OH, United States &bull; Contact: +1 937-475-4737
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>