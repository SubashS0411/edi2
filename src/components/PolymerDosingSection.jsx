
import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOC_OPTIONS = ['Select MOC', 'MSEP', 'SS304', 'SS316', 'RCC', 'PP', 'FRP', 'HDPE', 'MS', 'MSRL'];

const InputField = ({ label, value, onChange, placeholder, type = "text", disabled = false, min, max }) => (
  <div className="mb-3 relative group">
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      min={min}
      max={max}
      className={`w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-gray-900 
        ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
      placeholder={placeholder}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, disabled = false, required = false }) => (
  <div className="mb-3 relative group">
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-3 py-1.5 border ${required && (!value || value === 'Select MOC') ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'} rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-gray-900 
        ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const ScopeSelect = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    <label className="text-xs font-semibold text-emerald-700 whitespace-nowrap">Scope:</label>
    <select
      value={value || 'EDI'}
      onChange={(e) => onChange(e.target.value)}
      className="w-24 px-2 py-1 border border-emerald-200 rounded text-xs bg-emerald-50 text-emerald-900 focus:ring-1 focus:ring-emerald-500 outline-none"
    >
      <option value="EDI">EDI</option>
      <option value="Client">Client</option>
    </select>
  </div>
);

const PolymerDosingSection = ({ data, setData, calculations }) => {
  // Updates nested equipment state: data.equipment[unit][field]
  const handleEquipmentChange = (unit, field, value) => {
    setData({
      ...data,
      equipment: {
        ...data.equipment,
        [unit]: {
          ...data.equipment[unit],
          [field]: value
        }
      }
    });
  };

  const handleParamChange = (field, value) => {
    setData({
      ...data,
      [field]: value
    });
  };

  const toggleRequired = () => {
    setData({ ...data, required: !data.required });
  };

  if (!data.required) {
    return (
      <div className="border border-slate-200 rounded p-3 mb-3 bg-slate-50 flex justify-between items-center opacity-70">
        <span className="font-semibold text-slate-700">Polymer Dosing System</span>
        <Button variant="ghost" size="sm" onClick={toggleRequired} className="text-slate-500 hover:text-emerald-600">
          <Square className="w-4 h-4 mr-2" /> Enable
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-emerald-100 rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 gap-2">
        <h4 className="font-bold text-emerald-800">Polymer Dosing System</h4>
        <div className="flex items-center gap-4">
          <ScopeSelect value={data.scope} onChange={v => setData({ ...data, scope: v })} />
          <Button variant="ghost" size="sm" onClick={toggleRequired} className="text-emerald-600 hover:text-red-600 h-8">
            <CheckSquare className="w-4 h-4 mr-2" /> Required
          </Button>
        </div>
      </div>

      {/* Basic Parameters */}
      <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded border border-slate-100">
        <InputField label="Polymer Ratio (kg/ton)" value={data.polymerRatio} onChange={v => handleParamChange('polymerRatio', v)} />
        <InputField label="Concentration (%)" value={data.polymerConcentration} onChange={v => handleParamChange('polymerConcentration', v)} />
      </div>

      {calculations && (
        <div className="bg-blue-50 border border-blue-100 rounded p-3 mb-4 text-sm text-blue-900 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col"><span className="text-xs font-semibold text-blue-700">Polymer Req</span><span className="font-bold">{calculations.polymerReqKgDay} kg/day</span></div>
          <div className="flex flex-col"><span className="text-xs font-semibold text-blue-700">Solution Vol</span><span className="font-bold">{calculations.dosingSolVolLitDay} L/day</span></div>
          <div className="flex flex-col"><span className="text-xs font-semibold text-blue-700">Dosing Flow</span><span className="font-bold">{calculations.dosingFlowRate} L/hr</span></div>
          <div className="flex flex-col"><span className="text-xs font-semibold text-blue-700">Calc Pump</span><span className="font-bold">{calculations.pumpCapacity} LPH</span></div>
        </div>
      )}

      {/* Equipment Configuration */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Prep Tank */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1 mb-2">Preparation Tank</p>
          <InputField label="Capacity (m³)" value={data.equipment.prepTank.capacity} onChange={v => handleEquipmentChange('prepTank', 'capacity', v)} />
          <SelectField label="MOC" value={data.equipment.prepTank.material} onChange={v => handleEquipmentChange('prepTank', 'material', v)} options={MOC_OPTIONS} required={true} />
          <InputField label="Qty" value={data.equipment.prepTank.qty} onChange={v => handleEquipmentChange('prepTank', 'qty', v)} />
        </div>

        {/* Dosing Tank */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1 mb-2">Dosing Tank</p>
          <InputField label="Capacity (m³)" value={data.equipment.dosingTank.capacity} onChange={v => handleEquipmentChange('dosingTank', 'capacity', v)} />
          <SelectField label="MOC" value={data.equipment.dosingTank.material} onChange={v => handleEquipmentChange('dosingTank', 'material', v)} options={MOC_OPTIONS} required={true} />
          <InputField label="Qty" value={data.equipment.dosingTank.qty} onChange={v => handleEquipmentChange('dosingTank', 'qty', v)} />
        </div>

        {/* Dosing Pumps */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1 mb-2">Dosing Pumps</p>
          <InputField label="Capacity (LPH)" value={data.equipment.dosingPumps.capacity} onChange={v => handleEquipmentChange('dosingPumps', 'capacity', v)} />
          <SelectField label="MOC" value={data.equipment.dosingPumps.material} onChange={v => handleEquipmentChange('dosingPumps', 'material', v)} options={['Standard', 'SS304', 'SS316', 'PP']} />
          <InputField label="Qty" value={data.equipment.dosingPumps.qty} onChange={v => handleEquipmentChange('dosingPumps', 'qty', v)} />
        </div>

         {/* Prep Agitator */}
         <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1 mb-2">Prep Agitator</p>
          <InputField label="Capacity" value={data.equipment.prepAgitator.capacity} onChange={v => handleEquipmentChange('prepAgitator', 'capacity', v)} />
          <SelectField label="MOC" value={data.equipment.prepAgitator.material} onChange={v => handleEquipmentChange('prepAgitator', 'material', v)} options={['SS316', 'SS304', 'MS', 'MSRL']} />
          <InputField label="Qty" value={data.equipment.prepAgitator.qty} onChange={v => handleEquipmentChange('prepAgitator', 'qty', v)} />
        </div>

        {/* Dosing Agitator */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1 mb-2">Dosing Agitator</p>
          <InputField label="Capacity" value={data.equipment.dosingAgitator.capacity} onChange={v => handleEquipmentChange('dosingAgitator', 'capacity', v)} />
          <SelectField label="MOC" value={data.equipment.dosingAgitator.material} onChange={v => handleEquipmentChange('dosingAgitator', 'material', v)} options={['SS316', 'SS304', 'MS', 'MSRL']} />
          <InputField label="Qty" value={data.equipment.dosingAgitator.qty} onChange={v => handleEquipmentChange('dosingAgitator', 'qty', v)} />
        </div>
      </div>
    </div>
  );
};

export default PolymerDosingSection;
