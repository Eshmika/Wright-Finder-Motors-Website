<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationUserMail extends Mailable
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
        $appName = config('app.name', 'Wright Finder Motors');
        $confirmation = $this->reservationData['confirmationNumber'] ?? 'Pending';

        return new Envelope(
            subject: "Your Rental Reservation Confirmation [{$confirmation}] - {$appName}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reservation-user',
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
