<?php

namespace App\Http\Controllers;

use App\Mail\ContactFormAdminMail;
use App\Mail\ContactFormUserMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Handle incoming contact form submission.
     */
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'subject' => ['required', 'string', 'max:100'],
            'message' => ['required', 'string', 'max:5000'],
            'car_id' => ['nullable', 'string', 'max:100'],
            'car_title' => ['nullable', 'string', 'max:255'],
        ]);

        $adminEmail = config('mail.from.address') ?: env('MAIL_FROM_ADDRESS', 'contact@wrightfindermotors.com');

        try {
            // 1. Send notification email to Administrator
            Mail::to($adminEmail)->send(new ContactFormAdminMail($validated));

            // 2. Send acknowledgment/confirmation email to the User
            Mail::to($validated['email'])->send(new ContactFormUserMail($validated));

            return response()->json([
                'success' => true,
                'message' => 'Your message has been received! We have also sent a confirmation to your email.',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Failed to send contact emails: ' . $e->getMessage(), [
                'exception' => $e,
                'data' => $validated,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unable to send message right now. Please try again or reach out to us directly by phone or email.',
            ], 500);
        }
    }
}
