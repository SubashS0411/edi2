import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Calculators from '@/components/Calculators';
import Careers from '@/components/Careers';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>EDI Enviro and Engineering - Industrial Wastewater & Environmental Solutions</title>
        <meta name="description" content="EDI Enviro and Engineering provides expert industrial wastewater treatment, biogas purification, flue gas treatment, and ESG rating services with 15 years of field experience and global support capabilities." />
      </Helmet>
      
      <div className="min-h-screen bg-slate-50 relative">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Services />
          <Calculators />
          <Careers />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
