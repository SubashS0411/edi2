import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Factory, Droplet, Wind } from 'lucide-react';
const Portfolio = () => {
  const projects = [{
    icon: Factory,
    title: 'Pharmaceutical Wastewater Treatment',
    description: 'Designed and implemented a comprehensive biological treatment system for a major pharmaceutical facility, achieving 95% COD reduction.',
    industry: 'Pharmaceutical',
    color: 'from-blue-500 to-cyan-600'
  }, {
    icon: Building2,
    title: 'Food Processing ESG Audit',
    description: 'Conducted complete ESG rating assessment and carbon accounting for a multi-site food processing company, improving their rating by 2 levels.',
    industry: 'Food & Beverage',
    color: 'from-green-500 to-emerald-600'
  }, {
    icon: Droplet,
    title: 'Textile Industry Effluent Management',
    description: 'Implemented advanced color removal and biological treatment for textile dyeing operations with zero liquid discharge target.',
    industry: 'Textile',
    color: 'from-purple-500 to-pink-600'
  }, {
    icon: Wind,
    title: 'Biogas Plant H2S Removal',
    description: 'Installed and commissioned biogas purification system for agricultural waste processing facility, reducing H2S from 3000 ppm to <10 ppm.',
    industry: 'Renewable Energy',
    color: 'from-orange-500 to-red-600'
  }];
  return <section id="portfolio" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="text-center mb-16">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">Portfolio</span>
          <h2 className="text-4xl font-bold text-slate-900 mt-3 mb-4">
            Featured Projects
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Explore our diverse portfolio of successful environmental engineering projects across various industries.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {projects.map((project, index) => <motion.div key={project.title} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: index * 0.1
        }} className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border-2 border-slate-100 hover:border-emerald-200">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${project.color} flex items-center justify-center flex-shrink-0`}>
                  <project.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{project.title}</h3>
                  </div>
                  <p className="text-slate-600 mb-3">{project.description}</p>
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                    {project.industry}
                  </span>
                </div>
              </div>
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
      }} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border-2 border-emerald-100">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-emerald-600 mb-2">100+</p>
              <p className="text-slate-700 font-medium">Projects Worked</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-teal-600 mb-2">20+</p>
              <p className="text-slate-700 font-medium">Industries Served</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-cyan-600 mb-2">15+</p>
              <p className="text-slate-700 font-medium">Years Experience</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>;
};
export default Portfolio;