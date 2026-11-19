<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationCompletedAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $completedData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $completedData)
    {
        $this->completedData = $completedData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $customerName = trim(($this->completedData['firstName'] ?? '') . ' ' . ($this->completedData['lastName'] ?? ''));
        $replyTo = [];

        if (!empty($this->completedData['email'])) {
            $replyTo[] = new Address(
                $this->completedData['email'],
                $customerName ?: 'Rental Customer'
            );
        }

        return new Envelope(
            subject: 'Thank You for Renting with WFM!',
            replyTo: $replyTo,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reservation-completed-admin',
            with: [
                'data' => $this->completedData,
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
