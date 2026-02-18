import React, { useState, useEffect } from 'react';
import { Wind, Activity, ArrowRight, Settings } from 'lucide-react';
import {
  calculateAerationTankBODPerHour,
  calculateAirRequirement,
  calculateBlowerQuantity,
  calculateFineBubbleDiffusers,
  calculateHydrodynamicDiffusers
} from '@/utils/engineeringCalculations';

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
        className={`w-full px-3 py-1.5 border ${error ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-300'} rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none text-gray-900 
          ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, disabled = false, required = false, error, placeholder = "Select...", unit = "" }) => (
  <div className="mb-3 relative group">
    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
      {label} {required && <span className="text-red-500">*</span>}
      {error && <span className="text-red-500 text-[10px] font-normal ml-2">{error}</span>}
    </label>
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-1.5 border ${error ? 'border-red-500' : (required && (!value || value === 'Select MOC') ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white')} rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none text-gray-900 
          ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt} {unit}</option>)}
      </select>
    </div>
  </div>
);

const AirBlowerSection = ({ initialBOD, initialBODRemoval, onDataChange }) => {
  const [bodInput, setBodInput] = useState(initialBOD || '');
  const [bodRemovalInput, setBodRemovalInput] = useState(initialBODRemoval || '');
  const [selectedBlowerSize, setSelectedBlowerSize] = useState('');
  const [head, setHead] = useState('0.5'); // Default head

  const [calculations, setCalculations] = useState({
    bodPerHour: '0',
    airRequirementPerHour: '0',
    blowers_needed: 0,
    standby_blowers: 0,
    total_blowers: 0,
    blower_config_text: '-',
    fine_bubble_qty: 0,
    hydrodynamic_qty: 0
  });

  // Generate blower size options: 100 to 20000 in steps of 100
  const blowerSizeOptions = Array.from({ length: 200 }, (_, i) => ((i + 1) * 100).toString());

  // Generate Head options: 0.1 to 10.0 step 0.1
  const headOptions = Array.from({ length: 100 }, (_, i) => ((i + 1) * 0.1).toFixed(1));

  useEffect(() => {
    // 1. Calculate BOD per Hour
    const bodPerHour = calculateAerationTankBODPerHour(bodInput, bodRemovalInput);

    // 2. Calculate Air Requirement
    const airReq = calculateAirRequirement(bodPerHour);

    // 3. Calculate Blower Quantity
    let blowerQty = { blowers_needed: 0, standby_blowers: 0, total_blowers: 0, blower_config_text: '-' };
    if (selectedBlowerSize && parseFloat(airReq) > 0) {
      blowerQty = calculateBlowerQuantity(airReq, selectedBlowerSize);
    }

    // 4. Calculate Diffusers
    const fineBubble = calculateFineBubbleDiffusers(airReq);
    const hydrodynamic = calculateHydrodynamicDiffusers(airReq);

    const newCalcs = {
      bodPerHour,
      airRequirementPerHour: airReq,
      ...blowerQty,
      fine_bubble_qty: fineBubble.quantity,
      hydrodynamic_qty: hydrodynamic.quantity
    };

    setCalculations(newCalcs);

    // Pass data up to parent
    if (onDataChange) {
      onDataChange({
        ...newCalcs,
        bodInput,
        bodRemovalInput,
        selected_blower_size: selectedBlowerSize,
        head // Include head in data
      });
    }

  }, [bodInput, bodRemovalInput, selectedBlowerSize, head]);

  // Update internal inputs if props change (e.g. from parent re-render or API fetch)
  useEffect(() => {
    if (initialBOD !== undefined) setBodInput(initialBOD);
    if (initialBODRemoval !== undefined) setBodRemovalInput(initialBODRemoval);
  }, [initialBOD, initialBODRemoval]);

  return (
    <div className="border border-blue-200 rounded-lg p-4 mb-6 bg-white shadow-sm animate-in fade-in duration-500">
      <div className="flex items-center mb-4 border-b border-blue-100 pb-2">
        <Wind className="w-5 h-5 text-blue-600 mr-2" />
        <h4 className="font-bold text-blue-800 text-lg">Air Blower & Diffuser Design</h4>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column: Requirements */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
          <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2" /> Oxygen & Air Requirements
          </h5>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <InputField
                label="Anaerobic BOD (kg/day)"
                value={bodInput}
                onChange={setBodInput}
                type="number"
                placeholder="Enter total BOD"
              />
              <InputField
                label="BOD Removal (kg/day)"
                value={bodRemovalInput}
                onChange={setBodRemovalInput}
                type="number"
                placeholder="Removed in Anaerobic"
              />
            </div>

            <div className="flex justify-between items-center border-b border-blue-200/50 pb-1">
              <span className="text-sm text-blue-700">Entering BOD to Aeration:</span>
              <span className="font-bold text-gray-900">{calculations.bodPerHour} kg/hr</span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-bold text-blue-800">Hourly Air Req (m³/hr):</span>
              <span className="font-bold text-blue-800 text-lg">{calculations.airRequirementPerHour}</span>
            </div>
            <p className="text-[10px] text-blue-400 italic">Formula: (kgBOD/hr * 1.5 * 1.2) / 0.21 / 0.12</p>
          </div>
        </div>

        {/* Right Column: Selection & Configuration */}
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <h5 className="font-semibold text-slate-800 mb-3 flex items-center">
              <Settings className="w-4 h-4 mr-2" /> Blower Selection
            </h5>

            <SelectField
              label="Select Standard Blower Size"
              value={selectedBlowerSize}
              onChange={setSelectedBlowerSize}
              options={blowerSizeOptions}
              required
              placeholder="Select Blower Size"
              unit="m³/hr"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <SelectField
                label="Head (m)"
                value={head}
                onChange={setHead}
                options={headOptions}
                placeholder="Select Head"
                unit="m"
              />
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Blower Capacity</label>
                <div className="w-full px-3 py-1.5 border border-blue-200 bg-blue-50 rounded text-sm text-gray-700 font-medium">
                  {selectedBlowerSize || '-'} <span className="text-xs text-slate-500">m³/hr</span>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Qty</label>
                <div className="w-full px-3 py-1.5 border border-blue-200 bg-blue-50 rounded text-sm text-gray-700 font-medium">
                  {calculations.total_blowers > 0 ? calculations.total_blowers : '-'} <span className="text-xs text-slate-500">(Nos)</span>
                </div>
              </div>
            </div>

            {selectedBlowerSize && (
              <div className="mt-2 p-2 bg-white rounded border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Proposed Configuration</p>
                <div className="flex items-center text-emerald-700 font-bold">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {calculations.blower_config_text}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  (Includes {calculations.standby_blowers} Standby)
                </p>
              </div>
            )}
          </div>

          <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
            <h5 className="font-semibold text-indigo-900 mb-2 text-sm">Diffuser Quantities</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-white p-2 rounded border border-indigo-100">
                <div className="text-xs text-indigo-600 mb-1">Fine Bubble</div>
                <div className="text-lg font-bold text-indigo-900">{calculations.fine_bubble_qty}</div>
                <div className="text-[10px] text-slate-400">Cap: 10 Nm³/hr</div>
              </div>
              <div className="text-center bg-white p-2 rounded border border-indigo-100">
                <div className="text-xs text-indigo-600 mb-1">Hydrodynamic</div>
                <div className="text-lg font-bold text-indigo-900">{calculations.hydrodynamic_qty}</div>
                <div className="text-[10px] text-slate-400">Cap: 60 Nm³/hr</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirBlowerSection;