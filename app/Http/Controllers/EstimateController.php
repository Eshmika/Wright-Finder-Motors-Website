<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class EstimateController extends Controller
{
    /**
     * Store repair estimate request and forward to Google Sheet "Estimate" tab via Apps Script.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'estimateRequestId' => 'required|string|max:50',
            'year' => 'required|string|max:20',
            'make' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'mileage' => 'nullable|string|max:50',
            'servicesNeeded' => 'required|string|max:1000',
            'additionalDetails' => 'nullable|string|max:2000',
            'serviceLocation' => 'required|string|max:100',
            'fullName' => 'required|string|max:150',
            'email' => 'required|email|max:150',
            'phone' => 'required|string|max:50',
            'scriptUrl' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $data = [
            'action' => 'addEstimate',
            'sheet' => 'Estimate',
            'estimateRequestId' => $request->input('estimateRequestId'),
            'year' => $request->input('year'),
            'make' => $request->input('make'),
            'model' => $request->input('model'),
            'mileage' => $request->input('mileage', ''),
            'servicesNeeded' => $request->input('servicesNeeded'),
            'additionalDetails' => $request->input('additionalDetails', ''),
            'serviceLocation' => $request->input('serviceLocation'),
            'fullName' => $request->input('fullName'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'status' => $request->input('status', 'New'),
            'timestamp' => date('Y-m-d H:i:s') . ' EST',
        ];

        $scriptUrl = config('services.google.apps_script_url')
            ?: env('GOOGLE_APPS_SCRIPT_URL')
            ?: $request->input('scriptUrl');

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
                Log::warning('Could not sync estimate to Google Apps Script: ' . $e->getMessage());
                $googleSheetMessage = $e->getMessage();
            }
        } else {
            $googleSheetMessage = 'Webhook URL not configured.';
        }

        return response()->json([
            'success' => true,
            'estimateRequestId' => $data['estimateRequestId'],
            'googleSheetSaved' => $googleSheetSaved,
            'googleSheetMessage' => $googleSheetMessage,
        ]);
    }
}
