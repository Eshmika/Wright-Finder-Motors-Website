<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationCancelledUserMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $cancellationData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $cancellationData)
    {
        $this->cancellationData = $cancellationData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reservation Cancellation Confirmation – WFM',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reservation-cancelled-user',
            with: [
                'data' => $this->cancellationData,
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
