import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, Zap, Droplets, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ProposalGenerator from '@/components/ProposalGenerator';
import { ProposalGeneratorPasswordProvider, useProposalAuth } from '@/context/ProposalGeneratorPasswordContext';
import ProposalGeneratorPasswordScreen from '@/components/ProposalGeneratorPasswordScreen';

// Wrapper component to handle the conditional rendering inside the provider context
const ProposalTabContent = () => {
  const { isAuthenticated } = useProposalAuth();

  if (!isAuthenticated) {
    return <ProposalGeneratorPasswordScreen />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
    >
      <ProposalGenerator />
    </motion.div>
  );
};

const CalculatorsContent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('biogas'); // Default to biogas

  // Biogas State
  const [biogasInputs, setBiogasInputs] = useState({
    flow: '',
    scod: '',
    efficiency: '',
    fuelType: 'coal'
  });
  const [biogasResults, setBiogasResults] = useState(null);

  // Nutrient State
  const [nutrientInputs, setNutrientInputs] = useState({
    flow: '',
    scod: '',
    efficiency: '',
    nh4: '',
    po4: ''
  });
  const [nutrientResults, setNutrientResults] = useState(null);

  // Constants
  const FUELS = {
    coal: { name: 'Coal', cv: 4000, unit: 'kg' },
    oil: { name: 'Furnace Oil', cv: 10000, unit: 'kg' },
    wood: { name: 'Wood Chips', cv: 2800, unit: 'kg' }
  };

  const calculateBiogas = () => {
    const flow = parseFloat(biogasInputs.flow);
    const scod = parseFloat(biogasInputs.scod);
    const eff = parseFloat(biogasInputs.efficiency);

    if (!flow || !scod || !eff) {
      toast({
        title: "Missing Inputs",
        description: "Please fill in all fields to calculate biogas generation.",
        variant: "destructive"
      });
      return;
    }

    const flowDay = flow * 24;
    const loadKgDay = (flowDay * scod) / 1000;
    const removedKgDay = loadKgDay * (eff / 100);

    // Biogas Generation
    const biogasGenNm3 = removedKgDay * 0.43;
    const totalKcal = biogasGenNm3 * 5000;

    const selectedFuel = FUELS[biogasInputs.fuelType];
    const fuelSavings = totalKcal / selectedFuel.cv;

    setBiogasResults({
      removedKgDay,
      biogasGen: biogasGenNm3,
      totalKcal,
      fuelSavings,
      fuelUnit: selectedFuel.unit,
      fuelName: selectedFuel.name
    });

    toast({
      title: "Calculation Complete",
      description: "Biogas potential calculated.",
    });
  };

  const calculateNutrients = () => {
    const flow = parseFloat(nutrientInputs.flow);
    const scod = parseFloat(nutrientInputs.scod);
    const eff = parseFloat(nutrientInputs.efficiency);
    const nh4 = parseFloat(nutrientInputs.nh4);
    const po4 = parseFloat(nutrientInputs.po4);

    if (!flow || !scod || !eff || isNaN(nh4) || isNaN(po4)) {
      toast({
        title: "Missing Inputs",
        description: "Please fill in all fields (use 0 if none) to calculate dosing.",
        variant: "destructive"
      });
      return;
    }

    const codLoadKgDay = (flow * 24 * scod) / 1000;
    const removedCodKgDay = codLoadKgDay * (eff / 100);

    const requiredN = removedCodKgDay * (5 / 500);
    const requiredP = removedCodKgDay * (1 / 500);

    const existingN = (flow * 24 * nh4) / 1000;
    const existingP = (flow * 24 * po4) / 1000;

    const deficitN = Math.max(0, requiredN - existingN);
    const deficitP = Math.max(0, requiredP - existingP);

    // Option 1: Urea + Phosphoric Acid
    const ureaOnlyDosing = deficitN / 0.46;
    const acidDosing = deficitP / 0.32;

    // Option 2: Urea + DAP
    const dapDosing = deficitP / 0.46 / 0.44;
    const nFromDap = dapDosing * 0.18;
    const remainingNDeficit = Math.max(0, deficitN - nFromDap);
    const ureaWithDapDosing = remainingNDeficit / 0.46;

    const calcTank = (kg) => Math.max(0.1, Math.ceil((kg / 0.1 / 1000) * 100) / 100);

    setNutrientResults({
      codLoadKgDay,
      removedCodKgDay,
      requiredN,
      requiredP,
      deficitN,
      deficitP,
      opt1: {
        urea: ureaOnlyDosing,
        acid: acidDosing,
        ureaTank: calcTank(ureaOnlyDosing),
        acidTank: calcTank(acidDosing)
      },
      opt2: {
        urea: ureaWithDapDosing,
        dap: dapDosing,
        ureaTank: calcTank(ureaWithDapDosing),
        dapTank: calcTank(dapDosing),
        nFromDap
      }
    });

    toast({
      title: "Calculation Complete",
      description: "Nutrient dosing requirements calculated.",
    });
  };

  return (
    <section id="calculators" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 print:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-4"
          >
            <Calculator className="w-4 h-4" />
            <span className="text-sm font-medium">Engineering Tools</span>
          </motion.div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Process Calculators</h2>
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Professional tools for estimating biogas generation potential, nutrient dosing, and technical proposals.
            </p>
            <div className="flex items-center gap-4 text-sm mt-2">
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                Secured Proposal Generator
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8 print:hidden">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveTab('biogas')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${activeTab === 'biogas'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Zap className="w-4 h-4" />
              <span>Biogas Generator</span>
            </button>
            <button
              onClick={() => setActiveTab('nutrient')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${activeTab === 'nutrient'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Droplets className="w-4 h-4" />
              <span>Nutrient Dosing</span>
            </button>
            <button
              onClick={() => navigate('/proposal-tool')}
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 text-slate-600 hover:bg-slate-50"
            >
              <FileText className="w-4 h-4" />
              <span>Proposal Generator</span>
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {activeTab === 'biogas' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
            >
              {/* Biogas Content */}
              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3">1</span>
                    Input Parameters
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Influent Flow Rate</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="e.g. 100"
                          value={biogasInputs.flow}
                          onChange={(e) => setBiogasInputs({ ...biogasInputs, flow: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                        <span className="absolute right-3 top-2 text-sm text-slate-400">m³/hr</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">sCOD Concentration</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="e.g. 5000"
                          value={biogasInputs.scod}
                          onChange={(e) => setBiogasInputs({ ...biogasInputs, scod: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                        <span className="absolute right-3 top-2 text-sm text-slate-400">mg/l</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Anaerobic Efficiency</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="e.g. 85"
                          max="100"
                          value={biogasInputs.efficiency}
                          onChange={(e) => setBiogasInputs({ ...biogasInputs, efficiency: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                        <span className="absolute right-3 top-2 text-sm text-slate-400">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Compare Savings With</label>
                      <select
                        value={biogasInputs.fuelType}
                        onChange={(e) => setBiogasInputs({ ...biogasInputs, fuelType: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                      >
                        {Object.entries(FUELS).map(([key, fuel]) => (
                          <option key={key} value={key}>{fuel.name} ({fuel.cv} kcal/{fuel.unit})</option>
                        ))}
                      </select>
                    </div>

                    <Button onClick={calculateBiogas} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4">
                      Calculate Potential
                    </Button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex flex-col justify-center">
                  {!biogasResults ? (
                    <div className="text-center text-slate-400">
                      <Zap className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Enter parameters to see your energy potential</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <p className="text-sm text-slate-500 mb-1">Estimated Biogas Generation</p>
                        <p className="text-4xl font-bold text-emerald-600">
                          {biogasResults.biogasGen.toFixed(1)} <span className="text-lg text-emerald-500 font-medium">Nm³/day</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                          <p className="text-xs text-slate-500">sCOD Removed</p>
                          <p className="text-lg font-bold text-slate-700">{biogasResults.removedKgDay.toFixed(0)} kg/day</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                          <p className="text-xs text-slate-500">Energy Value</p>
                          <p className="text-lg font-bold text-slate-700">{(biogasResults.totalKcal / 1000).toFixed(0)} Mcal</p>
                        </div>
                      </div>

                      <div className="bg-emerald-900 text-emerald-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="mt-0.5">
                            <p className="text-sm font-medium text-emerald-200">Potential {biogasResults.fuelName} Savings</p>
                            <p className="text-2xl font-bold text-white">
                              {biogasResults.fuelSavings.toFixed(1)} {biogasResults.fuelUnit}/day
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'nutrient' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
            >
              {/* Nutrient Content */}
              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3">1</span>
                    Process Parameters
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Flow Rate</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="e.g. 50"
                          value={nutrientInputs.flow}
                          onChange={(e) => setNutrientInputs({ ...nutrientInputs, flow: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                        <span className="absolute right-3 top-2 text-sm text-slate-400">m³/hr</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">sCOD Conc.</label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="e.g. 2000"
                            value={nutrientInputs.scod}
                            onChange={(e) => setNutrientInputs({ ...nutrientInputs, scod: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Removal Eff.</label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="e.g. 85"
                            max="100"
                            value={nutrientInputs.efficiency}
                            onChange={(e) => setNutrientInputs({ ...nutrientInputs, efficiency: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Influent NH4-N</label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="e.g. 10"
                            value={nutrientInputs.nh4}
                            onChange={(e) => setNutrientInputs({ ...nutrientInputs, nh4: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Influent PO4-P</label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="e.g. 2"
                            value={nutrientInputs.po4}
                            onChange={(e) => setNutrientInputs({ ...nutrientInputs, po4: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <Button onClick={calculateNutrients} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4">
                      Calculate Dosing Options
                    </Button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex flex-col justify-center">
                  {!nutrientResults ? (
                    <div className="text-center text-slate-400">
                      <p>Calculate optimal nutrient balance based on 500:5:1 ratio</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Required N</p>
                          <p className="text-xl font-bold text-slate-800">{nutrientResults.requiredN.toFixed(1)} <span className="text-sm font-normal text-slate-500">kg/d</span></p>
                          <div className="text-xs text-slate-400">Deficit: {nutrientResults.deficitN.toFixed(1)} kg</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Required P</p>
                          <p className="text-xl font-bold text-slate-800">{nutrientResults.requiredP.toFixed(1)} <span className="text-sm font-normal text-slate-500">kg/d</span></p>
                          <div className="text-xs text-slate-400">Deficit: {nutrientResults.deficitP.toFixed(1)} kg</div>
                        </div>
                      </div>

                      {/* Option 1: Urea + Phosphoric Acid */}
                      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                          <p className="font-bold text-sm text-slate-800">Option 1: Urea + Phosphoric Acid</p>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-slate-500">Urea Dosing</p>
                            <p className="font-bold text-emerald-700">{nutrientResults.opt1.urea.toFixed(1)} kg/day</p>
                            <p className="text-xs text-slate-400 mt-1">Tank: {nutrientResults.opt1.ureaTank} m³</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Phos. Acid</p>
                            <p className="font-bold text-amber-600">{nutrientResults.opt1.acid.toFixed(1)} kg/day</p>
                            <p className="text-xs text-slate-400 mt-1">Tank: {nutrientResults.opt1.acidTank} m³</p>
                          </div>
                        </div>
                      </div>

                      {/* Option 2: Urea + DAP */}
                      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                          <p className="font-bold text-sm text-slate-800">Option 2: Urea + DAP</p>
                          <span className="text-[10px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Cost Effective</span>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-slate-500">Urea Dosing</p>
                            <p className="font-bold text-emerald-700">{nutrientResults.opt2.urea.toFixed(1)} kg/day</p>
                            <p className="text-xs text-slate-400 mt-1">Tank: {nutrientResults.opt2.ureaTank} m³</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">DAP Dosing</p>
                            <p className="font-bold text-blue-600">{nutrientResults.opt2.dap.toFixed(1)} kg/day</p>
                            <p className="text-xs text-slate-400 mt-1">Tank: {nutrientResults.opt2.dapTank} m³</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'proposal' && (
            <ProposalTabContent />
          )}
        </div>
      </div>
    </section>
  );
};

const Calculators = () => (
  <ProposalGeneratorPasswordProvider>
    <CalculatorsContent />
  </ProposalGeneratorPasswordProvider>
);

export default Calculators;