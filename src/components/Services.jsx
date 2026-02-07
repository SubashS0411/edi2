import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Wind, Flame, Beaker, FlaskConical, BarChart3, Leaf, Cpu, PenTool, FileText, Settings } from 'lucide-react';
import ServiceCard from '@/components/ServiceCard';

const Services = () => {
  const services = [
    {
      icon: Droplets,
      title: 'Industrial Wastewater Treatment',
      description: 'Advanced biological treatment methods for industrial effluents, ensuring compliance with environmental regulations and optimal water quality.',
      features: ['Biological Treatment', 'Aerobic Systems', 'Anaerobic Digestion', 'Compliance Monitoring'],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Wind,
      title: 'Biogas Purification',
      description: 'Comprehensive H2S removal systems for biogas purification, enhancing gas quality and protecting downstream equipment.',
      features: ['H2S Removal', 'Gas Conditioning', 'Quality Enhancement', 'System Optimization'],
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Flame,
      title: 'Flue Gas Treatment',
      description: 'Specialized SOx removal technologies for industrial flue gas, reducing emissions and environmental impact.',
      features: ['SOx Removal', 'Emission Control', 'Stack Gas Treatment', 'Air Quality Management'],
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: Cpu,
      title: 'Full Automation of Plant',
      description: 'Complete PLC-based automation solutions for treatment plants, ensuring operational efficiency, precision control, and remote monitoring.',
      features: ['PLC Control Systems', 'SCADA Integration', 'Remote Monitoring', 'Automated Dosing'],
      color: 'from-slate-600 to-gray-700'
    },
    {
      icon: Beaker,
      title: 'Granular & Aerobic Culture Supply',
      description: 'High-quality microbial cultures and granular biomass for efficient biological treatment systems.',
      features: ['Specialized Cultures', 'Granular Sludge', 'Custom Formulations', 'Technical Support'],
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: FlaskConical,
      title: 'Wastewater Treatment Chemicals',
      description: 'Complete range of chemicals including urea, phosphoric acid, polymers, coagulants, and organic biocides for optimal treatment performance.',
      features: ['Urea & Nutrients', 'Polymers & Coagulants', 'Phosphoric Acid', 'Organic Biocides'],
      color: 'from-indigo-500 to-blue-600'
    },
    {
      icon: BarChart3,
      title: 'ESG Rating Audits',
      description: 'Comprehensive Environmental, Social, and Governance assessments to enhance corporate sustainability ratings.',
      features: ['ESG Compliance', 'Sustainability Audits', 'Rating Improvement', 'Reporting Support'],
      color: 'from-teal-500 to-cyan-600'
    },
    {
      icon: Leaf,
      title: 'Carbon Accounting',
      description: 'Expert carbon footprint analysis and accounting services to help businesses achieve their net-zero goals.',
      features: ['Carbon Footprint Analysis', 'Emission Tracking', 'Reduction Strategies', 'Compliance Reporting'],
      color: 'from-emerald-500 to-green-600'
    },
    {
      icon: Settings,
      title: 'Process Engineering Support',
      description: 'Expert technical support for optimizing and troubleshooting complex water and wastewater treatment processes.',
      features: ['Process Optimization', 'Troubleshooting', 'Efficiency Analysis', 'Technical Consultation'],
      color: 'from-cyan-600 to-blue-700'
    },
    {
      icon: FileText,
      title: 'Proposal Engineering Support',
      description: 'Detailed proposal development services including technical specifications, cost estimations, and system design for tenders.',
      features: ['Technical Proposals', 'Cost Estimation', 'Tender Documentation', 'Design Specifications'],
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: PenTool,
      title: 'Commissioning Support',
      description: 'Comprehensive commissioning services available both remotely and onsite to ensure smooth plant startup and operation.',
      features: ['Remote Assistance', 'Onsite Commissioning', 'Startup Support', 'Operational Training'],
      color: 'from-violet-500 to-purple-600'
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">Our Services</span>
          <h2 className="text-4xl font-bold text-slate-900 mt-3 mb-4">
            Comprehensive Environmental Solutions
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Wastewater treatment to ESG and air pollution control
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Global & Remote Support</h3>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Our team provides comprehensive support worldwide, including remote monitoring, troubleshooting, and consultation services to ensure your systems operate at peak efficiency.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="font-semibold">24/7 Support</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="font-semibold">Remote Monitoring</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="font-semibold">Global Reach</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;