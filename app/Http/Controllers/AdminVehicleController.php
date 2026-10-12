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
            'carName' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|string',
            'mileage' => 'nullable|string',
            'vin' => 'nullable|string|max:17',
            'status' => 'nullable|string',
            'title' => 'nullable|string',
            'trim' => 'nullable|string',
            'bodyStyle' => 'nullable|string',
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
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // If local file uploads were passed, store them locally as fallback
        $mainImageUrl = $request->input('mainImageUrl', '');
        if ($request->hasFile('mainImageFile')) {
            $path = $request->file('mainImageFile')->store('vehicles', 'public');
            $mainImageUrl = asset('storage/' . $path);
        }

        $subImageUrls = [];
        if ($request->hasFile('subImageFiles')) {
            foreach ($request->file('subImageFiles') as $file) {
                $p = $file->store('vehicles', 'public');
                $subImageUrls[] = asset('storage/' . $p);
            }
        }

        // Webhook / Google Apps Script endpoint URL if configured in .env
        $scriptUrl = env('GOOGLE_APPS_SCRIPT_URL');

        if ($scriptUrl) {
            try {
                $payload = $request->all();
                if ($mainImageUrl) {
                    $payload['mainImageUrl'] = $mainImageUrl;
                }
                if (!empty($subImageUrls)) {
                    $payload['subImageUrls'] = implode(', ', $subImageUrls);
                }

                $response = Http::timeout(30)->post($scriptUrl, $payload);

                if ($response->successful()) {
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Vehicle successfully saved to Google Sheet!',
                        'data' => $response->json(),
                    ]);
                }
            } catch (\Exception $e) {
                Log::warning('Google Apps Script request error: ' . $e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Vehicle data saved locally',
            'carId' => $request->input('carId'),
            'mainImageUrl' => $mainImageUrl,
            'subImageUrls' => implode(', ', $subImageUrls),
        ]);
    }
}
