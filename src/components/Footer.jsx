import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Footer = () => {
  const { toast } = useToast();

  const handleSocialClick = () => {
    toast({
      title: "Coming Soon",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4 h-24 flex items-center bg-white/10 rounded-lg p-2 w-fit">
              <img 
                alt="EDI Enviro and Engineering Logo: Wastewater Treatment and Carbon Accounting"
                className="h-full w-auto object-contain"
                src="https://horizons-cdn.hostinger.com/ccb2ae35-b51d-45a2-9783-c118721165d3/9d738acf63811b88dbd90a78d58943a7.jpg" 
              />
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Leading environmental engineering solutions with 15+ years of excellence in industrial wastewater treatment and sustainable practices.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleSocialClick}
                className="w-9 h-9 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button
                onClick={handleSocialClick}
                className="w-9 h-9 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                onClick={handleSocialClick}
                className="w-9 h-9 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <Facebook className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-lg font-semibold mb-4 block">Quick Links</span>
            <ul className="space-y-2">
              {[
                { name: 'Home', href: '#home' },
                { name: 'About Us', href: '#about' },
                { name: 'Services', href: '#services' },
                { name: 'Contact', href: '#contact' }
              ].map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-lg font-semibold mb-4 block">Our Services</span>
            <ul className="space-y-2">
              {[
                'Wastewater Treatment',
                'Biogas Purification',
                'Flue Gas Treatment',
                'ESG Rating Audits',
                'Carbon Accounting',
                'Treatment Chemicals'
              ].map((service) => (
                <li key={service}>
                  <span className="text-slate-400 text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-lg font-semibold mb-4 block">Contact Info</span>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">md@edienviro.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">+91 9632746725</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">93/1B, Main road, Sadayampattu (Vill), Somandargudi (PO), Kallakurichi (TK DT), Tamil Nadu, India - 606202</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2025 EDI Enviro and Engineering. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <button onClick={handleSocialClick} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors duration-200">
                Privacy Policy
              </button>
              <button onClick={handleSocialClick} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors duration-200">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;