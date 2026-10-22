<?php

namespace App\Http\Controllers;

use App\Mail\ReservationAdminMail;
use App\Mail\ReservationUserMail;
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
            'phone' => 'nullable|string|max:30',
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
        $scriptUrl = config('services.google.apps_script_url') ?: env('GOOGLE_APPS_SCRIPT_URL') ?: $request->input('scriptUrl');

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

        // Send notification email to Admin and customer using branded templates
        try {
            $adminEmail = config('mail.from.address') ?: env('MAIL_FROM_ADDRESS', 'contact@wrightfindermotors.com');

            // 1. Send branded HTML reservation alert to Administrator
            Mail::to($adminEmail)->send(new ReservationAdminMail($data));

            // 2. Send branded HTML confirmation receipt to Customer
            Mail::to($data['email'])->send(new ReservationUserMail($data));
        } catch (\Throwable $mErr) {
            Log::info('Reservation notification email error: ' . $mErr->getMessage());
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
