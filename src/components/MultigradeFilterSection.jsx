
import React, { useEffect } from 'react';
import { Settings2, Activity, Droplets } from 'lucide-react';
import {
  calculateMGFDesignFlow,
  calculateFilterArea,
  calculateAreaRequired,
  calculateNumberOfMGF,
  calculateActualAreaSelected,
  calculateBackwashFlow,
  calculateBackwashPumpCapacity,
  calculateAirRequirementMGF
} from '@/utils/engineeringCalculations';

const InputField = ({ label, value, onChange, placeholder, type = "text", disabled = false, min = "0", max }) => (
  <div className="mb-2 relative group">
    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
      {label}
    </label>
    <div>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min={min}
        max={max}
        className={`w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-gray-900 
          ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, disabled = false }) => (
  <div className="mb-2 relative group">
    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
      {label}
    </label>
    <div>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-gray-900 bg-white
          ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
      >
        <option value="">Select Option</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  </div>
);

const DisplayField = ({ label, value, unit }) => (
  <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-center h-full">
    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
    <div className="flex items-baseline gap-1">
        <span className="font-bold text-slate-800 text-sm">{value}</span>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
    </div>
  </div>
);

const SpecsSection = ({ title, icon: Icon, children }) => (
    <div className="border border-slate-200 rounded p-3 bg-white mb-4">
        <div className="text-xs font-bold text-slate-700 uppercase mb-3 border-b pb-1 flex items-center">
            {Icon && <Icon className="w-3 h-3 mr-2 text-indigo-600" />} {title}
        </div>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const MultigradeFilterSection = ({ data, setData, calculations, setCalculations, anaerobicFeedFlow }) => {

  const FILTRATION_RATES = ['10', '11', '12', '13', '14', '15'];

  const handleChange = (field, value) => {
      setData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const designFlow = calculateMGFDesignFlow(anaerobicFeedFlow);
    const filterArea = calculateFilterArea(data.diameter);
    const areaReq = calculateAreaRequired(designFlow, data.filtrationRate);
    const numMGF = calculateNumberOfMGF(areaReq, filterArea);
    const actualArea = calculateActualAreaSelected(numMGF, filterArea);
    const backwashFlow = calculateBackwashFlow(data.backwashRate, actualArea);
    const backwashPumpCap = calculateBackwashPumpCapacity(backwashFlow, data.backwashTime);
    const airReq = calculateAirRequirementMGF(actualArea, data.airBackwashRate);

    setCalculations({
        designFlow,
        filterArea,
        areaReq,
        numMGF,
        actualArea,
        backwashFlow,
        backwashPumpCap,
        airReq
    });
  }, [data, anaerobicFeedFlow, setCalculations]);

  return (
    <div className="border border-indigo-200 rounded-lg p-4 mb-6 bg-white shadow-sm animate-in fade-in duration-500">
      <div className="flex items-center mb-4 border-b border-indigo-100 pb-2">
        <Settings2 className="w-5 h-5 text-indigo-600 mr-2" />
        <h4 className="font-bold text-indigo-800 text-lg">Multigrade Filter System (MGF)</h4>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <SpecsSection title="Design Parameters" icon={Activity}>
             <div className="grid grid-cols-2 gap-3">
                <InputField 
                    label="Operating Hours" 
                    type="number" 
                    min="1" max="24"
                    value={data.operatingHours} 
                    onChange={(v) => handleChange('operatingHours', v)} 
                />
                <DisplayField label="Design Flow" value={calculations.designFlow} unit="m³/hr" />
                
                <SelectField 
                    label="Filtration Rate (m³/m²/hr)" 
                    value={data.filtrationRate} 
                    onChange={(v) => handleChange('filtrationRate', v)} 
                    options={FILTRATION_RATES} 
                />
                <InputField 
                    label="Filter Diameter (m)" 
                    type="number" 
                    min="1" max="3" step="0.1"
                    value={data.diameter} 
                    onChange={(v) => handleChange('diameter', v)} 
                />
             </div>
        </SpecsSection>

        <SpecsSection title="System Sizing" icon={Activity}>
            <div className="grid grid-cols-2 gap-3 h-full">
                <DisplayField label="Area Required" value={calculations.areaReq} unit="m²" />
                <DisplayField label="Filter Area / Unit" value={calculations.filterArea} unit="m²" />
                <div className="bg-indigo-50 p-2 rounded border border-indigo-200 flex flex-col justify-center h-full">
                    <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wide">Qty Required</span>
                    <span className="font-bold text-indigo-900 text-lg">{calculations.numMGF} Nos.</span>
                </div>
                <DisplayField label="Actual Area Selected" value={calculations.actualArea} unit="m²" />
            </div>
        </SpecsSection>
      </div>

      <div className="mt-2">
         <SpecsSection title="Backwash & Air Scour" icon={Droplets}>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                 <InputField 
                    label="Backwash Rate" 
                    type="number" 
                    min="10" max="25"
                    value={data.backwashRate} 
                    onChange={(v) => handleChange('backwashRate', v)} 
                    placeholder="10-25"
                 />
                  <DisplayField label="Backwash Flow" value={calculations.backwashFlow} unit="m³/hr" />
                 
                 <InputField 
                    label="Backwash Time (min)" 
                    type="number" 
                    min="1" max="25"
                    value={data.backwashTime} 
                    onChange={(v) => handleChange('backwashTime', v)} 
                 />
                 <DisplayField label="Backwash Pump Cap" value={calculations.backwashPumpCap} unit="m³/hr" />

                 <InputField 
                    label="Air Rate (m³/m²/hr)" 
                    type="number" 
                    min="30" max="45"
                    value={data.airBackwashRate} 
                    onChange={(v) => handleChange('airBackwashRate', v)} 
                    placeholder="30-45"
                 />
                 <DisplayField label="Air Requirement" value={calculations.airReq} unit="m³/hr" />
             </div>
         </SpecsSection>
      </div>

    </div>
  );
};

export default MultigradeFilterSection;
