<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmationAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $paymentData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $paymentData)
    {
        $this->paymentData = $paymentData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $customerName = trim(($this->paymentData['firstName'] ?? '') . ' ' . ($this->paymentData['lastName'] ?? ''));
        $replyTo = [];

        if (!empty($this->paymentData['email'])) {
            $replyTo[] = new Address(
                $this->paymentData['email'],
                $customerName ?: 'Rental Customer'
            );
        }

        return new Envelope(
            subject: 'Payment Confirmation – WFM',
            replyTo: $replyTo,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-confirmation-admin',
            with: [
                'data' => $this->paymentData,
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
