<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Customer Inquiry - Wright Finder Motors</title>
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
            background-color: #0f0a20;
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

                    <!-- Header with Brand Gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #170a3d 0%, #232754 50%, #3a1f62 100%); padding: 36px 32px; text-align: center; border-bottom: 4px solid #fd2a29;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; padding: 6px 16px; background-color: rgba(253, 42, 41, 0.18); border: 1px solid rgba(253, 42, 41, 0.4); border-radius: 9999px; margin-bottom: 12px;">
                                            <span style="color: #fd2a29; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                                                🚨 New Website Inquiry
                                            </span>
                                        </div>
                                        <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.5px;">
                                            Wright Finder <span style="color: #fd2a29;">Motors</span>
                                        </h1>
                                        <p style="color: #cbd5e1; font-size: 13px; margin: 0;">
                                            Customer Lead Notification &amp; Message Details
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px 32px 24px 32px; background-color: #ffffff;">

                            @if(!empty($data['car_title']))
                            <!-- Vehicle Highlight Card -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #fff5f5 0%, #fff1f2 100%); border: 1.5px solid #fecdd3; border-radius: 14px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 18px 20px;">
                                        <span style="font-size: 10px; font-weight: 800; color: #fd2a29; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">
                                            🚗 Target Vehicle of Interest
                                        </span>
                                        <h3 style="margin: 0; color: #170a3d; font-size: 18px; font-weight: 800;">
                                            {{ $data['car_title'] }}
                                        </h3>
                                        @if(!empty($data['car_id']))
                                        <span style="display: inline-block; margin-top: 6px; padding: 2px 8px; background-color: #ffffff; border: 1px solid #fca5a5; border-radius: 6px; font-size: 11px; font-weight: 700; color: #991b1b; font-family: monospace;">
                                            Vehicle ID / Stock: #{{ $data['car_id'] }}
                                        </span>
                                        @endif
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <!-- Lead Details Card -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h4 style="margin: 0 0 16px 0; color: #170a3d; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">
                                            Customer Information
                                        </h4>
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 35%; font-weight: 600;">Full Name:</td>
                                                <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">{{ $data['name'] }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Email:</td>
                                                <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">
                                                    <a href="mailto:{{ $data['email'] }}" style="color: #fd2a29; text-decoration: none; font-weight: 700;">
                                                        {{ $data['email'] }}
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Phone:</td>
                                                <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">
                                                    @if(!empty($data['phone']))
                                                    <a href="tel:{{ $data['phone'] }}" style="color: #232754; text-decoration: none;">
                                                        {{ $data['phone'] }}
                                                    </a>
                                                    @else
                                                    <span style="color: #94a3b8; font-style: italic;">Not provided</span>
                                                    @endif
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Inquiry Type:</td>
                                                <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 700; text-transform: capitalize;">
                                                    {{ $data['subject'] ?? 'General' }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Submitted At:</td>
                                                <td style="padding: 6px 0; font-size: 13px; color: #64748b;">
                                                    {{ now()->format('M d, Y - h:i A') }} (EST)
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Message Section -->
                            <div style="margin-bottom: 28px;">
                                <h4 style="margin: 0 0 10px 0; color: #170a3d; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">
                                    Message Content
                                </h4>
                                <div style="background-color: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 18px 20px; font-size: 14px; line-height: 1.7; color: #1e293b; white-space: pre-wrap;">{{ $data['message'] }}</div>
                            </div>

                            <!-- Fast Action CTA -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <a href="mailto:{{ $data['email'] }}?subject={{ urlencode('Re: ' . (!empty($data['car_title']) ? $data['car_title'] : 'Your Inquiry with Wright Finder Motors')) }}"
                                            style="display: inline-block; background-color: #fd2a29; color: #ffffff; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 9999px; text-decoration: none; box-shadow: 0 6px 16px rgba(253, 42, 41, 0.35);">
                                            Reply Directly to {{ $data['name'] }} &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #170a3d; padding: 24px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08);">
                            <p style="margin: 0 0 6px 0; color: #e2e8f0; font-size: 12px; font-weight: 600;">
                                Wright Finder Motors Dealership Notification System
                            </p>
                            <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                                Dayton, OH &bull; Phone: +1 937-838-8616 &bull; Email: contact@wrightfindermotors.com
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>