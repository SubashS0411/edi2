
import React from 'react';
import { Settings, Filter } from 'lucide-react';

const InputField = ({ label, value, onChange, placeholder, type = "text", disabled = false, min = "0" }) => (
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
        className={`w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none text-gray-900 
          ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
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
        className={`w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none text-gray-900 bg-white
          ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
      >
        <option value="">Select Option</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
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

const FiltersSection = ({ data, setData }) => {

  const handleNestedChange = (parentField, field, value) => {
    setData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const PUMP_MAKE_OPTIONS = ['KSB/Johnson/Abirami/EQT', 'Other'];
  const PUMP_MOC_OPTIONS = ['CI', 'SS', 'Nitrile Rubber', 'CI/SS304', 'Other'];
  const PUMP_TYPE_OPTIONS = ['Positive Displacement', 'Centrifugal', 'Peristaltic', 'Other'];

  return (
    <div className="border border-indigo-200 rounded-lg p-4 mb-6 bg-white shadow-sm animate-in fade-in duration-500">
      <div className="flex items-center mb-4 border-b border-indigo-100 pb-2">
        <Filter className="w-5 h-5 text-indigo-600 mr-2" />
        <h4 className="font-bold text-indigo-800 text-lg">Filters</h4>
      </div>

      <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
        <SpecsSection title="Filter Feed Pump" icon={Settings}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SelectField
              label="Make"
              value={data.filterFeedPump?.make}
              onChange={(v) => handleNestedChange('filterFeedPump', 'make', v)}
              options={PUMP_MAKE_OPTIONS}
            />
            <SelectField
              label="MOC"
              value={data.filterFeedPump?.moc}
              onChange={(v) => handleNestedChange('filterFeedPump', 'moc', v)}
              options={PUMP_MOC_OPTIONS}
            />
            <SelectField
              label="Type"
              value={data.filterFeedPump?.type}
              onChange={(v) => handleNestedChange('filterFeedPump', 'type', v)}
              options={PUMP_TYPE_OPTIONS}
            />
            <SelectField
              label="Quantity (Nos)"
              value={data.filterFeedPump?.qty}
              onChange={(v) => handleNestedChange('filterFeedPump', 'qty', v)}
              options={Array.from({ length: 10 }, (_, i) => (i + 1).toString())}
            />
          </div>
        </SpecsSection>
      </div>
    </div>
  );
};

export default FiltersSection;
