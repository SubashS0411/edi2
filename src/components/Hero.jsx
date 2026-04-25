import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Droplets, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"></div>
      
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-6"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Global Environmental Solutions</span>
            </motion.div>

            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Transforming Industries with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600"> Sustainable Solutions</span>
            </h1>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Expert industrial wastewater treatment, biogas purification, and environmental engineering services with 15 years of field experience and global support capabilities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                size="lg"
                onClick={scrollToContact}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.querySelector('#services').scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                Our Services
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: Droplets, label: 'Wastewater Treatment', color: 'text-blue-600' },
                { icon: Leaf, label: 'Biogas Purification', color: 'text-green-600' },
                { icon: Globe, label: 'ESG Consulting', color: 'text-teal-600' }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <item.icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
                  <span className="text-xs text-slate-600 font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                alt="Panoramic view of industrial wastewater treatment plant with anaerobic reactors"
                className="w-full h-[600px] object-cover"
               src="https://images.unsplash.com/photo-1614195975309-a3baf592274f" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="text-sm font-medium mb-2">Trusted by Industries Worldwide</p>
                <p className="text-2xl font-bold">15+ Years of Excellence</p>
              </div>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
              className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Global Support</p>
                  <p className="text-lg font-bold text-slate-900">24/7 Available</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;