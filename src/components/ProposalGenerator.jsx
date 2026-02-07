
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, AlertTriangle, AlertCircle, FileText, Download, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Step2 from '@/components/ProposalGeneratorStep2';

import {
  calculatePolymerDosing,
  calculateCoagulantDosing
} from '@/utils/engineeringCalculations';

import { generateProposalWord } from '@/utils/generateProposalWord';

import { useAuth } from '@/context/AuthContext';

// --- Shared Components ---

const SectionHeader = ({ title }) => (
  <h3 className="text-lg font-bold text-slate-800 bg-slate-100 p-3 rounded-md mb-4 border-l-4 border-emerald-500 mt-6">
    {title}
  </h3>
);

const InputField = ({ label, value, onChange, placeholder, type = "text", disabled = false, min, max, error }) => (
  <div className="mb-3 relative group">
    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
      {label}
      {error && <span className="text-red-500 text-[10px] font-normal">{error}</span>}
    </label>
    <div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min={min}
        max={max}
        className={`w-full px-3 py-1.5 border ${error ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-300'} rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-gray-900 
          ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, disabled = false, error }) => (
  <div className="mb-3 relative group">
    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
      {label}
      {error && <span className="text-red-500 text-[10px] font-normal">{error}</span>}
    </label>
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-1.5 border ${error ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-300'} rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none bg-white text-gray-900 
          ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  </div>
);

const MultiSelectCheckbox = ({ label, options, selected, onChange }) => {
  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const toggleAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange(options);
    }
  };

  return (
    <div className="mb-4 relative group">
      <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center justify-between">
        {label}
      </label>
      <div className="border border-slate-200 rounded p-3 bg-white max-h-60 overflow-y-auto">
        <div className="flex items-center mb-2 pb-2 border-b border-slate-100">
          <input
            type="checkbox"
            checked={selected.length === options.length && options.length > 0}
            onChange={toggleAll}
            className="w-4 h-4 accent-emerald-600 mr-2"
          />
          <span className="text-sm font-semibold text-slate-700">Select All</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {options.map(option => (
            <div key={option} className="flex items-center">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="w-4 h-4 accent-emerald-600 mr-2"
              />
              <span className="text-sm text-slate-600">{option}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WarningBox = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 text-sm text-amber-800">
      <div className="flex items-center font-bold mb-1">
        <AlertTriangle className="w-4 h-4 mr-2" />
        Process Warnings (Pre-treatment Required)
      </div>
      <ul className="list-disc pl-5 space-y-1">
        {warnings.map((w, i) => <li key={i}>{w}</li>)}
      </ul>
    </div>
  );
};

const ValidationIcon = ({ type, message }) => {
  if (!type) return null;
  if (type === 'alarm') {
    return (
      <span className="inline-flex items-center ml-2 text-red-600" title={message}>
        <AlertCircle className="w-4 h-4" />
      </span>
    );
  }
  if (type === 'warning') {
    return (
      <span className="inline-flex items-center ml-2 text-amber-600" title={message}>
        <AlertTriangle className="w-4 h-4" />
      </span>
    );
  }
  return null;
};

// ... Step1 Component ...
const Step1 = ({
  clientInfo, setClientInfo, params, setParams, anaerobicFeedParams, setAnaerobicFeedParams,
  warnings, guarantees, setGuarantees, validations, techOverview, setTechOverview,
  processDesc, setProcessDesc, instruments, setInstruments, manualInstrumentRanges, setManualInstrumentRanges,
  selectedSections, setSelectedSections, filterGuarantees, setFilterGuarantees,
  uvGuarantees, setUVGuarantees, roGuarantees, setROGuarantees,
  anaerobicTank, setAnaerobicTank,
  proposalDetails, setProposalDetails
}) => {

  const calculateTCOD = (paramList) => {
    const sCOD = parseFloat(paramList.find(p => p.name === 'sCOD')?.value || 0);
    const TSS = parseFloat(paramList.find(p => p.name === 'TSS')?.value || 0);
    const FOG = parseFloat(paramList.find(p => p.name === 'FOG')?.value || 0);
    return (sCOD + TSS + (1.5 * FOG)).toFixed(0);
  };

  const calculateBODLoad = (flow, bod) => {
    const f = parseFloat(flow || 0);
    const b = parseFloat(bod || 0);
    return (f * b / 1000).toFixed(2);
  };

  const calculateNLoad = (flow, n) => {
    const f = parseFloat(flow || 0);
    const nVal = parseFloat(n || 0);
    return (f * nVal / 1000).toFixed(2);
  };

  const calculatePLoad = (flow, p) => {
    const f = parseFloat(flow || 0);
    const pVal = parseFloat(p || 0);
    return (f * pVal / 1000).toFixed(2);
  };

  // Generate Anaerobic Diameter Options (1.0 to 40.0 with 0.1 increments)
  const diameterOptions = Array.from({ length: 391 }, (_, i) => (1 + i * 0.1).toFixed(1));

  // Generate Anaerobic Height Options (6 to 30 with 0.1 increments)
  const heightOptions = Array.from({ length: 241 }, (_, i) => (6 + i * 0.1).toFixed(1));

  useEffect(() => {
    const inletFlow = parseFloat(params.find(p => p.name === 'Flow')?.value || 0);
    const inletBOD = parseFloat(params.find(p => p.name === 'BOD')?.value || 0);
    const inletSCOD = parseFloat(params.find(p => p.name === 'sCOD')?.value || 0);

    const anaFlow = parseFloat(anaerobicFeedParams.find(p => p.name === 'Flow')?.value || 0);
    const anaBOD = parseFloat(anaerobicFeedParams.find(p => p.name === 'BOD')?.value || 0);
    const anaSCOD = parseFloat(anaerobicFeedParams.find(p => p.name === 'sCOD')?.value || 0);

    // New Params for N and P
    const inletN = parseFloat(params.find(p => p.name === 'NH4-N')?.value || 0);
    const inletP = parseFloat(params.find(p => p.name === 'PO4-P')?.value || 0);
    const anaN = parseFloat(anaerobicFeedParams.find(p => p.name === 'NH4-N')?.value || 0);
    const anaP = parseFloat(anaerobicFeedParams.find(p => p.name === 'PO4-P')?.value || 0);

    const newInletBODLoad = calculateBODLoad(inletFlow, inletBOD);
    const newAnaBODLoad = calculateBODLoad(anaFlow, anaBOD);

    // Reuse generic load calc logic: (Flow * Val) / 1000
    const newInletSCODLoad = ((inletFlow * inletSCOD) / 1000).toFixed(2);
    const newAnaSCODLoad = ((anaFlow * anaSCOD) / 1000).toFixed(2);

    // Calculate N and P loads
    const newInletNLoad = calculateNLoad(inletFlow, inletN);
    const newAnaNLoad = calculateNLoad(anaFlow, anaN);
    const newInletPLoad = calculatePLoad(inletFlow, inletP);
    const newAnaPLoad = calculatePLoad(anaFlow, anaP);

    if (
      clientInfo.inletBODLoad !== newInletBODLoad ||
      clientInfo.anaerobicBODLoad !== newAnaBODLoad ||
      clientInfo.inletSCODLoad !== newInletSCODLoad ||
      clientInfo.anaerobicSCODLoad !== newAnaSCODLoad ||
      clientInfo.inletNLoad !== newInletNLoad ||
      clientInfo.anaerobicNLoad !== newAnaNLoad ||
      clientInfo.inletPLoad !== newInletPLoad ||
      clientInfo.anaerobicPLoad !== newAnaPLoad
    ) {
      setClientInfo(prev => ({
        ...prev,
        inletBODLoad: newInletBODLoad,
        anaerobicBODLoad: newAnaBODLoad,
        inletSCODLoad: newInletSCODLoad,
        anaerobicSCODLoad: newAnaSCODLoad,
        inletNLoad: newInletNLoad,
        anaerobicNLoad: newAnaNLoad,
        inletPLoad: newInletPLoad,
        anaerobicPLoad: newAnaPLoad
      }));
    }
  }, [params, anaerobicFeedParams]);

  // Auto-calculate COD Load for Paper Industry
  useEffect(() => {
    if (clientInfo.industry !== 'Paper') return;

    const cap = parseFloat(clientInfo.productionCapacity || 0);
    const spec = parseFloat(clientInfo.specificCOD || 0);
    // Formula: Capacity (TPD) * Specific COD (kg/ton) = kg/day
    const calculated = (cap * spec).toFixed(2);

    if (clientInfo.calcCODLoad !== calculated) {
      setClientInfo(prev => ({ ...prev, calcCODLoad: calculated }));
    }
  }, [clientInfo.productionCapacity, clientInfo.specificCOD, clientInfo.industry]);

  const handleParamChange = (id, newValue) => {
    setParams(prevParams => {
      const updatedParams = prevParams.map(p => {
        if (p.id === id) {
          return { ...p, value: newValue };
        }
        return p;
      });

      const paramName = prevParams.find(p => p.id === id)?.name;
      if (['sCOD', 'TSS', 'FOG'].includes(paramName)) {
        const tCODVal = calculateTCOD(updatedParams);
        return updatedParams.map(p => p.name === 'tCOD' ? { ...p, value: tCODVal } : p);
      }
      return updatedParams;
    });
  };

  const handleAnaerobicParamChange = (id, newValue) => {
    setAnaerobicFeedParams(prevParams => {
      const updatedParams = prevParams.map(p => {
        if (p.id === id) {
          return { ...p, value: newValue };
        }
        return p;
      });

      const paramName = prevParams.find(p => p.id === id)?.name;
      if (['sCOD', 'TSS', 'FOG'].includes(paramName)) {
        const tCODVal = calculateTCOD(updatedParams);
        return updatedParams.map(p => p.name === 'tCOD' ? { ...p, value: tCODVal } : p);
      }
      return updatedParams;
    });
  };

  const techOverviewOptions = ['ELAR', 'Aerobic Tank', 'Secondary Clarifier'];
  const processDescOptions = [
    'DAF Unit',
    'Pre-Acidification Tank',
    'ELAR',
    'Biogas Holder and Flare System',
    'Biomass Holding Tank',
    'Aeration Tank',
    'Secondary Clarifier',
    'Sludge Handling System'
  ];

  const sectionOptions = ['Anaerobic Section', 'Aerobic Section', 'Filter Section', 'UV Section', 'RO Permeate Section', 'Important Considerations'];

  const instrumentOptions = [
    'Flow transmitter - ELAR feed line - [Manual] - 1',
    'Level transmitter - Conditioning tank - 0-10 mtr',
    'pH transmitter - ELAR feed line - 0-14',
    'Temp. transmitter - ELAR feed line - 0-100 degree celsius',
    'Level transmitter - ELAR tank - 0-30 mtr',
    'pH transmitter - ELAR effluent line - 0-14',
    'Temp. transmitter - ELAR effluent line - 0-100 degree celsius',
    'ORP meter - ELAR feed line - 100 - -1000 mv',
    'Biogas flow transmitter - Biogas line - [Manual] - 1',
    'Biogas pressure transmitter - ELAR roof - 0-100 mbar',
    'Level transmitter - Biogas holder - 0-10 mtr',
    'DO analyser - Aeration tank - 0-10 mg/l',
    'Flow transmitter - Clear water tank - 0-350 m³/hr',
    'Level Transmitter - Clear water tank - 0-10 m',
    'Flow transmitter - Screw press feedline - 0-40 m³/hr',
    'Pressure gauge - All pumps discharge and biogas dome - (blank)'
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

      <SectionHeader title="Client Details" />
      <div className="grid md:grid-cols-2 gap-4">
        <InputField label="Client Name" value={clientInfo.clientName} onChange={v => setClientInfo(prev => ({ ...prev, clientName: v }))} />
        <InputField label="Proposal Title" value={clientInfo.proposalTitle} onChange={v => setClientInfo(prev => ({ ...prev, proposalTitle: v }))} placeholder="e.g. WASTEWATER TREATMENT PLANT" />
        <InputField label="Address" value={clientInfo.address} onChange={v => setClientInfo(prev => ({ ...prev, address: v }))} placeholder="City, State" />
        <InputField label="Contact Person" value={clientInfo.contactPerson} onChange={v => setClientInfo(prev => ({ ...prev, contactPerson: v }))} />
        <InputField label="Designation" value={clientInfo.designation} onChange={v => setClientInfo(prev => ({ ...prev, designation: v }))} />
        <InputField label="Phone" value={clientInfo.phone} onChange={v => setClientInfo(prev => ({ ...prev, phone: v }))} />
        <InputField label="Email" value={clientInfo.email} onChange={v => setClientInfo(prev => ({ ...prev, email: v }))} type="email" />

        <SelectField label="Industry Type" value={clientInfo.industry} onChange={v => setClientInfo(prev => ({ ...prev, industry: v }))} options={['Paper', 'Starch', 'Ethanol', 'Potato', 'Fish', 'Pharma', 'Other']} />
        <InputField label="Raw Material" value={clientInfo.rawMaterial} onChange={v => setClientInfo(prev => ({ ...prev, rawMaterial: v }))} />
        <InputField label="Production Capacity (TPD)" value={clientInfo.productionCapacity} onChange={v => setClientInfo(prev => ({ ...prev, productionCapacity: v }))} type="number" />
        <InputField label="Raw Material Consumed" value={clientInfo.rawMaterialQty} onChange={v => setClientInfo(prev => ({ ...prev, rawMaterialQty: v }))} placeholder="e.g. 500 Tons/day" />
        <InputField label="Final Products" value={clientInfo.finalProducts} onChange={v => setClientInfo(prev => ({ ...prev, finalProducts: v }))} />

        {clientInfo.industry === 'Paper' && (
          <div className="md:col-span-2 grid md:grid-cols-3 gap-4 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <div className="mb-3 relative group">
              <label className="block text-xs font-semibold text-emerald-800 mb-1 flex items-center justify-between">
                Specific COD (kg/ton)
              </label>
              <div>
                <input
                  type="number"
                  min="1" max="100"
                  value={clientInfo.specificCOD}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, specificCOD: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-emerald-300 rounded text-sm focus:ring-1 focus:ring-emerald-500 text-gray-900"
                />
              </div>
            </div>
            <InputField label="Loop Water sCOD (mg/l)" value={clientInfo.loopWaterCOD} onChange={v => setClientInfo(prev => ({ ...prev, loopWaterCOD: v }))} type="number" />
            <InputField label="Calculated COD Load (kg/day)" value={clientInfo.calcCODLoad} onChange={() => { }} disabled />
          </div>
        )}
      </div>

      <SectionHeader title="Design Basis (Influent Parameters)" />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300 text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-3 py-2 text-left font-bold">Parameter (Unit)</th>
              <th className="border border-slate-300 px-3 py-2 text-left font-bold">Inlet Water Characteristics</th>
              <th className="border border-slate-300 px-3 py-2 text-left font-bold">Anaerobic Feed Water Characteristics</th>
            </tr>
          </thead>
          <tbody>
            {params.map(p => {
              const anaerobicParam = anaerobicFeedParams.find(ap => ap.id === p.id);
              const validation = validations.find(v => v.paramId === p.id);
              const isLockedCalc = p.name === 'tCOD';

              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="border border-slate-300 px-3 py-2 font-semibold text-slate-700">
                    {p.name} ({p.unit})
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    <div>
                      <input
                        type="text"
                        value={p.value}
                        onChange={(e) => handleParamChange(p.id, e.target.value)}
                        className={`w-full border border-slate-200 rounded px-2 py-1 text-sm text-gray-900 
                          ${(isLockedCalc) ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                        disabled={(p.id === 1 && clientInfo.industry === 'Paper') || isLockedCalc}
                        title={isLockedCalc ? "Auto-calculated: sCOD + TSS + (1.5 × FOG)" : ""}
                      />
                    </div>
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    <div>
                      <input
                        type="text"
                        value={anaerobicParam?.value || ''}
                        onChange={(e) => handleAnaerobicParamChange(p.id, e.target.value)}
                        className={`w-full border border-slate-200 rounded px-2 py-1 text-sm text-gray-900 
                          ${(isLockedCalc) ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                        disabled={anaerobicParam?.autoCalculated || isLockedCalc}
                        title={isLockedCalc ? "Auto-calculated: sCOD + TSS + (1.5 × FOG)" : ""}
                      />
                      {validation && <ValidationIcon type={validation.type} message={validation.message} />}
                    </div>
                  </td>
                </tr>
              );
            })}

            <tr className="bg-blue-50">
              <td className="border border-slate-300 px-3 py-2 font-bold text-slate-700">kg sCOD/day</td>
              <td className="border border-slate-300 px-3 py-2">
                <input
                  type="text"
                  value={clientInfo.inletSCODLoad || ''}
                  disabled
                  className="w-full border border-slate-200 rounded px-2 py-1 text-sm bg-slate-100 text-slate-700"
                />
              </td>
              <td className="border border-slate-300 px-3 py-2">
                <input
                  type="text"
                  value={clientInfo.anaerobicSCODLoad || ''}
                  disabled
                  className="w-full border border-slate-200 rounded px-2 py-1 text-sm bg-slate-100 text-slate-700"
                />
              </td>
            </tr>

            <tr className="bg-blue-50">
              <td className="border border-slate-300 px-3 py-2 font-bold text-slate-700">kg BOD/day</td>
              <td className="border border-slate-300 px-3 py-2">
                <input
                  type="text"
                  value={clientInfo.inletBODLoad || ''}
                  disabled
                  className="w-full border border-slate-200 rounded px-2 py-1 text-sm bg-slate-100 text-slate-700"
                />
              </td>
              <td className="border border-slate-300 px-3 py-2">
                <input
                  type="text"
                  value={clientInfo.anaerobicBODLoad || ''}
                  disabled
                  className="w-full border border-slate-200 rounded px-2 py-1 text-sm bg-slate-100 text-slate-700"
                />
              </td>
            </tr>

            <tr className="bg-blue-50">
              <td className="border border-slate-300 px-3 py-2 font-bold text-slate-700">kg N/day</td>
              <td className="border border-slate-300 px-3 py-2">
                <input
                  type="text"
                  value={clientInfo.inletNLoad || ''}
                  disabled
                  className="w-full border border-slate-200 rounded px-2 py-1 text-sm bg-slate-100 text-slate-700"
                />
              </td>
              <td className="border border-slate-300 px-3 py-2">
                <input
                  type="text"
                  value={clientInfo.anaerobicNLoad || ''}
                  disabled
                  className="w-full border border-slate-200 rounded px-2 py-1 text-sm bg-slate-100 text-slate-700"
                />
              </td>
            </tr>

            <tr className="bg-blue-50">
              <td className="border border-slate-300 px-3 py-2 font-bold text-slate-700">kg P/day</td>
              <td className="border border-slate-300 px-3 py-2">
                <input
                  type="text"
                  value={clientInfo.inletPLoad || ''}
                  disabled
                  className="w-full border border-slate-200 rounded px-2 py-1 text-sm bg-slate-100 text-slate-700"
                />
              </td>
              <td className="border border-slate-300 px-3 py-2">
                <input
                  type="text"
                  value={clientInfo.anaerobicPLoad || ''}
                  disabled
                  className="w-full border border-slate-200 rounded px-2 py-1 text-sm bg-slate-100 text-slate-700"
                />
              </td>
            </tr>

          </tbody>
        </table>
      </div>



      <WarningBox warnings={warnings} />

      <SectionHeader title="Section Selection" />
      <MultiSelectCheckbox
        label="Select Proposal Sections"
        options={sectionOptions}
        selected={selectedSections}
        onChange={setSelectedSections}
      />

      <SectionHeader title="Technology & Process Selection" />
      <div className="grid md:grid-cols-2 gap-6 mb-4">
        <MultiSelectCheckbox
          label="Technology Overview Selection"
          options={techOverviewOptions}
          selected={techOverview}
          onChange={setTechOverview}
        />
        <MultiSelectCheckbox
          label="Process Description Selection"
          options={processDescOptions}
          selected={processDesc}
          onChange={setProcessDesc}
        />
      </div>

      <SectionHeader title="Instrument Selection" />
      <div className="mb-4">
        <MultiSelectCheckbox
          label="Instruments (Preferred to go with E&H)"
          options={instrumentOptions}
          selected={instruments}
          onChange={setInstruments}
        />

        {instruments.some(inst => inst.includes('[Manual]')) && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="font-bold text-sm text-yellow-800 mb-2">Manual Instrument Ranges</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {instruments.filter(inst => inst.includes('Flow transmitter - ELAR feed line - [Manual]')).map(inst => (
                <div key={inst} className="bg-white p-3 rounded border border-yellow-100">
                  <InputField
                    label="Range for Flow transmitter (ELAR feed line)"
                    value={manualInstrumentRanges[inst] || ''}
                    onChange={v => setManualInstrumentRanges(prev => ({ ...prev, [inst]: v }))}
                    placeholder="e.g. 0-400 m³/hr"
                  />
                </div>
              ))}
              {instruments.filter(inst => inst.includes('Biogas flow transmitter - Biogas line - [Manual]')).map(inst => (
                <div key={inst} className="bg-white p-3 rounded border border-yellow-100">
                  <InputField
                    label="Range for Biogas flow transmitter (Biogas line)"
                    value={manualInstrumentRanges[inst] || ''}
                    onChange={v => setManualInstrumentRanges(prev => ({ ...prev, [inst]: v }))}
                    placeholder="e.g. 0-1500 Nm³/hr"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SectionHeader title="Performance Guarantees" />
      <div className="space-y-6">
        {selectedSections.includes('Anaerobic Section') && (
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h4 className="font-bold text-emerald-800 mb-3">Anaerobic Section</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <InputField label="Anaerobic sCOD Removal (%)" value={guarantees.anaerobicSCODEff} onChange={v => setGuarantees(prev => ({ ...prev, anaerobicSCODEff: v }))} type="number" />
              <InputField label="Anaerobic BOD Removal (%)" value={guarantees.anaerobicBODEff} onChange={v => setGuarantees(prev => ({ ...prev, anaerobicBODEff: v }))} type="number" />
              <InputField label="Biogas Factor (m³/kg COD)" value={guarantees.biogasFactor} onChange={v => setGuarantees(prev => ({ ...prev, biogasFactor: v }))} placeholder="0.40 - 0.45" />
            </div>
          </div>
        )}

        {selectedSections.includes('Aerobic Section') && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3">Aerobic Section (Secondary Clarifier Outlet)</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <InputField label="Outlet sCOD (mg/l)" value={guarantees.outletCOD} onChange={v => setGuarantees(prev => ({ ...prev, outletCOD: v }))} />
              <InputField label="Outlet TSS (mg/l)" value={guarantees.outletTSS} onChange={v => setGuarantees(prev => ({ ...prev, outletTSS: v }))} />
              <InputField label="Outlet BOD (mg/l)" value={guarantees.outletBOD} onChange={v => setGuarantees(prev => ({ ...prev, outletBOD: v }))} />
            </div>
          </div>
        )}

        {selectedSections.includes('Filter Section') && (
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="font-bold text-indigo-800 mb-3">Filter Outlet</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <InputField label="Filter outlet sCOD (mg/l)" value={filterGuarantees.outletSCOD} onChange={v => setFilterGuarantees(prev => ({ ...prev, outletSCOD: v }))} />
              <InputField label="Filter outlet TSS (mg/l)" value={filterGuarantees.outletTSS} onChange={v => setFilterGuarantees(prev => ({ ...prev, outletTSS: v }))} />
              <InputField label="Filter outlet BOD (mg/l)" value={filterGuarantees.outletBOD} onChange={v => setFilterGuarantees(prev => ({ ...prev, outletBOD: v }))} />
              <InputField label="Filter outlet Turbidity (NTU)" value={filterGuarantees.outletTurbidity} onChange={v => setFilterGuarantees(prev => ({ ...prev, outletTurbidity: v }))} />
              <InputField label="Filter outlet Bacterial count" value={filterGuarantees.outletBacterialCount} onChange={v => setFilterGuarantees(prev => ({ ...prev, outletBacterialCount: v }))} />
            </div>
          </div>
        )}

        {selectedSections.includes('UV Section') && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-bold text-purple-800 mb-3">UV Outlet</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <InputField label="Bacterial Count" value={uvGuarantees.bacterialCount} onChange={v => setUVGuarantees(prev => ({ ...prev, bacterialCount: v }))} />
              <InputField label="sCOD (mg/l)" value={uvGuarantees.outletSCOD} onChange={v => setUVGuarantees(prev => ({ ...prev, outletSCOD: v }))} />
              <InputField label="TDS (mg/l)" value={uvGuarantees.outletTDS} onChange={v => setUVGuarantees(prev => ({ ...prev, outletTDS: v }))} />
              <InputField label="TSS (mg/l)" value={uvGuarantees.outletTSS} onChange={v => setUVGuarantees(prev => ({ ...prev, outletTSS: v }))} />
            </div>
          </div>
        )}

        {selectedSections.includes('RO Permeate Section') && (
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-bold text-orange-800 mb-3">RO Permeate</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <InputField label="sCOD (mg/l)" value={roGuarantees.outletSCOD} onChange={v => setROGuarantees(prev => ({ ...prev, outletSCOD: v }))} />
              <InputField label="BOD (mg/l)" value={roGuarantees.outletBOD} onChange={v => setROGuarantees(prev => ({ ...prev, outletBOD: v }))} />
              <InputField label="TDS (mg/l)" value={roGuarantees.outletTDS} onChange={v => setROGuarantees(prev => ({ ...prev, outletTDS: v }))} />
              <InputField label="TSS (mg/l)" value={roGuarantees.outletTSS} onChange={v => setROGuarantees(prev => ({ ...prev, outletTSS: v }))} />
              <InputField label="pH" value={roGuarantees.outletPH} onChange={v => setROGuarantees(prev => ({ ...prev, outletPH: v }))} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProposalGenerator = () => {
  const { toast } = useToast();
  const { user } = useAuth(); // Get authenticated user
  // --- State ---
  const [step, setStep] = useState(1);

  const [warnings, setWarnings] = useState([]);
  const [validations, setValidations] = useState([]);
  // const [generatedData, setGeneratedData] = useState(null); // Removed generatedData state

  // --- State Definitions ---
  const [clientInfo, setClientInfo] = useState({
    clientName: '', proposalTitle: '', industry: 'Paper', rawMaterial: '', productionCapacity: '', rawMaterialQty: '', finalProducts: '', toxicElements: '', address: '', specificCOD: '50', loopWaterCOD: '1500', calcCODLoad: '', calcFlow: '', inletSCODLoad: '', anaerobicSCODLoad: '', inletBODLoad: '', anaerobicBODLoad: '', inletNLoad: '', anaerobicNLoad: '', inletPLoad: '', anaerobicPLoad: '', tssRemovedKg: '',
    contactPerson: '', designation: '', phone: '', email: ''
  });

  const [proposalDetails, setProposalDetails] = useState({
    invoiceNo: '',
    invoiceDate: '',
    poReference: '',
    poDate: '',
    ewayBillNo: '',
    ewayBillDate: '',
    billToGst: '',
    billToStateCode: '',
    shipToName: '',
    shipToAddress: '',
    shipToGst: ''
  });

  const [selectedSections, setSelectedSections] = useState(['Anaerobic Section', 'Aerobic Section', 'Filter Section', 'UV Section', 'RO Permeate Section', 'Important Considerations']);

  // State for manual instrument ranges
  const [manualInstrumentRanges, setManualInstrumentRanges] = useState({});

  const [params, setParams] = useState([
    { id: 1, name: 'Flow', unit: 'm3/day', value: '' },
    { id: 2, name: 'pH', unit: '-', value: '' },
    { id: 3, name: 'Temperature', unit: '°C', value: '' },
    { id: 4, name: 'TSS', unit: 'mg/l', value: '' },
    { id: 5, name: 'TDS', unit: 'mg/l', value: '' },
    { id: 6, name: 'VFA', unit: 'meq/l', value: '' },
    { id: 7, name: 'Calcium', unit: 'mg/l', value: '' },
    { id: 8, name: 'Sulphate', unit: 'mg/l', value: '' },
    { id: 9, name: 'tCOD', unit: 'mg/l', value: '' },
    { id: 10, name: 'BOD', unit: 'mg/l', value: '' },
    { id: 11, name: 'sCOD', unit: 'mg/l', value: '' },
    { id: 12, name: 'Chlorides', unit: 'mg/l', value: '' },
    { id: 13, name: 'ORP', unit: 'mV', value: '' },
    { id: 14, name: 'Toxic elements', unit: 'mg/l', value: '' },
    { id: 15, name: 'NH4-N', unit: 'mg/l', value: '' },
    { id: 16, name: 'PO4-P', unit: 'mg/l', value: '' },
    { id: 17, name: 'FOG', unit: 'mg/l', value: '' }
  ]);

  const [anaerobicFeedParams, setAnaerobicFeedParams] = useState(params.map(p => ({ ...p, autoCalculated: false })));

  const [techOverview, setTechOverview] = useState(['ELAR', 'Aerobic Tank', 'Secondary Clarifier']);
  const [processDesc, setProcessDesc] = useState([
    'DAF Unit',
    'Pre-Acidification Tank',
    'ELAR',
    'Biogas Holder and Flare System',
    'Biomass Holding Tank',
    'Aeration Tank',
    'Secondary Clarifier',
    'Sludge Handling System'
  ]);

  const [instruments, setInstruments] = useState([]);

  const [importantConsiderationsPoints, setImportantConsiderationsPoints] = useState([
    "Client has to ensure strict adherence to the limiting parameters like pH, TSS, Temperature etc.",
    "Anaerobic reactor performance depends on the VFA, Alkalinity, pH and Temperature inside the reactor.",
    "Biogas generation depends on the COD reduction and VFA profile.",
    "Acid sizing chemicals (Rosins/Alum) should be minimized or substituted as they inhibit anaerobic activity.",
    "Oxidizing biocides (Hypo, Chlorine Dioxide, Bromine etc.) are strictly prohibited.",
    "Mill must ensure discharge is approx 200 m3/day and fresh water intake is restricted to 800 m3/day.",
    "Approx 5,300 m3/day treated water to be recycled to pulping section.",
    "Mill retention time should be less than 24 hours to prevent VFA generation in the mill loop itself."
  ]);

  const [guarantees, setGuarantees] = useState({
    anaerobicSCODEff: '80', anaerobicBODEff: '90', biogasFactor: '0.42', outletCOD: '250', outletTSS: '50', outletBOD: '30'
  });

  const [filterGuarantees, setFilterGuarantees] = useState({
    outletSCOD: '', outletTSS: '', outletBOD: '', outletTurbidity: '', outletBacterialCount: ''
  });
  const [uvGuarantees, setUVGuarantees] = useState({
    bacterialCount: '', outletSCOD: '', outletTDS: '', outletTSS: ''
  });
  const [roGuarantees, setROGuarantees] = useState({
    outletSCOD: '', outletBOD: '', outletTDS: '', outletTSS: '', outletPH: ''
  });

  // NEW: Performance Specs State
  const [performanceSpecs, setPerformanceSpecs] = useState({
    anaFlow: '',
    aeroFlow: '',
    anaFeedSCOD: '',
    anaFeedBOD: '',
    aeroFeedSCOD: '',
    aeroFeedBOD: '',
    anaSCODEff: '',
    anaBODEff: '',
    aeroSCODEff: '75', // Default assumption
    aeroBODEff: '85', // Default assumption
    biogasFactor: ''
  });

  const [performanceResults, setPerformanceResults] = useState({
    kgSCODRemovedAna: 0,
    kgBODRemovedAna: 0,
    kgSCODRemovedAero: 0,
    kgBODRemovedAero: 0,
    biogasGen: 0
  });

  // Sludge Calculation State
  const [sludgeCalculationDetails, setSludgeCalculationDetails] = useState({
    primaryRequired: true,
    dafRequired: true,
    secondaryRequired: true,
    primarySludge: '0.00',
    primaryConsistency: '',
    dafSludge: '0.00',
    dafConsistency: '',
    secondarySludge: '0.00',
    secondaryConsistency: '',
    totalSludge: '0.00',
    finalConsistency: '0.00'
  });

  // Filters State
  const [filtersSpecs, setFiltersSpecs] = useState({
    filterFeedPump: { make: 'Hydroprokav', moc: 'CI', type: 'Positive Displacement', qty: '1' }
  });

  // MGF State (New)
  const [mgfSpecs, setMgfSpecs] = useState({
    operatingHours: '24',
    filtrationRate: '10',
    diameter: '1',
    backwashRate: '15',
    backwashTime: '10',
    airBackwashRate: '35'
  });

  const [mgfCalculations, setMgfCalculations] = useState({
    designFlow: '0.00',
    filterArea: '0.00',
    areaReq: '0.00',
    numMGF: 0,
    actualArea: '0.00',
    backwashFlow: '0.00',
    backwashPumpCap: '0.00',
    airReq: '0.00'
  });

  // ACF State (New)
  const [acfSpecs, setAcfSpecs] = useState({
    operatingHours: '24',
    filtrationRate: '10',
    diameter: '1',
    backwashRate: '8',
    backwashTime: '10'
  });

  const [acfCalculations, setAcfCalculations] = useState({
    designFlow: '0.00',
    filterArea: '0.00',
    areaReq: '0.00',
    numACF: 0,
    actualArea: '0.00',
    backwashFlow: '0.00',
    backwashPumpCap: '0.00'
  });

  // Effect to initialize performance specs when moving to Step 2
  useEffect(() => {
    if (step === 2) {
      const anaFlowVal = anaerobicFeedParams.find(p => p.name === 'Flow')?.value || '';
      const anaSCODVal = anaerobicFeedParams.find(p => p.name === 'sCOD')?.value || '';
      const anaBODVal = anaerobicFeedParams.find(p => p.name === 'BOD')?.value || '';
      const anaSCODEffVal = guarantees.anaerobicSCODEff || '80';
      const anaBODEffVal = guarantees.anaerobicBODEff || '90';
      const biogasFactorVal = guarantees.biogasFactor || '0.42';

      // Only initialize if empty (preserve user edits)
      setPerformanceSpecs(prev => {
        if (prev.anaFlow) return prev;
        return {
          ...prev,
          anaFlow: anaFlowVal,
          aeroFlow: anaFlowVal, // Default assumption, user can change
          anaFeedSCOD: anaSCODVal,
          anaFeedBOD: anaBODVal,
          aeroFeedSCOD: '', // User to input or calculate? Left blank for explicit input as per requirement
          aeroFeedBOD: '',
          anaSCODEff: anaSCODEffVal,
          anaBODEff: anaBODEffVal,
          biogasFactor: biogasFactorVal
        };
      });
    }
  }, [step, anaerobicFeedParams, guarantees]);

  // Effect to populate company details from User Profile
  useEffect(() => {
    if (user?.user_metadata) {
      setProposalDetails(prev => ({
        ...prev,
        // Map user metadata to proposal details if needed by PDF
        // Note: PDF generation might read 'user' directly or we store it here.
        // Storing it here effectively "caches" it for the session.
        companyName: user.user_metadata.company_name || '',
        companyGst: user.user_metadata.company_gst || '',
        companyAddress: user.user_metadata.company_address || '',
        companyPhone: user.user_metadata.company_phone || '',
        companyEmail: user.user_metadata.company_email || ''
      }));
    }
  }, [user]);

  const [anaerobicTank, setAnaerobicTank] = useState({
    required: true, capacity: '', diameter: '15.0', height: '20', vlr: '', type: 'Vertical', moc: 'MSEP', qty: '1', scope: 'EDI', selectedSize: '', selectedDiameter: '', selectedHeight: ''
  });

  const [standPipe, setStandPipe] = useState({
    required: true, capacity: '2 m3', type: 'Vertical', moc: 'MSEP', qty: '1', dimensions: '', scope: 'EDI'
  });

  const [biogasHolder, setBiogasHolder] = useState({
    required: true, capacity: '', moc: 'MSEP', make: 'Local', qty: '1', dimensions: '', retentionTime: '12 mins', scope: 'EDI'
  });

  const [biogasCivil, setBiogasCivil] = useState({
    required: true, capacity: '', moc: 'RCC', type: 'Floating Dome', qty: '1', dimensions: '', scope: 'Client'
  });

  const [screens, setScreens] = useState({ required: true, capacity: '', type: 'Fine', moc: 'SS304', operation: 'Auto', poreSize: '2mm', channelDim: '', screenDim: '', scope: 'EDI' });

  const [preAcid, setPreAcid] = useState({
    required: true,
    capacity: '',
    moc: 'RCC',
    agitator: 'Yes',
    agitatorType: 'Submersible',
    power: '',
    agitatorMake: 'Sulzer/Ceecons/EQT',
    agitatorMoc: 'SS316',
    agitatorQuantity: '1',
    scope: 'Client'
  });

  const [anaerobicFeedPump, setAnaerobicFeedPump] = useState({ required: true, capacity: '', material: 'CI/SS304', type: 'Centrifugal Semi-open', qty: '2 (1W+1S)', make: 'KSB/Kirloskar/Johnson/Equivalent', head: '20', power: '', scope: 'EDI' });
  const [biomassPump, setBiomassPump] = useState({ required: true, capacity: '10', head: '24m', moc: 'Nitrile rubber', type: 'Positive displacement pump', qty: '1', make: 'Netch/Hydroprokav/EQT', scope: 'EDI' });
  const [biogasFlare, setBiogasFlare] = useState({ required: true, capacity: '', height: '10', head: '10m', moc: 'MS Structure / SS304 Line', make: 'Alliance thermal/Super combustion/Tectiko', qty: '1', scope: 'EDI' });
  const [biomassHoldingTank, setBiomassHoldingTank] = useState({ required: true, capacity: '', moc: 'MSEP', dimension: '', type: 'Vertical', qty: '1', shape: 'Rectangular', height: '4', width: '', scope: 'EDI' });

  const [aerationTank, setAerationTank] = useState({ required: true, capacity: '', moc: 'RCC', dimension: '', type: 'Extended Aeration', qty: '1', fmRatio: '0.15', mlss: '3500', height: '4', shape: 'Rectangular', bodLoad: '', hrt: '', scope: 'Client' });
  const [aerators, setAerators] = useState({ required: true, type: 'Surface aerator', moc: 'SS304', power: '5', qty: '2', make: 'Indofab/EQT', scope: 'EDI' });
  const [airBlower, setAirBlower] = useState({ required: true, capacity: '', make: 'KPT/USHA/Everest/EQT', type: 'Tri lobe', qty: '2', head: '5000', totalAirReq: '', scope: 'EDI' });
  const [diffusers, setDiffusers] = useState({ required: false, type: 'Hydrodynamic', moc: 'PP', qty: '100', make: 'Gasion', scope: 'EDI' });

  const [secondaryClarifierTank, setSecondaryClarifierTank] = useState({ required: true, proposedDia: '', existingDia: '', swd: '3.5m', moc: 'RCC', qty: '1', scope: 'Client' });
  const [secondaryClarifierMech, setSecondaryClarifierMech] = useState({ required: true, capacity: '', type: 'Centrally drive', moc: 'MSEP', qty: '1', scope: 'EDI' });
  const [sludgeRecircPump, setSludgeRecircPump] = useState({ required: true, capacity: '', make: 'KSB/Johnson/Abirami/EQT', type: 'Centrifugal Semi-open', head: '15m', moc: 'CI', qty: '2 (1W+1S)', scope: 'EDI' });
  const [treatedWaterTank, setTreatedWaterTank] = useState({ required: true, capacity: '', moc: 'RCC', type: 'Vertical', qty: '1', scope: 'Client' });
  const [treatedWaterPump, setTreatedWaterPump] = useState({ required: true, capacity: '', make: 'KSB/Johnson/Abirami/EQT', head: '25m', type: 'Centrifugal Semi-open', moc: 'CI', qty: '2 (1W+1S)', scope: 'EDI' });
  const [primaryClarifier, setPrimaryClarifier] = useState({ required: true, capacity: '', dim: '', moc: 'RCC', qty: '1', inletTSS: '', outletTSS: '', scope: 'Client' });
  const [primaryClarifierMech, setPrimaryClarifierMech] = useState({ required: true, capacity: '', moc: 'MSEP', type: 'Central driven', make: 'Indofab/EQT', scope: 'EDI' });
  const [primarySludgePump, setPrimarySludgePump] = useState({ required: true, capacity: '', type: 'Centrifugal', make: 'KSB/Abirami/Johnson', head: '15m', qty: '2 (1W+1S)', scope: 'EDI' });
  const [coolingSystem, setCoolingSystem] = useState({ required: true, capacity: '', make: 'Alfa laval/EQT', moc: 'SS304', tempIn: '', tempOut: '35', coolingWaterTemp: '32', coolingWaterFlow: '', qty: '2 (1W+1S)', scope: 'EDI' });
  const [sludgeSystem, setSludgeSystem] = useState({ required: true, totalCapacity: '', polyPrepTankCap: '', polyDosingTankCap: '', pumpType: '', scope: 'EDI' });
  const [daf, setDaf] = useState({ required: true, flow: '', inletTSS: '', outletTSS: '', tssRemovedTons: '', tssRemovedKg: '', make: 'Krofta/DAFTech/Ishan/Kpack', qty: '1', hpPumpCapacity: '64', hpPumpMake: 'KSB/Kirloskar/Johnson/Equivalent', hpPumpHead: '10', hpPumpMOC: 'CI/SS304', hpPumpType: 'Open Impeller/Centrifugal', hpPumpQty: '2 (1W+1S)', airCompCapacity: '12', airCompMake: 'Atlas Copco/Equivalent', airCompPressure: '6', airCompMOC: 'SS304', airCompQty: '2 (1W+1S)', scope: 'EDI' });

  const [dafPolyDosing, setDafPolyDosing] = useState({
    required: false,
    polymerRatio: '3', // kg/ton
    polymerConcentration: '0.1', // %
    equipment: {
      prepTank: { qty: '1', capacity: '', material: 'Select MOC', remarks: '' },
      prepAgitator: { qty: '1', capacity: 'Standard', material: 'SS316', remarks: '' },
      dosingTank: { qty: '1', capacity: '', material: 'Select MOC', remarks: '' },
      dosingAgitator: { qty: '1', capacity: 'Standard', material: 'SS316', remarks: '' },
      dosingPumps: { qty: '2 (1W+1S)', capacity: '', material: 'Standard', remarks: '' }
    }
  });
  const [dafPolyDosingCalc, setDafPolyDosingCalc] = useState({
    solidsKgDay: '0', polymerReqKgDay: '0', dosingSolVolLitDay: '0', dosingFlowRate: '0', prepTankVol: '0', dosingTankVol: '0', totalVol: '0', pumpCapacity: '0', pumpType: ''
  });

  const [dafCoagulantDosing, setDafCoagulantDosing] = useState({
    required: false,
    coagulantPpm: '10',
    retentionHours: '8',
    equipment: {
      dosingTank: { qty: '1', capacity: '', material: 'Select MOC', remarks: '' },
      dosingAgitator: { qty: '1', capacity: 'Standard', material: 'SS316', remarks: '' },
      dosingPumps: { qty: '2 (1W+1S)', capacity: '', material: 'Standard', remarks: '' }
    }
  });
  const [dafCoagulantDosingCalc, setDafCoagulantDosingCalc] = useState({
    coagulantReqKgDay: '0', dosingSolVolLitDay: '0', dosingFlowRate: '0', dosingTankVol: '0', pumpCapacity: '0', pumpType: ''
  });

  const defaultPumpQty = "2 (1W+1S)";

  const [dosingSystems, setDosingSystems] = useState({
    'Urea': { required: true, pump: { capacity: '10', head: '10', type: 'Diaphragm', moc: 'PP', make: 'Miltonroy', qty: defaultPumpQty, scope: 'EDI' }, tank: { capacity: '500', type: 'Vertical', moc: 'Select MOC', make: 'Sintex/EQT', qty: '1', scope: 'EDI' }, agitator: { capacity: 'For 500L', type: 'Turbine', moc: 'SS316', make: 'Ceecons/Verito/EQT', qty: '1', rpm: '80-90', scope: 'EDI' } },
    'Phosphoric Acid': { required: true, pump: { capacity: '10', head: '10', type: 'Diaphragm', moc: 'PP', make: 'Miltonroy', qty: defaultPumpQty, scope: 'EDI' }, tank: { capacity: '500', type: 'Vertical', moc: 'Select MOC', make: 'Sintex/EQT', qty: '1', scope: 'EDI' }, agitator: null },
    'DAP': { required: true, pump: { capacity: '10', head: '10', type: 'Diaphragm', moc: 'PP', make: 'Miltonroy', qty: defaultPumpQty, scope: 'EDI' }, tank: { capacity: '500', type: 'Vertical', moc: 'Select MOC', make: 'Sintex/EQT', qty: '1', scope: 'EDI' }, agitator: { capacity: 'For 500L', type: 'Turbine', moc: 'SS316', make: 'Ceecons/Verito/EQT', qty: '1', rpm: '80-90', scope: 'EDI' } }, // New DAP System
    'Caustic': { required: true, pump: { capacity: '10', head: '10', type: 'Diaphragm', moc: 'SS316', make: 'Miltonroy', qty: defaultPumpQty, scope: 'EDI' }, tank: { capacity: '500', type: 'Vertical', moc: 'MS', make: '', qty: '1', scope: 'EDI' }, agitator: { capacity: 'For 500L', type: 'Turbine', moc: 'SS316', make: 'Ceecons/Verito/EQT', qty: '1', rpm: '80-90', scope: 'EDI' }, prepTank: { volume: '200', moc: 'MS', agitatorRpm: '80-90', agitatorType: 'Turbine' } },
    'HCl': { required: true, pump: { capacity: '10', head: '10', type: 'Diaphragm', moc: 'PP', make: 'Miltonroy', qty: defaultPumpQty }, tank: { capacity: '500', type: 'Vertical', moc: 'Select MOC', make: 'Sintex/EQT', qty: '1', fumeAbsorption: 'Yes' }, agitator: null },
    'Micronutrients': { required: true, pump: { capacity: '10', head: '10', type: 'Diaphragm', moc: 'PP', make: 'Miltonroy', qty: defaultPumpQty }, tank: { capacity: '500', type: 'Vertical', moc: 'Select MOC', make: 'Sintex/EQT', qty: '1' }, agitator: { capacity: 'For 500L', type: 'Turbine', moc: 'SS316', make: 'Ceecons/Verito/EQT', qty: '1', rpm: '80-90' } },
    'Poly': { required: false, pump: { capacity: '10', head: '10', type: 'Diaphragm', moc: 'PP', make: 'Miltonroy', qty: defaultPumpQty }, tank: { capacity: '500', type: 'Vertical', moc: 'Select MOC', make: 'Sintex/EQT', qty: '1', rpm: '80-90', fixedSpeed: true } }
  });

  const [dosingCalculations, setDosingCalculations] = useState({ urea: null, phosphoricAcid: null, dap: null, caustic: null, hcl: null, micronutrients: null });
  // NEW state for storing detailed breakdowns
  const [dosingBreakdowns, setDosingBreakdowns] = useState({});
  const [nutrientInputs, setNutrientInputs] = useState({ nRequired: '', ureaRequired: '', pRequired: '', phosphoricAcidRequired: '', nRequiredDap: '', dapRequired: '', causticRequired: '' });

  const [equipment, setEquipment] = useState([{ name: 'Sludge Dewatering', required: true, specs: 'Screw Press / Centrifuge', scope: 'EDI' }, { name: 'Tertiary Filters', required: true, specs: 'MGF + ACF, MS Epoxy', scope: 'EDI' }]);

  const [impactAnalysis, setImpactAnalysis] = useState({
    bromide: true,
    heavyMetals: true,
    vfa: true
  });

  const getParamVal = (arr, name) => {
    const p = arr.find(item => item.name === name);
    return p ? parseFloat(p.value || 0) : 0;
  };

  // ... (Calculations Effects) ...
  useEffect(() => {
    // Polymer & Coagulant Dosing Calculations
    const flowVal = getParamVal(params, 'Flow');
    const tssInlet = getParamVal(params, 'TSS');
    const tssAnaerobic = getParamVal(anaerobicFeedParams, 'TSS');

    if (flowVal > 0) {
      const polyResults = calculatePolymerDosing(
        flowVal,
        tssInlet,
        tssAnaerobic,
        dafPolyDosing.polymerRatio,
        dafPolyDosing.polymerConcentration
      );
      setDafPolyDosingCalc(polyResults);

      // Auto-update equipment specs based on calculation (unless manually overridden - currently auto-updates)
      setDafPolyDosing(prev => ({
        ...prev,
        equipment: {
          ...prev.equipment,
          prepTank: { ...prev.equipment.prepTank, capacity: polyResults.prepTankVol },
          dosingTank: { ...prev.equipment.dosingTank, capacity: polyResults.dosingTankVol },
          dosingPumps: { ...prev.equipment.dosingPumps, capacity: polyResults.pumpCapacity }
        }
      }));

      const coagResults = calculateCoagulantDosing(
        flowVal,
        dafCoagulantDosing.coagulantPpm,
        dafCoagulantDosing.retentionHours
      );
      setDafCoagulantDosingCalc(coagResults);

      // Auto-update equipment specs
      setDafCoagulantDosing(prev => ({
        ...prev,
        equipment: {
          ...prev.equipment,
          dosingTank: { ...prev.equipment.dosingTank, capacity: coagResults.dosingTankVol },
          dosingPumps: { ...prev.equipment.dosingPumps, capacity: coagResults.pumpCapacity }
        }
      }));
    }
  }, [
    params,
    anaerobicFeedParams,
    dafPolyDosing.polymerRatio,
    dafPolyDosing.polymerConcentration,
    dafCoagulantDosing.coagulantPpm,
    dafCoagulantDosing.retentionHours
  ]);

  useEffect(() => {
    const fieldsToCopy = ['TDS', 'VFA', 'Calcium', 'Sulphate', 'Chlorides', 'ORP', 'NH4-N', 'PO4-P', 'Toxic elements'];
    setAnaerobicFeedParams(prev => {
      let changed = false;
      const newParams = prev.map(ap => {
        if (fieldsToCopy.includes(ap.name)) {
          const inletVal = params.find(p => p.id === ap.id)?.value;
          if (inletVal !== undefined && inletVal !== "" && ap.value !== inletVal) {
            changed = true;
            return { ...ap, value: inletVal };
          }
        }
        return ap;
      });
      return changed ? newParams : prev;
    });
  }, [params]);

  useEffect(() => {
    if (clientInfo.industry === 'Paper') {
      const setDefaultSCOD = (currentParams, setFunc) => {
        setFunc(prev => prev.map(p => {
          if (p.name === 'sCOD' && (p.value === '' || p.value === '0')) {
            return { ...p, value: '5000' };
          }
          return p;
        }));
      };
      setDefaultSCOD(params, setParams);
      setDefaultSCOD(anaerobicFeedParams, setAnaerobicFeedParams);
    }
  }, [clientInfo.industry]);

  const flowVal = getParamVal(params, 'Flow');
  const tssInlet = getParamVal(params, 'TSS');
  const sCODInlet = getParamVal(params, 'sCOD');
  const bodInlet = getParamVal(params, 'BOD');
  const fogInlet = getParamVal(params, 'FOG');

  const tssAnaerobic = getParamVal(anaerobicFeedParams, 'TSS');
  const sCODAnaerobic = getParamVal(anaerobicFeedParams, 'sCOD');
  const bodAnaerobic = getParamVal(anaerobicFeedParams, 'BOD');
  const fogAnaerobic = getParamVal(anaerobicFeedParams, 'FOG');

  const anaEff = parseFloat(guarantees.anaerobicSCODEff || 0);
  const outletBOD = parseFloat(guarantees.outletBOD || 0);
  const anaerobicFeedLoad = parseFloat(clientInfo.anaerobicSCODLoad || 0);

  useEffect(() => {
    if (clientInfo.industry === 'Paper') {
      const prodCap = parseFloat(clientInfo.productionCapacity || 0);
      const specCOD = parseFloat(clientInfo.specificCOD || 0);
      const loopCOD = parseFloat(clientInfo.loopWaterCOD || 0);
      if (prodCap > 0 && specCOD > 0 && loopCOD > 0) {
        const codLoad = prodCap * specCOD;
        const anaerobicFlowM3Day = (codLoad / loopCOD) * 1000;
        let inletFlowM3Day = anaerobicFlowM3Day;
        const tssDiff = tssInlet - tssAnaerobic;
        if (tssInlet > 0 && tssAnaerobic >= 0) {
          const denominator = 1 - (tssDiff / 20000);
          if (denominator > 0.1) inletFlowM3Day = anaerobicFlowM3Day / denominator;
        }
        const newCalcCODLoad = codLoad.toFixed(2);
        const newCalcFlow = inletFlowM3Day.toFixed(2);

        if (clientInfo.calcCODLoad !== newCalcCODLoad || clientInfo.calcFlow !== newCalcFlow) {
          setClientInfo(prev => ({ ...prev, calcCODLoad: newCalcCODLoad, calcFlow: newCalcFlow }));
        }

        const newInletFlowVal = inletFlowM3Day.toFixed(0);
        setParams(prev => {
          if (prev.find(p => p.name === 'Flow').value === newInletFlowVal) return prev;
          return prev.map(p => { if (p.name === 'Flow') return { ...p, value: newInletFlowVal }; return p; });
        });

        const newAnaFlowVal = anaerobicFlowM3Day.toFixed(0);
        setAnaerobicFeedParams(prev => {
          if (prev.find(p => p.name === 'Flow').value === newAnaFlowVal) return prev;
          return prev.map(p => { if (p.name === 'Flow') return { ...p, value: newAnaFlowVal }; return p; });
        });
      }
    }
  }, [clientInfo.industry, clientInfo.productionCapacity, clientInfo.specificCOD, clientInfo.loopWaterCOD, params, anaerobicFeedParams]);

  useEffect(() => {
    const causticTankCap = dosingSystems['Caustic']?.tank?.capacity;
    if (causticTankCap) {
      setDosingSystems(prev => ({
        ...prev,
        'Caustic': {
          ...prev['Caustic'],
          prepTank: {
            ...prev['Caustic'].prepTank,
            volume: causticTankCap
          }
        }
      }));
    }
  }, [dosingSystems['Caustic']?.tank?.capacity]);

  useEffect(() => {
    if (flowVal > 0) {
      let newAnaerobicFlow = getParamVal(anaerobicFeedParams, 'Flow');
      let newTssRemovedKg = 0;

      if (clientInfo.industry !== 'Paper') {
        newAnaerobicFlow = flowVal;
        if (tssInlet > 0 && tssAnaerobic >= 0) {
          newTssRemovedKg = ((tssInlet - tssAnaerobic) * flowVal) / 1000;
          newAnaerobicFlow = flowVal - (newTssRemovedKg / (0.02 * 1000));
        }
      } else {
        if (tssInlet > 0 && tssAnaerobic >= 0) {
          newTssRemovedKg = ((tssInlet - tssAnaerobic) * flowVal) / 1000;
        }
      }

      setAnaerobicFeedParams(prev => {
        const currentFlow = parseFloat(prev.find(p => p.name === 'Flow')?.value || 0);
        const flowToSet = (clientInfo.industry === 'Paper' && currentFlow > 0) ? currentFlow : newAnaerobicFlow;
        if (Math.abs(currentFlow - flowToSet) < 0.1) return prev;
        return prev.map(p => { if (p.name === 'Flow') return { ...p, value: flowToSet.toFixed(2) }; return p; });
      });

      const anaFlowFinal = (clientInfo.industry === 'Paper') ? getParamVal(anaerobicFeedParams, 'Flow') : newAnaerobicFlow;

      const newInletSCODLoad = ((sCODInlet * flowVal) / 1000).toFixed(2);
      const newAnaerobicSCODLoad = ((sCODAnaerobic * anaFlowFinal) / 1000).toFixed(2);
      const newTssRemovedKgStr = newTssRemovedKg.toFixed(2);

      setClientInfo(prev => {
        return { ...prev, inletSCODLoad: newInletSCODLoad, anaerobicSCODLoad: newAnaerobicSCODLoad, tssRemovedKg: newTssRemovedKgStr };
      });
    }
  }, [flowVal, tssInlet, sCODInlet, bodInlet, fogInlet, tssAnaerobic, sCODAnaerobic, bodAnaerobic, fogAnaerobic, clientInfo.industry]);

  const tCODVal = getParamVal(params, 'tCOD');
  const temp = getParamVal(anaerobicFeedParams, 'Temperature');
  const ca = getParamVal(anaerobicFeedParams, 'Calcium');

  useEffect(() => {
    if (flowVal > 0) {
      const flowHr = flowVal / 24;

      if (anaerobicTank.required && anaerobicFeedLoad > 0) {
        const dia = parseFloat(anaerobicTank.selectedDiameter || anaerobicTank.diameter || 15);
        const height = parseFloat(anaerobicTank.selectedHeight || anaerobicTank.height || 20);

        const cap = Math.PI * Math.pow(dia / 2, 2) * height;
        const capFormatted = `${cap.toFixed(2)} m³`;

        const vlrVal = anaerobicFeedLoad / cap;
        const vlrFormatted = vlrVal.toFixed(2);

        if (anaerobicTank.capacity !== capFormatted || anaerobicTank.vlr !== vlrFormatted || anaerobicTank.diameter !== dia.toString() || anaerobicTank.height !== height.toString()) {
          setAnaerobicTank(prev => ({ ...prev, capacity: capFormatted, vlr: vlrFormatted, diameter: dia.toString(), height: height.toString() }));
        }

        if (standPipe.required) {
          const anaFlowSec = (flowHr) / 3600;
          const area = anaFlowSec / 0.04;
          const spDia = Math.ceil(Math.sqrt((4 * area) / Math.PI) * 1000);
          const spDim = `Dia ${spDia}mm x ${height}m H`;

          if (standPipe.dimensions !== spDim) setStandPipe(prev => ({ ...prev, dimensions: spDim }));
        }
      }

      const biogasFactor = parseFloat(guarantees.biogasFactor || 0.42);
      const dailyBiogas = anaerobicFeedLoad * (anaEff / 100) * biogasFactor;

      if (biogasHolder.required) {
        const retentionMin = 12;
        const mechCap = dailyBiogas / (24 * 60) * retentionMin;
        const mechHeight = 4;
        const mechDia = Math.sqrt((4 * mechCap) / (Math.PI * 4));

        const mechCapStr = `${mechCap.toFixed(2)} m³`;
        const mechDimStr = `Dia ${mechDia.toFixed(2)}m x ${mechHeight}m H`;
        const retTime = "12 mins";

        if (biogasHolder.capacity !== mechCapStr || biogasHolder.dimensions !== mechDimStr) {
          setBiogasHolder(prev => ({ ...prev, capacity: mechCapStr, dimensions: mechDimStr, retentionTime: retTime }));
        }

        if (biogasCivil.required) {
          const civilHeight = mechHeight + 1;
          const civilDia = mechDia + 1;
          const civilCap = Math.PI * Math.pow(civilDia / 2, 2) * civilHeight;
          const civilCapStr = `${civilCap.toFixed(2)} m³`;
          const civilDimStr = `Dia ${civilDia.toFixed(2)}m x ${civilHeight}m H`;

          if (biogasCivil.capacity !== civilCapStr || biogasCivil.dimensions !== civilDimStr) {
            setBiogasCivil(prev => ({ ...prev, capacity: civilCapStr, dimensions: civilDimStr }));
          }
        }
      }

      if (biogasFlare.required) {
        const flareCap = (dailyBiogas / 24) * 2;
        const newCap = `${Math.ceil(flareCap)} Nm³/hr`;
        if (biogasFlare.capacity !== newCap) setBiogasFlare(prev => ({ ...prev, capacity: newCap }));
      }

      if (daf.required) {
        const flowHr = flowVal / 24;
        const tssRemovedTons = ((tssInlet - tssAnaerobic) * flowVal) / 1000000;
        const hpPumpCap = (flowHr * 0.30).toFixed(2);
        const airCompCapM3 = flowHr * 0.10;
        const airCompCapCFM = (airCompCapM3 * 0.5886).toFixed(2);
        setDaf(prev => prev.flow === flowHr.toFixed(2) ? prev : { ...prev, flow: flowHr.toFixed(2), inletTSS: tssInlet.toFixed(0), outletTSS: tssAnaerobic.toFixed(0), tssRemovedTons: tssRemovedTons.toFixed(4), tssRemovedKg: (tssRemovedTons * 1000).toFixed(2), hpPumpCapacity: hpPumpCap, airCompCapacity: airCompCapCFM });
      }

      if (screens.required) {
        const screenCap = Math.ceil(flowHr * 1.3);
        const newCap = `${screenCap} m³/hr`;
        if (screens.capacity !== newCap) setScreens(prev => ({ ...prev, capacity: newCap }));
      }
      if (preAcid.required) {
        const capacity = Math.ceil(flowHr * 2);
        const newCap = `${capacity} m³`;
        if (preAcid.capacity !== newCap) setPreAcid(prev => ({ ...prev, capacity: newCap, power: `${((capacity * 15) / 1000).toFixed(2)} kW` }));
      }
      if (anaerobicFeedPump.required) {
        const marginFlow = Math.ceil((getParamVal(anaerobicFeedParams, 'Flow') / 24) * 1.1);
        const newCap = `${marginFlow} m³/hr`;
        if (anaerobicFeedPump.capacity !== newCap) setAnaerobicFeedPump(prev => ({ ...prev, capacity: newCap }));
      }
      if (primaryClarifier.required) {
        const area = flowVal / 22;
        const dia = Math.sqrt((4 * area) / Math.PI);
        const capacity = Math.ceil(area * 3);
        const newCap = `${capacity} m³`;
        const newDim = `Dia ${dia.toFixed(2)}m x 3m H`;
        if (primaryClarifier.capacity !== newCap) {
          setPrimaryClarifier(prev => ({ ...prev, capacity: newCap, dim: newDim, inletTSS: tssInlet.toString(), outletTSS: '1000' }));
          if (primaryClarifierMech.required) setPrimaryClarifierMech(prev => ({ ...prev, capacity: `Dia ${dia.toFixed(2)}m` }));
        }
      }
      if (primarySludgePump.required && clientInfo.industry === 'Paper') {
        const newCap = `${Math.ceil(flowHr * 0.30)} m³/hr`;
        if (primarySludgePump.capacity !== newCap) setPrimarySludgePump(prev => ({ ...prev, capacity: newCap }));
      }
      if (coolingSystem.required) {
        const newCap = `${Math.ceil(flowHr * 1.15)} m³/hr`;
        if (coolingSystem.capacity !== newCap) setCoolingSystem(prev => ({ ...prev, capacity: newCap, tempIn: temp, coolingWaterFlow: newCap }));
      }

      if (sludgeSystem.required) {
        const caOut = 100;
        const caSludge = Math.max(0, (ca - caOut) * 2.5 * flowVal / 1000);
        const bioSludge = ((bodInlet - outletBOD) * flowVal / 1000) * 0.6;
        const totalSludge = Math.ceil(caSludge + bioSludge + (tssInlet * flowVal / 1000));
        const polyKgDay = (totalSludge / 1000) * 4;
        const tankCap = Math.ceil((polyKgDay / 0.001 / 24) * 10);
        const newTankCap = `${tankCap} Lit`;
        if (sludgeSystem.totalCapacity !== totalSludge) setSludgeSystem(prev => ({ ...prev, totalCapacity: totalSludge, polyPrepTankCap: newTankCap, polyDosingTankCap: newTankCap }));
      }
      if (secondaryClarifierTank.required) {
        const area = flowVal / 14;
        const dia = Math.sqrt((4 * area) / Math.PI);
        const newDia = `${dia.toFixed(2)}m`;
        if (secondaryClarifierTank.proposedDia !== newDia) {
          setSecondaryClarifierTank(prev => ({ ...prev, proposedDia: newDia }));
          if (secondaryClarifierMech.required) setSecondaryClarifierMech(prev => ({ ...prev, capacity: `For ${newDia} dia` }));
        }
      }
      if (sludgeRecircPump.required) {
        const newCap = `${Math.ceil(flowHr)} m³/hr`;
        if (sludgeRecircPump.capacity !== newCap) setSludgeRecircPump(prev => ({ ...prev, capacity: newCap }));
      }
      if (treatedWaterTank.required) {
        const newCap = `${Math.ceil(flowHr * 4)} m³`;
        if (treatedWaterTank.capacity !== newCap) setTreatedWaterTank(prev => ({ ...prev, capacity: newCap }));
      }
      if (treatedWaterPump.required) {
        const newCap = `${Math.ceil(flowHr * 1.5)} m³/hr`;
        if (treatedWaterPump.capacity !== newCap) setTreatedWaterPump(prev => ({ ...prev, capacity: newCap }));
      }

    }
  }, [flowVal, tCODVal, temp, anaerobicFeedLoad, anaerobicTank.diameter, anaerobicTank.height, anaerobicTank.required, anaerobicTank.selectedDiameter, anaerobicTank.selectedHeight, guarantees.biogasFactor, anaEff, biogasHolder.required, biogasCivil.required, standPipe.required, daf.required, screens.required, preAcid.required, anaerobicFeedPump.required, primaryClarifier.required, primarySludgePump.required, coolingSystem.required, biogasFlare.required, biogasFlare.height, sludgeSystem.required, secondaryClarifierTank.required, secondaryClarifierMech.required, sludgeRecircPump.required, treatedWaterTank.required, treatedWaterPump.required, biomassHoldingTank.required, biomassHoldingTank.shape]);

  // --- Revised Dosing Calculation Logic ---
  useEffect(() => {
    if (anaerobicFeedLoad > 0 && anaEff > 0) {
      const anaFlow = getParamVal(anaerobicFeedParams, 'Flow') || 0;
      const sCODAnaerobicVal = getParamVal(anaerobicFeedParams, 'sCOD') || 0;
      const anaEffVal = parseFloat(guarantees.anaerobicSCODEff || 0);
      const nh4AvailableMgL = getParamVal(anaerobicFeedParams, 'NH4-N') || 0;
      const po4AvailableMgL = getParamVal(anaerobicFeedParams, 'PO4-P') || 0;

      // 1. Calculate sCOD Removed (kg/day) based on strict formula from prompt:
      // (Feed flow to anaerobic × sCOD concentration × Anaerobic sCOD removal efficiency) / 100000
      const sCODRemovalKg = (anaFlow * sCODAnaerobicVal * anaEffVal) / 100000;

      // --- Urea Calculation Breakdown ---
      const nRequiredTheoretical = (sCODRemovalKg / 500) * 5;
      const nAvailable = (anaFlow * nh4AvailableMgL) / 1000;
      const nRequiredNet = Math.max(0, nRequiredTheoretical - nAvailable);
      const ureaRequiredKgDay = nRequiredNet / 0.46;

      // --- Phosphoric Acid Calculation Breakdown ---
      const pRequiredTheoretical = (sCODRemovalKg / 500) * 1;
      const pAvailable = (anaFlow * po4AvailableMgL) / 1000;
      const pRequiredNet = Math.max(0, pRequiredTheoretical - pAvailable);
      const phosphoricAcidRequiredKgDay = (pRequiredNet / 0.85) / 0.32; // Exact formula as requested

      // --- Other Chemical Calculations (Standard) ---
      const dapRequired = nRequiredNet / 0.18;
      const causticRequired = sCODRemovalKg * 0.02;

      // Tank/Pump Sizing Logic (Rounded for Equipment Selection)
      const ureaTankCapRound = Math.round((ureaRequiredKgDay / 0.20)); // Approx sizing rule
      const ureaPumpCap = Math.round((ureaTankCapRound / 24) * 1.5);

      const phosTankCapRound = Math.round((phosphoricAcidRequiredKgDay / 0.50));
      const phosPumpCap = Math.round((phosTankCapRound / 24) * 1.5);

      const dapTankCapRound = Math.round((dapRequired / 0.20));
      const dapPumpCap = Math.round((dapTankCapRound / 24) * 1.5);

      const causticTankCapRound = Math.round((causticRequired / 0.45 / 2));
      const causticPumpCap = Math.round(causticTankCapRound / 12);

      const hclTankCapRound = Math.round(((sCODRemovalKg / 2000) * 100 * 10));
      const hclPumpCap = Math.round(hclTankCapRound / 240);

      const microTankCapRound = Math.round(((sCODRemovalKg / 1000) * 10));
      const microPumpCap = Math.round(microTankCapRound / 24);

      // Update State for Calculation Breakdowns (For Document)
      setDosingBreakdowns({
        urea: {
          sCODRemoved: sCODRemovalKg.toFixed(2),
          nReqTheoretical: nRequiredTheoretical.toFixed(2),
          nAvailable: nAvailable.toFixed(2),
          nReqNet: nRequiredNet.toFixed(2),
          ureaReq: ureaRequiredKgDay.toFixed(2)
        },
        phosphoricAcid: {
          sCODRemoved: sCODRemovalKg.toFixed(2),
          pReqTheoretical: pRequiredTheoretical.toFixed(2),
          pAvailable: pAvailable.toFixed(2),
          pReqNet: pRequiredNet.toFixed(2),
          phosReq: phosphoricAcidRequiredKgDay.toFixed(2)
        }
      });

      // Update State for UI Summary
      setDosingCalculations({
        urea: {
          'N Required (Net)': `${nRequiredNet.toFixed(2)} kg/day`,
          'Required Urea': `${ureaRequiredKgDay.toFixed(2)} kg/day`,
          'Dosing Tank': `${ureaTankCapRound} Lit`,
          'Dosing Pump': `${ureaPumpCap} LPH`
        },
        phosphoricAcid: {
          'P Required (Net)': `${pRequiredNet.toFixed(2)} kg/day`,
          'Required Phos Acid': `${phosphoricAcidRequiredKgDay.toFixed(2)} kg/day`,
          'Dosing Tank': `${phosTankCapRound} Lit`,
          'Dosing Pump': `${phosPumpCap} LPH`
        },
        dap: { 'N Required': `${nRequiredNet.toFixed(2)} kg/day`, 'Required DAP': `${dapRequired.toFixed(2)} kg/day`, 'Dosing Tank': `${dapTankCapRound} Lit`, 'Dosing Pump': `${dapPumpCap} LPH` },
        caustic: { 'Required Caustic': `${causticRequired.toFixed(2)} kg/day`, 'Tank Capacity': `${causticTankCapRound} Lit`, 'Pump Capacity': `${causticPumpCap} LPH` },
        hcl: { 'Tank Capacity': `${hclTankCapRound} Lit`, 'Pump Capacity': `${hclPumpCap} LPH` },
        micronutrients: { 'Tank Capacity': `${microTankCapRound} Lit`, 'Pump Capacity': `${microPumpCap} LPH` }
      });

      // Update Inputs if not manual override (Initial)
      if (!nutrientInputs.nRequired) {
        setNutrientInputs(prev => ({
          ...prev,
          nRequired: nRequiredNet.toFixed(2),
          ureaRequired: ureaRequiredKgDay.toFixed(2),
          pRequired: pRequiredNet.toFixed(2),
          phosphoricAcidRequired: phosphoricAcidRequiredKgDay.toFixed(2),
          nRequiredDap: nRequiredNet.toFixed(2),
          dapRequired: dapRequired.toFixed(2),
          causticRequired: causticRequired.toFixed(2)
        }));
      }

      // Update Equipment Specs
      setDosingSystems(prev => {
        const newState = { ...prev };
        if (newState['Urea'].tank.capacity !== ureaTankCapRound.toString()) {
          newState['Urea'].tank.capacity = ureaTankCapRound.toString();
          newState['Urea'].pump.capacity = ureaPumpCap.toString();
        }
        if (newState['Phosphoric Acid'].tank.capacity !== phosTankCapRound.toString()) {
          newState['Phosphoric Acid'].tank.capacity = phosTankCapRound.toString();
          newState['Phosphoric Acid'].pump.capacity = phosPumpCap.toString();
        }
        if (newState['DAP'].tank.capacity !== dapTankCapRound.toString()) {
          newState['DAP'].tank.capacity = dapTankCapRound.toString();
          newState['DAP'].pump.capacity = dapPumpCap.toString();
        }
        if (newState['Caustic'].tank.capacity !== causticTankCapRound.toString()) {
          newState['Caustic'].tank.capacity = causticTankCapRound.toString();
          newState['Caustic'].pump.capacity = causticPumpCap.toString();
        }
        if (newState['HCl'].tank.capacity !== hclTankCapRound.toString()) {
          newState['HCl'].tank.capacity = hclTankCapRound.toString();
          newState['HCl'].pump.capacity = hclPumpCap.toString();
        }
        if (newState['Micronutrients'].tank.capacity !== microTankCapRound.toString()) {
          newState['Micronutrients'].tank.capacity = microTankCapRound.toString();
          newState['Micronutrients'].pump.capacity = microPumpCap.toString();
        }
        return newState;
      });
    }
  }, [anaerobicFeedLoad, anaEff, nutrientInputs, anaerobicFeedParams, guarantees.anaerobicSCODEff]);

  const handleGenerateProposal = async () => {
    // Validation for tank MOC removed to allow optional selection
    const mocErrors = [];

    // Check Dosing Systems - Only warn for critical missing info if absolutely necessary, but keeping optional as requested.
    // Removed strict MOC validation logic here.

    if (biomassHoldingTank.required) {
      if (parseFloat(biomassHoldingTank.height || 0) > 4) mocErrors.push("Biomass Holding Tank: Height exceeds 4m");
    }

    if (mocErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <div className="space-y-1">
            <p className="font-semibold text-red-600">Please resolve the following errors:</p>
            <ul className="list-disc pl-4 text-xs mt-2 text-slate-700">
              {mocErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        ),
        variant: "destructive"
      });
      return;
    }

    const yyyy = "2026";
    const mm = "01";

    let counter = parseInt(localStorage.getItem(`proposal_ref_seq_${yyyy}${mm}`) || "0");
    counter += 1;
    const nnn = String(counter).padStart(3, '0');
    const referenceNumber = `${yyyy}${mm}${nnn}/RN`;
    localStorage.setItem(`proposal_ref_seq_${yyyy}${mm}`, counter.toString());

    // Proposal data that would be used by a backend or other service
    const allData = {
      clientInfo: { ...clientInfo, referenceNumber },
      params, anaerobicFeedParams, guarantees, daf,
      proposalDetails,
      dafPolyDosing, dafPolyDosingCalc,
      dafCoagulantDosing, dafCoagulantDosingCalc,
      screens, primaryClarifier, primaryClarifierMech, primarySludgePump, coolingSystem,
      preAcid, anaerobicFeedPump, anaerobicTank, standPipe, biomassPump, biogasHolder, biogasCivil, biogasFlare,
      biomassHoldingTank, aerationTank, aerators, airBlower, diffusers, secondaryClarifierTank, secondaryClarifierMech,
      sludgeRecircPump, treatedWaterTank, treatedWaterPump, sludgeSystem,
      dosingSystems, dosingCalculations, dosingBreakdowns,
      equipment, warnings, impactAnalysis,
      techOverview, processDesc,
      instruments,
      manualInstrumentRanges,
      selectedSections,
      filterGuarantees,
      uvGuarantees,
      roGuarantees,
      importantConsiderationsPoints,
      nutrientInputs,
      performanceSpecs,
      performanceResults,
      sludgeCalculationDetails,
      filtersSpecs,
      mgfSpecs,
      mgfCalculations,
      acfSpecs,
      acfCalculations
    };

    try {
      await generateProposalWord(allData);
      toast({ title: "Success", description: "Word document generated successfully." });
    } catch (error) {
      console.error("Export Error:", error);
      toast({ title: "Error", description: "Failed to generate document.", variant: "destructive" });
    }
  };



  return (
    <div className="bg-white p-6 md:p-8 min-h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Technical Proposal Generator</h2>
        <div className="flex items-center gap-4">
          {!user && (
            <div className="flex gap-3 mr-4">
              <Link to="/auth">
                <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  Log In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
          <div className="flex space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>1. Details</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>2. Specs</span>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto max-h-[calc(100vh-250px)]">
        {step === 1 && (
          <Step1
            clientInfo={clientInfo}
            setClientInfo={setClientInfo}
            proposalDetails={proposalDetails}
            setProposalDetails={setProposalDetails}
            params={params}
            setParams={setParams}
            anaerobicFeedParams={anaerobicFeedParams}
            setAnaerobicFeedParams={setAnaerobicFeedParams}
            warnings={warnings}
            guarantees={guarantees}
            setGuarantees={setGuarantees}
            validations={validations}
            techOverview={techOverview}
            setTechOverview={setTechOverview}
            processDesc={processDesc}
            setProcessDesc={setProcessDesc}
            instruments={instruments}
            setInstruments={setInstruments}
            manualInstrumentRanges={manualInstrumentRanges}
            setManualInstrumentRanges={setManualInstrumentRanges}
            selectedSections={selectedSections}
            setSelectedSections={setSelectedSections}
            filterGuarantees={filterGuarantees}
            setFilterGuarantees={setFilterGuarantees}
            uvGuarantees={uvGuarantees}
            setUVGuarantees={setUVGuarantees}
            roGuarantees={roGuarantees}
            setROGuarantees={setROGuarantees}
            anaerobicTank={anaerobicTank}
            setAnaerobicTank={setAnaerobicTank}
          />
        )}

        {step === 2 && (
          <Step2
            daf={daf} setDaf={setDaf}
            dafPolyDosing={dafPolyDosing} setDafPolyDosing={setDafPolyDosing}
            dafPolyDosingCalc={dafPolyDosingCalc}
            dafCoagulantDosing={dafCoagulantDosing} setDafCoagulantDosing={setDafCoagulantDosing}
            dafCoagulantDosingCalc={dafCoagulantDosingCalc}
            dosingSystems={dosingSystems} setDosingSystems={setDosingSystems}
            dosingCalculations={dosingCalculations}
            nutrientInputs={nutrientInputs} setNutrientInputs={setNutrientInputs}
            screens={screens} setScreens={setScreens}
            primaryClarifier={primaryClarifier} setPrimaryClarifier={setPrimaryClarifier}
            primaryClarifierMech={primaryClarifierMech} setPrimaryClarifierMech={setPrimaryClarifierMech}
            primarySludgePump={primarySludgePump} setPrimarySludgePump={setPrimarySludgePump}
            coolingSystem={coolingSystem} setCoolingSystem={setCoolingSystem}
            preAcid={preAcid} setPreAcid={setPreAcid}
            anaerobicFeedPump={anaerobicFeedPump} setAnaerobicFeedPump={setAnaerobicFeedPump}
            anaerobicTank={anaerobicTank} setAnaerobicTank={setAnaerobicTank}
            standPipe={standPipe} setStandPipe={setStandPipe}
            biomassPump={biomassPump} setBiomassPump={setBiomassPump}
            biogasHolder={biogasHolder} setBiogasHolder={setBiogasHolder}
            biogasCivil={biogasCivil} setBiogasCivil={setBiogasCivil}
            biogasFlare={biogasFlare} setBiogasFlare={setBiogasFlare}
            biomassHoldingTank={biomassHoldingTank} setBiomassHoldingTank={setBiomassHoldingTank}
            aerationTank={aerationTank} setAerationTank={setAerationTank}
            aerators={aerators} setAerators={setAerators}
            airBlower={airBlower} setAirBlower={setAirBlower}
            diffusers={diffusers} setDiffusers={setDiffusers}
            secondaryClarifierTank={secondaryClarifierTank} setSecondaryClarifierTank={setSecondaryClarifierTank}
            secondaryClarifierMech={secondaryClarifierMech} setSecondaryClarifierMech={setSecondaryClarifierMech}
            sludgeRecircPump={sludgeRecircPump} setSludgeRecircPump={setSludgeRecircPump}
            treatedWaterTank={treatedWaterTank} setTreatedWaterTank={setTreatedWaterTank}
            treatedWaterPump={treatedWaterPump} setTreatedWaterPump={setTreatedWaterPump}
            sludgeSystem={sludgeSystem} setSludgeSystem={setSludgeSystem}
            equipment={equipment} setEquipment={setEquipment}
            impactAnalysis={impactAnalysis}
            clientInfo={clientInfo}
            guarantees={guarantees}
            selectedSections={selectedSections}
            importantConsiderationsPoints={importantConsiderationsPoints}
            setImportantConsiderationsPoints={setImportantConsiderationsPoints}
            // NEW Props for Performance Calcs
            performanceSpecs={performanceSpecs}
            setPerformanceSpecs={setPerformanceSpecs}
            performanceResults={performanceResults}
            setPerformanceResults={setPerformanceResults}
            // Sludge Handling Props
            sludgeCalculationDetails={sludgeCalculationDetails}
            setSludgeCalculationDetails={setSludgeCalculationDetails}
            // Filters Props
            filtersSpecs={filtersSpecs}
            setFiltersSpecs={setFiltersSpecs}
            // MGF Props
            mgfSpecs={mgfSpecs}
            setMgfSpecs={setMgfSpecs}
            mgfCalculations={mgfCalculations}
            setMgfCalculations={setMgfCalculations}
            // ACF Props
            acfSpecs={acfSpecs}
            setAcfSpecs={setAcfSpecs}
            acfCalculations={acfCalculations}
            setAcfCalculations={setAcfCalculations}
            // Pass params to extract inlet values
            params={params}
            anaerobicFeedParams={anaerobicFeedParams}
          />
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center bg-white">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        ) : (
          <div></div>
        )}

        {step < 2 ? (
          <Button onClick={() => setStep(step + 1)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center">
            Next Step <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleGenerateProposal} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center">
              <FileText className="w-4 h-4 mr-2" /> Generate Proposal
            </Button>
          </div>
        )}
      </div >


    </div >
  );
};

export default ProposalGenerator;
