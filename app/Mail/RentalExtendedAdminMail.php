<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RentalExtendedAdminMail extends Mailable
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
        $confNum = $this->reservationData['confirmationNumber'] ?? 'N/A';
        return new Envelope(
            subject: "Your Rental Has Been Extended – WFM [Admin: #{$confNum}]",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.rental-extended-admin',
            with: [
                'data' => $this->reservationData,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
