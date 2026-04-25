import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Globe, Factory, Cpu } from 'lucide-react';
const About = () => {
  const stats = [{
    icon: Award,
    value: '15+',
    label: 'Years Experience'
  }, {
    icon: Users,
    value: '100+',
    label: 'Projects Worked'
  }, {
    icon: Globe,
    value: 'Global',
    label: 'Support Network'
  }];
  const industries = ['Pulp & Paper', 'Breweries', 'Distilleries', 'Pharmaceuticals', 'Chemicals', 'Starch', 'Food Processing', 'Potato Processing', 'Fish Processing'];
  return <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8
        }}>
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">About Us</span>
            <h2 className="text-4xl font-bold text-slate-900 mt-3 mb-6">
              Leading Environmental Engineering Excellence
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              EDI Enviro and Engineering is a pioneering company in industrial environmental solutions, specializing in wastewater treatment, biogas purification, and comprehensive ESG consulting services.
            </p>
            <p className="text-lg text-slate-600 mb-6">
              Founded and led by <span className="font-semibold text-slate-900">Mani Elanchezhiyan</span>, who brings over 15 years of invaluable field experience and holds an M.Tech degree from the prestigious BITS Pilani. Our expertise spans biological wastewater treatment, advanced gas purification technologies, and sustainable industrial practices.
            </p>

            <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500 mb-8">
              <p className="text-slate-800 font-medium flex items-start">
                <Cpu className="w-5 h-5 text-emerald-600 mr-2 mt-1 flex-shrink-0" />
                <span>
                  We are committed to modernization and efficiency: all plants designed by EDI are equipped with comprehensive PLC controlled operation, ensuring full automation, precise control, and operational reliability.
                </span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100 mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h3>
              <p className="text-slate-700">
                To provide innovative, sustainable, and cost-effective environmental engineering solutions that help industries achieve compliance, reduce environmental impact, and enhance operational efficiency through cutting-edge technology and expert consultation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map((stat, index) => <motion.div key={stat.label} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: index * 0.1
            }} className="bg-white border-2 border-emerald-100 p-4 rounded-lg hover:shadow-lg transition-shadow duration-300">
                  <stat.icon className="w-8 h-8 text-emerald-600 mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </motion.div>)}
            </div>

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.4
          }} className="bg-white border-2 border-emerald-100 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <Factory className="w-6 h-6 text-emerald-600 mr-3" />
                Industries We Serve
              </h3>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-slate-700">
                {industries.map((industry, index) => <li key={index} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 flex-shrink-0"></span>
                    {industry}
                  </li>)}
              </ul>
            </motion.div>

          </motion.div>

          <motion.div initial={{
          opacity: 0,
          x: 50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8
        }} className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img alt="High-rate anaerobic reactor system for industrial wastewater" className="w-full h-64 object-cover rounded-xl shadow-lg" src="https://horizons-cdn.hostinger.com/ccb2ae35-b51d-45a2-9783-c118721165d3/anaerobic-S9efK.jpg" />
                <img alt="Industrial wastewater aeration tank with fine bubble diffusers" className="w-full h-48 object-cover rounded-xl shadow-lg" src="https://horizons-cdn.hostinger.com/ccb2ae35-b51d-45a2-9783-c118721165d3/clarifier-IidWk.jpg" />
              </div>
              <div className="space-y-4 pt-8">
                <img alt="Secondary clarifier tank in wastewater treatment plant" className="w-full h-48 object-cover rounded-xl shadow-lg" src="https://horizons-cdn.hostinger.com/ccb2ae35-b51d-45a2-9783-c118721165d3/aeration-80Kkj.jpg" />
                <img alt="PLC Control Panel for plant automation" className="w-full h-64 object-cover rounded-xl shadow-lg" src="https://images.unsplash.com/photo-1601190921388-c2ae2f7c5278" />
              </div>
            </div>

            <motion.div initial={{
            scale: 0
          }} whileInView={{
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.5,
            type: 'spring'
          }} className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded-xl shadow-2xl border-2 border-emerald-100">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Founder & Principal Engineer</p>
                <p className="text-xl font-bold text-slate-900">Mani Elanchezhiyan</p>
                <p className="text-sm text-emerald-600 font-medium">M.Tech, BITS Pilani</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>;
};
export default About;