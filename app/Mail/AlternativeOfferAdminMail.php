<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AlternativeOfferAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $offerData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $offerData)
    {
        $this->offerData = $offerData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $customerName = trim(($this->offerData['firstName'] ?? '') . ' ' . ($this->offerData['lastName'] ?? ''));
        $replyTo = [];

        if (!empty($this->offerData['email'])) {
            $replyTo[] = new Address(
                $this->offerData['email'],
                $customerName ?: 'Rental Customer'
            );
        }

        return new Envelope(
            subject: 'An Alternative Vehicle Is Available – WFM',
            replyTo: $replyTo,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.alternative-offer-admin',
            with: [
                'data' => $this->offerData,
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
