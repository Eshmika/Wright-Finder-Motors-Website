<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactFormAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $contactData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $contactData)
    {
        $this->contactData = $contactData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subjectPrefix = !empty($this->contactData['car_title'])
            ? "[Vehicle Inquiry] {$this->contactData['car_title']}"
            : "[Contact Request] " . ucfirst($this->contactData['subject'] ?? 'General Inquiry');

        return new Envelope(
            subject: "{$subjectPrefix} - from {$this->contactData['name']}",
            replyTo: [
                new Address($this->contactData['email'], $this->contactData['name']),
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-admin',
            with: [
                'data' => $this->contactData,
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
