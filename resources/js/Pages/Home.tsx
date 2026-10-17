import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import ServicesSection from "./Home/ServicesSection";
import CallToActionSection from "./Home/CallToActionSection";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";

export default function Home({ auth }: PageProps) {
    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-800 font-poppins selection:bg-vivid-red selection:text-white">
            <Head title="Wright Finder Motors - Buy, Sell & Rent Vehicles" />

            {/* Header */}
            <Header user={auth.user} />

            {/* Main Page Sections */}
            <main className="flex-1">
                <ServicesSection />
                <CallToActionSection />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
