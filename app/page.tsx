import Header from "@/components/Header";
import Hero from "@/components/Hero";
import VehicleModels from "@/components/VehicleModels";
import AboutSection from "@/components/AboutSection";
import DesignCenter from "@/components/DesignCenter";
import TechPlatform from "@/components/TechPlatform";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Header heroLogoAlign />
      <Hero />
      <VehicleModels />
      <AboutSection />
      <DesignCenter />
      <TechPlatform />
      <Footer />
    </main>
  );
}
