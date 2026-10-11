import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import ContactHeroSection from "./Contact/ContactHeroSection";
import ContactContentSection from "./Contact/ContactContentSection";
import CallToActionSection from "./Home/CallToActionSection";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";

export default function Contact({ auth }: PageProps) {
    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-800 font-poppins selection:bg-vivid-red selection:text-white">
            <Head title="Contact Us - Wright Finder Motors" />

            {/* Header */}
            <Header user={auth?.user} />

            {/* Main Page Sections */}
            <main className="flex-1">
                <ContactHeroSection />
                <ContactContentSection />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
