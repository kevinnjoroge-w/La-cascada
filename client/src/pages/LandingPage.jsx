import Hero from '../components/landing/Hero';
import AboutSection from '../components/landing/AboutSection';
import RoomsSection from '../components/landing/RoomsSection';
import MenuSection from '../components/landing/MenuSection';
import Testimonials from '../components/landing/Testimonials';
import ContactSection from '../components/landing/ContactSection';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* About Section */}
      <AboutSection />

      {/* Rooms Section */}
      <RoomsSection />

      {/* Menu Preview */}
      <MenuSection />

      {/* Testimonials */}
      <Testimonials />

      {/* Contact Section */}
      <ContactSection />
    </div>
  );
};

export default LandingPage;

