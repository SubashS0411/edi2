import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const ServiceCard = ({ service, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
    >
      <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
      <div className="p-6">
        <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <service.icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
        <p className="text-slate-600 mb-4">{service.description}</p>
        <ul className="space-y-2 mb-6">
          {service.features.map((feature) => (
            <li key={feature} className="flex items-center text-sm text-slate-700">
              <Check className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default ServiceCard;