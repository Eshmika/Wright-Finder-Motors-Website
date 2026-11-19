<?php

namespace App\Http\Controllers;

use App\Mail\AlternativeOfferAdminMail;
use App\Mail\AlternativeOfferUserMail;
use App\Mail\ReservationAdminMail;
use App\Mail\ReservationApprovedAdminMail;
use App\Mail\ReservationApprovedUserMail;
use App\Mail\ReservationCancelledAdminMail;
use App\Mail\ReservationCancelledUserMail;
use App\Mail\ReservationCompletedAdminMail;
use App\Mail\ReservationCompletedUserMail;
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
            'couponCode' => 'nullable|string|max:50',
            'couponDiscount' => 'nullable|numeric',
            'totalEstimate' => 'nullable|numeric',
            'estimatedTotal' => 'nullable|numeric',
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
        if (!isset($data['estimatedTotal']) && isset($data['totalEstimate'])) {
            $data['estimatedTotal'] = $data['totalEstimate'];
        }
        $data['paymentStatus'] = 'Pending';
        $data['reservationStatus'] = 'Pending';
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
            'paymentStatus' => 'Pending',
            'reservationStatus' => 'Pending',
            'googleSheetSaved' => $googleSheetSaved,
            'message' => 'Reservation successfully placed!',
            'details' => $googleSheetMessage,
        ]);
    }

    /**
     * Cancel a reservation by confirmation number (e.g. from user cancellation email link).
     */
    public function cancel(Request $request, string $confirmationNumber)
    {
        $confirmationNumber = trim($confirmationNumber);
        $scriptUrl = config('services.google.apps_script_url') ?: env('GOOGLE_APPS_SCRIPT_URL');
        $status = 'Cancelled';
        $syncSuccess = false;

        if ($scriptUrl && !empty($confirmationNumber)) {
            try {
                $response = Http::withoutVerifying()
                    ->timeout(25)
                    ->withOptions(['allow_redirects' => true])
                    ->post($scriptUrl, [
                        'action' => 'update_reservation_status',
                        'confirmationNumber' => $confirmationNumber,
                        'reservationStatus' => 'Cancelled',
                        'notes' => '[Cancelled by Customer via Email Link at ' . date('Y-m-d H:i:s') . ' EST]',
                    ]);

                if ($response->successful()) {
                    $syncSuccess = true;
                }
            } catch (\Exception $e) {
                Log::warning('Could not sync customer cancellation to Google Apps Script: ' . $e->getMessage());
            }
        }

        return \Inertia\Inertia::render('Rent/ReservationCancelled', [
            'confirmationNumber' => $confirmationNumber,
            'syncSuccess' => $syncSuccess,
        ]);
    }

    /**
     * Send approval notification email to Customer and Admin.
     */
    public function sendApprovalEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'confirmationNumber' => 'required|string',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed: ' . implode(', ', $validator->errors()->all()),
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->all();
        $adminEmail = config('mail.from.address') ?: env('MAIL_FROM_ADDRESS', 'contact@wrightfindermotors.com');

        $userEmailSent = false;
        $adminEmailSent = false;
        $errorMessage = null;

        try {
            // 1. Send branded HTML Approval notification to Customer
            Mail::to($data['email'])->send(new ReservationApprovedUserMail($data));
            $userEmailSent = true;
        } catch (\Throwable $e) {
            Log::warning('Reservation approval customer email error: ' . $e->getMessage());
            $errorMessage = $e->getMessage();
        }

        try {
            // 2. Send branded HTML Approval notification to Admin
            Mail::to($adminEmail)->send(new ReservationApprovedAdminMail($data));
            $adminEmailSent = true;
        } catch (\Throwable $e) {
            Log::warning('Reservation approval admin email error: ' . $e->getMessage());
            if (!$errorMessage) {
                $errorMessage = $e->getMessage();
            }
        }

        return response()->json([
            'status' => ($userEmailSent || $adminEmailSent) ? 'success' : 'error',
            'message' => ($userEmailSent && $adminEmailSent)
                ? 'Approval emails sent successfully to user and admin.'
                : ($errorMessage ?: 'Failed to send approval email.'),
            'userEmailSent' => $userEmailSent,
            'adminEmailSent' => $adminEmailSent,
        ]);
    }

    /**
     * Send alternative vehicle offer email to Customer and Admin.
     */
    public function sendAlternativeOfferEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'confirmationNumber' => 'required|string',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed: ' . implode(', ', $validator->errors()->all()),
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->all();
        $adminEmail = config('mail.from.address') ?: env('MAIL_FROM_ADDRESS', 'contact@wrightfindermotors.com');

        $userEmailSent = false;
        $adminEmailSent = false;
        $errorMessage = null;

        try {
            // 1. Send branded HTML Alternative Offer notification to Customer
            Mail::to($data['email'])->send(new AlternativeOfferUserMail($data));
            $userEmailSent = true;
        } catch (\Throwable $e) {
            Log::warning('Alternative offer customer email error: ' . $e->getMessage());
            $errorMessage = $e->getMessage();
        }

        try {
            // 2. Send branded HTML Alternative Offer notification to Admin
            Mail::to($adminEmail)->send(new AlternativeOfferAdminMail($data));
            $adminEmailSent = true;
        } catch (\Throwable $e) {
            Log::warning('Alternative offer admin email error: ' . $e->getMessage());
            if (!$errorMessage) {
                $errorMessage = $e->getMessage();
            }
        }

        return response()->json([
            'status' => ($userEmailSent || $adminEmailSent) ? 'success' : 'error',
            'message' => ($userEmailSent && $adminEmailSent)
                ? 'Alternative vehicle offer emails sent successfully to user and admin.'
                : ($errorMessage ?: 'Failed to send alternative offer email.'),
            'userEmailSent' => $userEmailSent,
            'adminEmailSent' => $adminEmailSent,
        ]);
    }

    /**
     * Customer accepts alternative vehicle offer via link in email.
     */
    public function acceptAlternative(Request $request, string $confirmationNumber)
    {
        $confirmationNumber = trim($confirmationNumber);
        $scriptUrl = config('services.google.apps_script_url') ?: env('GOOGLE_APPS_SCRIPT_URL');
        $syncSuccess = false;

        $carId = $request->query('carId');
        $carTitle = $request->query('carTitle');
        $total = $request->query('total');
        $rate = $request->query('rate');

        if ($scriptUrl && !empty($confirmationNumber)) {
            try {
                $updatePayload = [
                    'action' => 'update_reservation_status',
                    'confirmationNumber' => $confirmationNumber,
                    'notes' => '[Customer Accepted Alternative Vehicle via Email Link at ' . date('Y-m-d H:i:s') . ' EST]',
                ];
                if (!empty($carId)) {
                    $updatePayload['carId'] = $carId;
                }
                if (!empty($carTitle)) {
                    $updatePayload['carTitle'] = $carTitle;
                }
                if (!empty($total)) {
                    $updatePayload['estimatedTotal'] = $total;
                }
                if (!empty($rate)) {
                    $updatePayload['rentalRate'] = $rate;
                }

                $response = Http::withoutVerifying()
                    ->timeout(25)
                    ->withOptions(['allow_redirects' => true])
                    ->post($scriptUrl, $updatePayload);

                if ($response->successful()) {
                    $syncSuccess = true;
                }
            } catch (\Exception $e) {
                Log::warning('Could not sync alternative vehicle acceptance to Google Apps Script: ' . $e->getMessage());
            }
        }

        return \Inertia\Inertia::render('Rent/AlternativeAccepted', [
            'confirmationNumber' => $confirmationNumber,
            'carTitle' => $carTitle,
            'carId' => $carId,
            'newTotal' => $total,
            'syncSuccess' => $syncSuccess,
        ]);
    }

    /**
     * Send cancellation confirmation email to Customer and Admin.
     */
    public function sendCancellationEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'confirmationNumber' => 'required|string',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed: ' . implode(', ', $validator->errors()->all()),
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->all();
        if (empty($data['cancellationDate'])) {
            $data['cancellationDate'] = date('Y-m-d');
        }

        $adminEmail = config('mail.from.address') ?: env('MAIL_FROM_ADDRESS', 'contact@wrightfindermotors.com');

        $userEmailSent = false;
        $adminEmailSent = false;
        $errorMessage = null;

        try {
            // 1. Send branded HTML Cancellation notification to Customer
            Mail::to($data['email'])->send(new ReservationCancelledUserMail($data));
            $userEmailSent = true;
        } catch (\Throwable $e) {
            Log::warning('Reservation cancellation customer email error: ' . $e->getMessage());
            $errorMessage = $e->getMessage();
        }

        try {
            // 2. Send branded HTML Cancellation notification to Admin
            Mail::to($adminEmail)->send(new ReservationCancelledAdminMail($data));
            $adminEmailSent = true;
        } catch (\Throwable $e) {
            Log::warning('Reservation cancellation admin email error: ' . $e->getMessage());
            if (!$errorMessage) {
                $errorMessage = $e->getMessage();
            }
        }

        return response()->json([
            'status' => ($userEmailSent || $adminEmailSent) ? 'success' : 'error',
            'message' => ($userEmailSent && $adminEmailSent)
                ? 'Cancellation emails sent successfully to user and admin.'
                : ($errorMessage ?: 'Failed to send cancellation email.'),
            'userEmailSent' => $userEmailSent,
            'adminEmailSent' => $adminEmailSent,
        ]);
    }

    /**
     * Send rental completed (return processed) email to Customer and Admin.
     */
    public function sendCompletedEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'confirmationNumber' => 'required|string',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed: ' . implode(', ', $validator->errors()->all()),
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->all();
        if (empty($data['actualReturnDateTime'])) {
            $data['actualReturnDateTime'] = date('Y-m-d h:i A') . ' EST';
        }

        $adminEmail = config('mail.from.address') ?: env('MAIL_FROM_ADDRESS', 'contact@wrightfindermotors.com');

        $userEmailSent = false;
        $adminEmailSent = false;
        $errorMessage = null;

        try {
            // 1. Send branded HTML Completed notification to Customer
            Mail::to($data['email'])->send(new ReservationCompletedUserMail($data));
            $userEmailSent = true;
        } catch (\Throwable $e) {
            Log::warning('Rental completed customer email error: ' . $e->getMessage());
            $errorMessage = $e->getMessage();
        }

        try {
            // 2. Send branded HTML Completed notification to Admin
            Mail::to($adminEmail)->send(new ReservationCompletedAdminMail($data));
            $adminEmailSent = true;
        } catch (\Throwable $e) {
            Log::warning('Rental completed admin email error: ' . $e->getMessage());
            if (!$errorMessage) {
                $errorMessage = $e->getMessage();
            }
        }

        return response()->json([
            'status' => ($userEmailSent || $adminEmailSent) ? 'success' : 'error',
            'message' => ($userEmailSent && $adminEmailSent)
                ? 'Completion emails sent successfully to user and admin.'
                : ($errorMessage ?: 'Failed to send completion email.'),
            'userEmailSent' => $userEmailSent,
            'adminEmailSent' => $adminEmailSent,
        ]);
    }
}
