import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModelHero from "@/components/avatr07/ModelHero";
import SpecsIntro from "@/components/avatr07/SpecsIntro";
import GoldenRatio from "@/components/avatr07/GoldenRatio";
import DesignMosaic from "@/components/avatr07/DesignMosaic";
import ColourPicker from "@/components/avatr07/ColourPicker";
import CockpitFeature from "@/components/avatr07/CockpitFeature";
import LuxuryStats from "@/components/avatr07/LuxuryStats";
import RearCabin from "@/components/avatr07/RearCabin";
import SeatingFeature from "@/components/avatr07/SeatingFeature";
import PanoramicSunroof from "@/components/avatr07/PanoramicSunroof";
import MeridianSound from "@/components/avatr07/MeridianSound";
import AcousticMaterials from "@/components/avatr07/AcousticMaterials";
import AmbientLighting from "@/components/avatr07/AmbientLighting";
import FlexibleStorage from "@/components/avatr07/FlexibleStorage";
import InteriorMirror from "@/components/avatr07/InteriorMirror";
import HarmonySpace from "@/components/avatr07/HarmonySpace";
import ModesCarousel from "@/components/avatr07/ModesCarousel";
import HuaweiAds from "@/components/avatr07/HuaweiAds";
import TaihangChassis from "@/components/avatr07/TaihangChassis";
import HardBraking from "@/components/avatr07/HardBraking";
import KunlunPowertrain from "@/components/avatr07/KunlunPowertrain";
import Airbags from "@/components/avatr07/Airbags";
import DoorSillBeam from "@/components/avatr07/DoorSillBeam";
import FrontImpactBeam from "@/components/avatr07/FrontImpactBeam";
import BatterySafety from "@/components/avatr07/BatterySafety";
import MotionReady from "@/components/MotionReady";
import MediaAhead from "@/components/avatr07/MediaAhead";
import PageTopReset from "@/components/PageTopReset";
import MobileDebugHud from "@/components/avatr07/MobileDebugHud";
import { ROOT_SCALE } from "@/components/avatr07/scale";

export const metadata: Metadata = {
  title: "AVATR 07 — AVATR Bangladesh",
  description: "Discover the AVATR 07: futuristic design, golden ratio proportions and a wraparound cockpit.",
};

export default function Avatr07Page() {
  return (
    <main className="min-h-screen bg-white" style={ROOT_SCALE}>
      <PageTopReset />
      <Header />
      <ModelHero />
      {/* Every section with a scroll animation sits in this layout-neutral wrapper (display: contents) so the page can
          keep them unpainted until they are armed; see MotionReady. */}
      <div data-motion className="contents">
      <SpecsIntro />
      <GoldenRatio />
      <DesignMosaic />
      <ColourPicker />
      <CockpitFeature />
      <LuxuryStats />
      <RearCabin />
      <SeatingFeature />
      <PanoramicSunroof />
      <MeridianSound />
      <AcousticMaterials />
      <AmbientLighting />
      <FlexibleStorage />
      <InteriorMirror />
      <HarmonySpace />
      <ModesCarousel />
      <HuaweiAds />
      <TaihangChassis />
      <HardBraking />
      <KunlunPowertrain />
      </div>
      <MotionReady />
      <MediaAhead />
      <Airbags />
      <DoorSillBeam />
      <FrontImpactBeam />
      <BatterySafety />
      <Footer />
      <MobileDebugHud />
    </main>
  );
}
