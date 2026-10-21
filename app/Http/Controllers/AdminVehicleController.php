<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AdminVehicleController extends Controller
{
    /**
     * Submit vehicle data to Google Sheet / Google Drive (via Apps Script or proxy)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'carId' => 'nullable|string',
            'originalCarId' => 'nullable|string',
            'editMode' => 'nullable|boolean',
            'action' => 'nullable|string',
            'carName' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|string',
            'mileage' => 'nullable|string',
            'vin' => 'nullable|string|max:17',
            'status' => 'nullable|string',
            'title' => 'nullable|string',
            'trim' => 'nullable|string',
            'bodyStyle' => 'nullable|string',
            'rentOrSell' => 'nullable|string',
            'exteriorColor' => 'nullable|string',
            'interiorColor' => 'nullable|string',
            'seatMaterial' => 'nullable|string',
            'engine' => 'nullable|string',
            'engineTypeSize' => 'nullable|string',
            'transmission' => 'nullable|string',
            'driveline' => 'nullable|string',
            'fuelType' => 'nullable|string',
            'powerOptions' => 'nullable|string',
            'condition' => 'nullable|string',
            'driveCondition' => 'nullable|string',
            'interiorFeatures' => 'nullable|string',
            'price' => 'nullable',
            'discount' => 'nullable',
            'notes' => 'nullable|string',
            'timestamp' => 'nullable|string',
            'mainImage' => 'nullable',
            'subImages' => 'nullable|array',
            'mainImageUrl' => 'nullable|string',
            'subImageUrls' => 'nullable|string',
            'clientName' => 'nullable|string',
            'clientPhone' => 'nullable|string',
            'clientEmail' => 'nullable|string',
            'purchaseDate' => 'nullable|string',
            'tradeStatus' => 'nullable|string',
            'scriptUrl' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed: ' . implode(', ', $validator->errors()->all()),
                'errors' => $validator->errors(),
            ], 422);
        }

        // Webhook / Google Apps Script endpoint URL: check services config first, then .env, then request
        $scriptUrl = config('services.google.apps_script_url') ?: env('GOOGLE_APPS_SCRIPT_URL') ?: $request->input('scriptUrl');

        if (!$scriptUrl) {
            return response()->json([
                'status' => 'need_webhook',
                'message' => 'Google Apps Script Webhook URL is not configured. Please add GOOGLE_APPS_SCRIPT_URL to your .env file.',
                'carId' => $request->input('carId'),
            ], 400);
        }

        try {
            // Forward payload to Google Apps Script Web App
            $payload = $request->except(['_token', 'scriptUrl']);

            // Apps Script requires following redirects (302)
            $response = Http::withoutVerifying()
                ->timeout(45)
                ->withOptions(['allow_redirects' => true])
                ->post($scriptUrl, $payload);

            if ($response->successful()) {
                $responseData = $response->json();

                // If Google Apps Script returned status: error
                if (is_array($responseData) && isset($responseData['status']) && $responseData['status'] === 'error') {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Google Sheet Error: ' . ($responseData['message'] ?? 'Could not write row.'),
                        'data' => $responseData,
                    ], 500);
                }

                return response()->json([
                    'status' => 'success',
                    'message' => 'Vehicle successfully saved to Google Sheet!',
                    'data' => $responseData ?: ['raw' => $response->body()],
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Google Apps Script returned HTTP ' . $response->status() . ': ' . $response->body(),
            ], 500);
        } catch (\Exception $e) {
            Log::error('Google Apps Script request exception: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to reach Google Apps Script: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete vehicle row from Google Sheet
     */
    public function destroy(Request $request, $id = null)
    {
        $carId = $id ?: $request->input('carId');
        if (!$carId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Car ID is required to delete a vehicle.',
            ], 422);
        }

        $scriptUrl = config('services.google.apps_script_url') ?: env('GOOGLE_APPS_SCRIPT_URL') ?: $request->input('scriptUrl');
        if (!$scriptUrl) {
            return response()->json([
                'status' => 'need_webhook',
                'message' => 'Google Apps Script Webhook URL is not configured. Please add GOOGLE_APPS_SCRIPT_URL to your .env file.',
                'carId' => $carId,
            ], 400);
        }

        try {
            $payload = [
                'action' => 'delete',
                'carId' => $carId,
            ];

            $response = Http::withoutVerifying()
                ->timeout(45)
                ->withOptions(['allow_redirects' => true])
                ->post($scriptUrl, $payload);

            if ($response->successful()) {
                $responseData = $response->json();
                if (is_array($responseData) && isset($responseData['status']) && $responseData['status'] === 'error') {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Google Sheet Error: ' . ($responseData['message'] ?? 'Could not delete row.'),
                        'data' => $responseData,
                    ], 500);
                }

                return response()->json([
                    'status' => 'success',
                    'message' => 'Vehicle ' . $carId . ' deleted successfully from Google Sheet!',
                    'data' => $responseData ?: ['raw' => $response->body()],
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Google Apps Script returned HTTP ' . $response->status() . ': ' . $response->body(),
            ], 500);
        } catch (\Exception $e) {
            Log::error('Google Apps Script delete exception: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete vehicle via Google Apps Script: ' . $e->getMessage(),
            ], 500);
        }
    }
}
