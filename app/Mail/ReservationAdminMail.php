<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $reservationData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $reservationData)
    {
        $this->reservationData = $reservationData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $confirmation = $this->reservationData['confirmationNumber'] ?? 'Pending';
        $carTitle = $this->reservationData['carTitle'] ?? 'Vehicle Rental';
        $customerName = trim(($this->reservationData['firstName'] ?? '') . ' ' . ($this->reservationData['lastName'] ?? ''));

        return new Envelope(
            subject: "🚗 [New Rental Reservation #{$confirmation}] - {$carTitle} (from {$customerName})",
            replyTo: [
                new Address(
                    $this->reservationData['email'],
                    $customerName ?: 'Rental Customer'
                ),
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reservation-admin',
            with: [
                'data' => $this->reservationData,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
