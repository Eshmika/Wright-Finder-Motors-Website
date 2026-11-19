<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AlternativeOfferUserMail extends Mailable
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
        return new Envelope(
            subject: 'An Alternative Vehicle Is Available – WFM',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.alternative-offer-user',
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
