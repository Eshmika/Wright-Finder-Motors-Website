<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationCancelledAdminMail extends Mailable
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
        $customerName = trim(($this->cancellationData['firstName'] ?? '') . ' ' . ($this->cancellationData['lastName'] ?? ''));
        $replyTo = [];

        if (!empty($this->cancellationData['email'])) {
            $replyTo[] = new Address(
                $this->cancellationData['email'],
                $customerName ?: 'Rental Customer'
            );
        }

        return new Envelope(
            subject: 'Reservation Cancellation Confirmation – WFM',
            replyTo: $replyTo,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reservation-cancelled-admin',
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
