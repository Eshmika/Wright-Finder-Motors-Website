import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import HeroSection from './Home/HeroSection';
import FeaturedCategories from './Home/FeaturedCategories';
import FeaturedInventory from './Home/FeaturedInventory';
import ServicesSection from './Home/ServicesSection';
import WhyChooseUsSection from './Home/WhyChooseUsSection';
import CallToActionSection from './Home/CallToActionSection';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

export default function Home({ auth }: PageProps) {
    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-800 font-poppins selection:bg-vivid-red selection:text-white">
            <Head title="Wright Finder Motors - Buy, Sell & Rent Vehicles" />

            {/* Header */}
            <Header user={auth.user} />

            {/* Main Page Sections */}
            <main className="flex-1">
                <HeroSection />
                <FeaturedCategories />
                <FeaturedInventory />
                <ServicesSection />
                <WhyChooseUsSection />
                <CallToActionSection />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
