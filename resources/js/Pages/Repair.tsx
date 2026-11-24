import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import RepairHeroSection from "./Repair/RepairHeroSection";
import RepairServicesSection from "./Repair/RepairServicesSection";
import CallToActionSection from "./Home/CallToActionSection";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";

export default function Repair({ auth }: PageProps) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-poppins selection:bg-vivid-red selection:text-white">
            <Head title="Repair & Maintenance Services - Wright Finder Motors" />

            {/* Header */}
            <Header user={auth?.user} />

            {/* Main Page Content */}
            <main className="flex-1">
                <RepairHeroSection />
                <RepairServicesSection />
                <CallToActionSection />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
