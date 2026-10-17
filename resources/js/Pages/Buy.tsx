import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import BuyHeroSection from "./Buy/BuyHeroSection";
import VehicleCatalog from "./Buy/VehicleCatalog";
import CallToActionSection from "./Home/CallToActionSection";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";

export default function Buy({ auth }: PageProps) {
    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-800 font-poppins selection:bg-vivid-red selection:text-white">
            <Head title="Buy Certified Vehicles - Wright Finder Motors" />

            {/* Header */}
            <Header user={auth?.user} />

            {/* Main Page Sections */}
            <main className="flex-1">
                {/* <BuyHeroSection /> */}
                <VehicleCatalog />
                <CallToActionSection />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
