<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ReservationController extends Controller
{
    /**
     * Store reservation and forward to Google Sheet "Reservation" tab via Apps Script.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'confirmationNumber' => 'required|string',
            'carId' => 'required|string',
            'carTitle' => 'required|string',
            'carMake' => 'nullable|string',
            'carModel' => 'nullable|string',
            'carYear' => 'nullable|string',
            'rentalRate' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
            'totalEstimate' => 'nullable|numeric',
            'firstName' => 'required|string|max:100',
            'lastName' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:30',
            'age' => 'required|string|max:20',
            'residency' => 'required|string|max:150',
            'pickupLocation' => 'required|string|max:255',
            'pickupDate' => 'required|string|max:50',
            'pickupTime' => 'required|string|max:50',
            'returnLocation' => 'required|string|max:255',
            'returnDate' => 'required|string|max:50',
            'returnTime' => 'required|string|max:50',
            'paymentOption' => 'required|string|max:100',
            'paymentStatus' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
            'scriptUrl' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed: ' . implode(', ', $validator->errors()->all()),
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->all();
        $data['action'] = 'reserve';
        $data['paymentStatus'] = 'No payment received (Pending Reservation)';
        $data['timestamp'] = date('Y-m-d H:i:s') . ' EST';

        // Check Webhook / Google Apps Script endpoint URL
        $scriptUrl = $request->input('scriptUrl') ?: env('GOOGLE_APPS_SCRIPT_URL');

        $googleSheetSaved = false;
        $googleSheetMessage = '';

        if ($scriptUrl) {
            try {
                $response = Http::withoutVerifying()
                    ->timeout(25)
                    ->withOptions(['allow_redirects' => true])
                    ->post($scriptUrl, $data);

                if ($response->successful()) {
                    $googleSheetSaved = true;
                    $googleSheetMessage = 'Saved to Google Sheet successfully.';
                } else {
                    $googleSheetMessage = 'Google Apps Script HTTP ' . $response->status();
                }
            } catch (\Exception $e) {
                Log::warning('Could not sync reservation to Google Apps Script: ' . $e->getMessage());
                $googleSheetMessage = $e->getMessage();
            }
        } else {
            $googleSheetMessage = 'Webhook URL not configured in .env or request, reservation logged locally.';
        }

        // Try to send notification email to Admin and customer if mailer is configured
        try {
            $adminEmail = config('mail.from.address') ?: env('MAIL_FROM_ADDRESS', 'contact@wrightfindermotors.com');
            $fullName = trim($data['firstName'] . ' ' . $data['lastName']);
            $confirmation = $data['confirmationNumber'];
            $carTitle = $data['carTitle'];

            // Basic alert to admin
            Mail::raw(
                "New Vehicle Reservation Received!\n\n" .
                    "Confirmation #: {$confirmation}\n" .
                    "Status: No payment received (Pending Reservation)\n" .
                    "Vehicle: {$carTitle} (#{$data['carId']})\n" .
                    "Customer: {$fullName}\n" .
                    "Email: {$data['email']}\n" .
                    "Phone: {$data['phone']}\n" .
                    "Age: {$data['age']}\n" .
                    "Residency: {$data['residency']}\n\n" .
                    "Pickup: {$data['pickupLocation']} on {$data['pickupDate']} at {$data['pickupTime']} (EST)\n" .
                    "Return: {$data['returnLocation']} on {$data['returnDate']} at {$data['returnTime']} (EST)\n" .
                    "Payment Method: {$data['paymentOption']}\n" .
                    "Rental Rate: \${$data['rentalRate']}\n" .
                    "Discount/Savings: \${$data['discount']}\n",
                function ($message) use ($adminEmail, $confirmation, $carTitle) {
                    $message->to($adminEmail)
                        ->subject("🚗 New Rental Reservation: {$confirmation} - {$carTitle}");
                }
            );

            // Confirmation to customer
            Mail::raw(
                "Hello {$data['firstName']},\n\n" .
                    "Thank you for reserving a vehicle with Wright Finder Motors!\n\n" .
                    "YOUR CONFIRMATION NUMBER: {$confirmation}\n" .
                    "STATUS: Pending Reservation - No payment received yet\n" .
                    "VEHICLE: {$carTitle}\n\n" .
                    "PICKUP DETAILS (EST):\n" .
                    "- Location: {$data['pickupLocation']}\n" .
                    "- Date & Time: {$data['pickupDate']} at {$data['pickupTime']}\n\n" .
                    "RETURN DETAILS (EST):\n" .
                    "- Location: {$data['returnLocation']}\n" .
                    "- Date & Time: {$data['returnDate']} at {$data['returnTime']}\n\n" .
                    "PAYMENT OPTION CHOSEN: {$data['paymentOption']}\n" .
                    "(For Zelle / Cash App: please use our official payment email: contact@wrightfindermotors.com)\n\n" .
                    "Our team will contact you shortly to confirm your booking and complete any remaining verification.\n\n" .
                    "Best regards,\nWright Finder Motors Team\ncontact@wrightfindermotors.com",
                function ($message) use ($data, $confirmation) {
                    $message->to($data['email'])
                        ->subject("Your Wright Finder Motors Reservation Confirmation [{$confirmation}]");
                }
            );
        } catch (\Throwable $mErr) {
            Log::info('Reservation notification email skipped/failed: ' . $mErr->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'confirmationNumber' => $data['confirmationNumber'],
            'paymentStatus' => 'No payment received (Pending Reservation)',
            'googleSheetSaved' => $googleSheetSaved,
            'message' => 'Reservation successfully placed!',
            'details' => $googleSheetMessage,
        ]);
    }
}
