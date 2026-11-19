<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationApprovedAdminMail extends Mailable
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
        $customerName = trim(($this->reservationData['firstName'] ?? '') . ' ' . ($this->reservationData['lastName'] ?? ''));
        $replyTo = [];

        if (!empty($this->reservationData['email'])) {
            $replyTo[] = new Address(
                $this->reservationData['email'],
                $customerName ?: 'Rental Customer'
            );
        }

        return new Envelope(
            subject: 'Your Reservation Is Approved – WFM',
            replyTo: $replyTo,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reservation-approved-admin',
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
