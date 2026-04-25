import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const Careers = () => {
  const jobOpenings = [
    { title: 'Sales Engineer', quantity: 1 },
    { title: 'Process and Proposal Engineer', quantity: 1 },
    { title: 'Mechanical Design Engineer', quantity: 1 },
    { title: 'Accountant', quantity: 1 },
  ];

  return (
    <>
      <Helmet>
        <title>Careers - EDI Enviro and Engineering</title>
        <meta name="description" content="Explore career opportunities at EDI Enviro and Engineering. Join our team in industrial wastewater treatment and environmental solutions." />
      </Helmet>
      <section id="careers" className="py-20 bg-gradient-to-br from-green-50 to-emerald-100 min-h-[calc(100vh-16rem)] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="bg-white p-10 rounded-2xl shadow-xl border border-emerald-200"
          >
            <h2 className="text-5xl font-extrabold text-emerald-800 mb-6 leading-tight">
              Current Job Openings
            </h2>
            <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
              We're expanding our team and looking for passionate individuals to join us in shaping a sustainable future.
            </p>
            
            <div className="space-y-4 mb-8">
              {jobOpenings.map((job, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg shadow-sm max-w-md mx-auto"
                >
                  <h3 className="text-xl font-bold text-emerald-700">{job.title} ({job.quantity} opening)</h3>
                </motion.div>
              ))}
            </div>

            <p className="text-lg text-slate-700 mb-4 font-semibold">
              Requirement: Prefer candidates with 2 to 3 years of experience in the wastewater treatment relevant field.
            </p>
            <p className="text-lg text-slate-700 mb-8">
              Interested candidates can share their CV to: <a href="mailto:md@edienviro.com" className="text-emerald-600 hover:text-emerald-800 underline font-bold">md@edienviro.com</a>
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Careers;