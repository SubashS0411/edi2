import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Lock, AlertTriangle, Info, Wind, Activity, Zap, Box, Layers, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportantConsiderationsSection from './ImportantConsiderationsSection';
import PolymerDosingSection from './PolymerDosingSection';
import CoagulantDosingSection from './CoagulantDosingSection';
import AirBlowerSection from './AirBlowerSection';
import SludgeHandlingSection from './SludgeHandlingSection';
import FiltersSection from './FiltersSection';
import MultigradeFilterSection from './MultigradeFilterSection';
import ActivatedCarbonFilterSection from './ActivatedCarbonFilterSection';
import {
  calculateBiomassTankCapacity,
  calculateSurfaceAeratorHP,
  calculateMotorQuantity,
  calculateFineBubbleDiffusers,
  calculateHydrodynamicDiffusers,
  calculateAdditionalVolume,
  calculateVolumePerTank,
  calculateRectangularTankDimensions,
  calculateSquareTankDimensions,
  calculateCircularTankDimensions,
  STANDARD_MOTOR_HP,
  calculateFilterFeedPumpCapacity,
  calculateBiogasFlareCapacity,
  calculateBiomassHoldingTankCapacity
} from '@/utils/engineeringCalculations';


// Shared Components from ProposalGenerator
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

const SelectField = ({ label, value, onChange, options, disabled = false, required = false, error }) => (
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
        className={`w-full px-3 py-1.5 border ${error ? 'border-red-500' : (required && (!value || value === 'Select MOC') ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white')} rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-gray-900 
          ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
      >
        {options.map(opt => <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>)}
      </select>
    </div>
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

const MOC_OPTIONS = ['Select MOC', 'MSEP', 'SS304', 'SS316', 'RCC', 'PP', 'FRP', 'HDPE', 'MS', 'MSRL'];

const EquipmentCard = ({ name, data, onChange, calculatedValues, fieldOptions }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const toggleRequired = () => {
    onChange({ ...data, required: !data.required });
  };

  if (!data.required) {
    return (
      <div className="border border-slate-200 rounded p-3 mb-3 bg-slate-50 flex justify-between items-center opacity-70">
        <span className="font-semibold text-slate-700">{name}</span>
        <Button variant="ghost" size="sm" onClick={toggleRequired} className="text-slate-500 hover:text-emerald-600 disabled:opacity-50">
          <Square className="w-4 h-4 mr-2" /> Enable
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-emerald-100 rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex flex-wrap justify-between items-center mb-3 pb-2 border-b border-slate-100 gap-2">
        <h4 className="font-bold text-emerald-800">{name}</h4>
        <div className="flex items-center gap-4">
          <ScopeSelect value={data.scope} onChange={v => handleChange('scope', v)} />
          <Button variant="ghost" size="sm" onClick={toggleRequired} className="text-emerald-600 hover:text-red-600 h-8 disabled:opacity-50">
            <CheckSquare className="w-4 h-4 mr-2" /> Required
          </Button>
        </div>
      </div>

      {calculatedValues && (
        <div className="bg-blue-50 border border-blue-100 rounded p-3 mb-4 text-sm text-blue-900 grid grid-cols-2 gap-4">
          {Object.entries(calculatedValues).map(([key, val]) => (
            <div key={key} className="flex flex-col">
              <span className="text-xs font-semibold text-blue-700 uppercase">{key}</span>
              <span className="font-bold text-gray-900">{val}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(data).map(([key, val]) => {
          // Filters
          if (['required', 'scope', 'selectedDiameter', 'selectedHeight', 'selectedSize', 'shape', 'height', 'width', 'airBlowerData', 'surfaceAeratorData', 'diffuserType', 'tankGeometry'].includes(key)) return null;
          // Aeration calc fields filter (capacity only hidden for aeration-related cards)
          if (['bodLoad', 'hrt', 'fmRatio', 'mlss', 'dimension', 'bodEntering', 'hpRequired', 'kgO2Day', 'kgO2Hr', 'motorHP', 'selectedHP'].includes(key)) return null;
          if (key === 'capacity' && (name.includes('Aeration') || name.includes('Surface Aerators'))) return null;

          if (typeof val === 'object' && val !== null) return null;

          // Priority 1: Custom Field Options
          if (fieldOptions && fieldOptions[key]) {
            const UNIT_MAP_SELECT = { capacity: 'm³', agitatorQuantity: 'Nos', power: 'kW', head: 'm', flow: 'm³', qty: 'Nos', hpPumpQty: 'Nos', airCompQty: 'Nos' };
            const SELECT_LABEL_OVERRIDES = { 'Biogas Flare__head': 'Height (m)' };
            const selectOverrideKey = `${name}__${key}`;
            const rawSelectLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const selectLabel = SELECT_LABEL_OVERRIDES[selectOverrideKey] || (UNIT_MAP_SELECT[key] ? `${rawSelectLabel} (${UNIT_MAP_SELECT[key]})` : rawSelectLabel);
            return (
              <SelectField
                key={key}
                label={selectLabel}
                value={val}
                onChange={v => handleChange(key, v)}
                options={fieldOptions[key]}
              />
            );
          }

          // Priority 2: Standard MOC Dropdown
          if (key.toLowerCase() === 'moc') {
            return (
              <SelectField
                key={key}
                label="Material of Construction (MOC)"
                value={val || 'Select MOC'}
                onChange={v => handleChange(key, v)}
                options={MOC_OPTIONS}
                required={true}
              />
            );
          }

          // Priority 3: Standard Qty Dropdown (1-10)
          if (key === 'qty') {
            return (
              <SelectField
                key={key}
                label="Qty (Nos)"
                value={val}
                onChange={v => handleChange(key, v)}
                options={Array.from({ length: 10 }, (_, i) => (i + 1).toString())}
              />
            );
          }

          const UNIT_MAP = { capacity: 'm³', agitatorQuantity: 'Nos', power: 'kW', head: 'm', flow: 'm³', inletTSS: 'mg/L', outletTSS: 'mg/L', qty: 'Nos', hpPumpCapacity: 'm³/hr', hpPumpHead: 'm', hpPumpQty: 'Nos', airCompCapacity: 'CFM', airCompPressure: 'Bar', airCompQty: 'Nos' };
          // Label overrides for specific card + field combinations
          const LABEL_OVERRIDES = { 'Biogas Flare__head': 'Height (m)' };
          const overrideKey = `${name}__${key}`;
          const rawLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          const label = LABEL_OVERRIDES[overrideKey] || (UNIT_MAP[key] ? `${rawLabel} (${UNIT_MAP[key]})` : rawLabel);
          // Read-only logic preserved just in case
          const isReadOnly = key === 'qty' && name.includes('Surface Aerators');

          return (
            <InputField
              key={key}
              label={label}
              value={val}
              type={"text"}
              min={undefined}
              onChange={v => handleChange(key, v)}
              disabled={isReadOnly}
            />
          );
        })}
      </div>
    </div>
  );
};

const DosingSystemConfig = ({ name, data, onChange, calculatedValues, nutrientInputs, setNutrientInputs }) => {
  const handleChange = (section, field, value) => {
    onChange({
      ...data,
      [section]: { ...data[section], [field]: value }
    });
  };

  const toggleRequired = () => {
    const newData = { ...data, required: !data.required };
    onChange(newData);
  };

  const renderNutrientSection = () => {
    if (name.includes('Urea')) {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-3 mb-4">
          <div className="text-xs font-bold text-emerald-800 mb-2 uppercase">Urea Requirement Calculation</div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="N Required (kg/day)" value={nutrientInputs?.nRequired || ''} onChange={v => setNutrientInputs(prev => ({ ...prev, nRequired: v, ureaRequired: (parseFloat(v || 0) / 0.46).toFixed(2) }))} />
            <InputField label="Required Urea (kg/day)" value={nutrientInputs?.ureaRequired || ''} onChange={v => setNutrientInputs(prev => ({ ...prev, ureaRequired: v }))} />
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data.required) {
    return (
      <div className="border border-slate-200 rounded p-3 mb-3 bg-slate-50 flex justify-between items-center opacity-70">
        <span className="font-semibold text-slate-700">{name}</span>
        <Button variant="ghost" size="sm" onClick={toggleRequired} className="text-slate-500 hover:text-emerald-600 disabled:opacity-50">
          <Square className="w-4 h-4 mr-2" /> Enable
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-emerald-100 rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 gap-2">
        <h4 className="font-bold text-emerald-800">{name}</h4>
        <div className="flex items-center gap-4">
          <ScopeSelect value={data.scope} onChange={v => onChange({ ...data, scope: v })} />
          <Button variant="ghost" size="sm" onClick={toggleRequired} className="text-emerald-600 hover:text-red-600 h-8 disabled:opacity-50">
            <CheckSquare className="w-4 h-4 mr-2" /> Required
          </Button>
        </div>
      </div>
      {renderNutrientSection()}
      {calculatedValues && (
        <div className="bg-blue-50 border border-blue-100 rounded p-3 mb-4 text-sm text-blue-900 grid grid-cols-2 gap-4">
          {Object.entries(calculatedValues).map(([key, val]) => (
            <div key={key} className="flex flex-col">
              <span className="text-xs font-semibold text-blue-700 uppercase">{key}</span>
              <span className="font-bold text-gray-900">{val}</span>
            </div>
          ))}
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1 mb-2">Dosing Pump</p>
          <InputField label="Capacity (LPH)" value={data.pump.capacity} onChange={v => handleChange('pump', 'capacity', v)} />
          <InputField label="Head (m)" value={data.pump.head} onChange={v => handleChange('pump', 'head', v)} />
          <SelectField label="Type" value={data.pump.type} onChange={v => handleChange('pump', 'type', v)} options={['Positive Displacement', 'Diaphragm']} />
          <SelectField label="MOC" value={data.pump.moc} onChange={v => handleChange('pump', 'moc', v)} options={['PP', 'SS316', 'SS304', 'CI', 'Nitrile rubber', 'KCI/SS304/Nitrile Rubber']} />
          <InputField label="Qty (Nos)" value={data.pump.qty} onChange={v => handleChange('pump', 'qty', v)} />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1 mb-2">Dosing Tank</p>
          <InputField label="Capacity (Lit)" value={data.tank.capacity} onChange={v => handleChange('tank', 'capacity', v)} />
          <SelectField label="MOC" value={data.tank.moc} onChange={v => handleChange('tank', 'moc', v)} options={MOC_OPTIONS} />
          <InputField label="Qty (Nos)" value={data.tank.qty} onChange={v => handleChange('tank', 'qty', v)} />
        </div>
        {data.agitator && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1 mb-2">Agitator</p>
            <InputField label="Capacity" value={data.agitator.capacity} onChange={v => handleChange('agitator', 'capacity', v)} />
            <InputField label="RPM" value={data.agitator.rpm} onChange={v => handleChange('agitator', 'rpm', v)} />
            <SelectField label="MOC" value={data.agitator.moc} onChange={v => handleChange('agitator', 'moc', v)} options={['SS316', 'SS304', 'MS', 'MSRL']} />
            <InputField label="Qty (Nos)" value={data.agitator.qty} onChange={v => handleChange('agitator', 'qty', v)} />
          </div>
        )}
      </div>
    </div>
  );
};



const Step2 = ({
  clientInfo,
  proposalDetails,
  setProposalDetails,
  daf, setDaf,
  dafPolyDosing, setDafPolyDosing, dafPolyDosingCalc,
  dafCoagulantDosing, setDafCoagulantDosing, dafCoagulantDosingCalc,
  dosingSystems, setDosingSystems, dosingCalculations,
  nutrientInputs, setNutrientInputs,
  screens, setScreens,
  primaryClarifier, setPrimaryClarifier, primaryClarifierMech, setPrimaryClarifierMech, primarySludgePump, setPrimarySludgePump, coolingSystem, setCoolingSystem,
  preAcid, setPreAcid, anaerobicFeedPump, setAnaerobicFeedPump,
  anaerobicTank, setAnaerobicTank, standPipe, setStandPipe, biomassPump, setBiomassPump,
  biogasHolder, setBiogasHolder, biogasCivil, setBiogasCivil, biogasFlare, setBiogasFlare, biomassHoldingTank, setBiomassHoldingTank,
  aerationTank, setAerationTank, aerators, setAerators, airBlower, setAirBlower, diffusers, setDiffusers,
  secondaryClarifierTank, setSecondaryClarifierTank, secondaryClarifierMech, setSecondaryClarifierMech, sludgeRecircPump, setSludgeRecircPump,
  treatedWaterTank, setTreatedWaterTank, treatedWaterPump, setTreatedWaterPump,
  // Removed sludgeSystem and setSludgeSystem
  // Removed equipment and setEquipment
  impactAnalysis, guarantees, selectedSections,
  importantConsiderationsPoints, setImportantConsiderationsPoints,
  performanceSpecs, setPerformanceSpecs, performanceResults, setPerformanceResults,
  sludgeCalculationDetails, setSludgeCalculationDetails,
  filtersSpecs, setFiltersSpecs,
  mgfSpecs, setMgfSpecs,
  mgfCalculations, setMgfCalculations,
  acfSpecs, setAcfSpecs,
  acfCalculations, setAcfCalculations,
  params, anaerobicFeedParams
}) => {

  // Initialize nested specs if they don't exist
  useEffect(() => {
    setSludgeCalculationDetails(prev => {
      // Only update if something is missing to prevent infinite loops or overwrites
      const needsUpdate = !prev.prepTankSpecs || !prev.decanterSpecs || !prev.screwPressSpecs;

      if (!needsUpdate) return prev;

      return {
        ...prev,
        prepTankSpecs: prev.prepTankSpecs || { moc: 'MS', make: '', qty: '1', type: 'Vertical' },
        dosingTankSpecs: prev.dosingTankSpecs || { moc: 'MS', make: '', qty: '1', type: 'Vertical' },
        prepAgitatorSpecs: prev.prepAgitatorSpecs || { type: 'Paddle', make: '', qty: '1', moc: 'SS' },
        dosingAgitatorSpecs: prev.dosingAgitatorSpecs || { type: 'Paddle', make: '', qty: '1', moc: 'SS' },
        dosingPumpSpecs: prev.dosingPumpSpecs || { make: 'Hydroprokav', moc: 'CI', qty: '2 1W+1S', type: 'Positive Displacement' },
        decanterSpecs: prev.decanterSpecs || { make: 'Alfa Laval', qty: '1', mechanism: 'Decanter Centrifuge', moc: 'SS316 Screw', bowl: 'SS316' },
        screwPressSpecs: prev.screwPressSpecs || { make: 'SNP', qty: '1', mechanism: 'Screw Press', moc: 'SS316 Screw', bowl: 'SS316' },
        decanterRequired: prev.decanterRequired || false,
        screwPressRequired: prev.screwPressRequired || false,
        dewateringCapacityTons: prev.dewateringCapacityTons || '0.00',
        dewateringProcessingCapacityKgHr: prev.dewateringProcessingCapacityKgHr || '0.00'
      };
    });
  }, []);

  // Biogas and Biomass Holding Tank Calculations
  useEffect(() => {
    if (performanceResults && performanceSpecs) {
      // Biogas Flare Capacity
      const load = parseFloat(performanceSpecs.anaFlow || 0) * parseFloat(performanceSpecs.anaFeedSCOD || 0) / 1000; // kg sCOD/day
      const eff = parseFloat(performanceSpecs.anaSCODEff || 0);
      const biogasFactor = parseFloat(performanceSpecs.biogasFactor || 0);

      const flareCap = calculateBiogasFlareCapacity(load, eff, biogasFactor);
      if (biogasFlare.capacity !== flareCap) {
        setBiogasFlare(prev => ({ ...prev, capacity: flareCap }));
      }

      // Biomass Holding Tank Capacity
      const tankCap = calculateBiomassHoldingTankCapacity(load, eff);
      if (biomassHoldingTank.capacity !== tankCap) {
        setBiomassHoldingTank(prev => ({ ...prev, capacity: tankCap }));
      }
    }
  }, [performanceSpecs, performanceResults]);

  // Initialize Filters Specs if missing
  // Initialize Filters Specs if missing
  useEffect(() => {
    setFiltersSpecs(prev => {
      if (prev.filterFeedPump) return prev;
      return {
        ...prev,
        filterFeedPump: { make: 'Hydroprokav', moc: 'CI', type: 'Positive Displacement', qty: '1' }
      };
    });
  }, []);

  // Sync Calculative Pumps (Sludge Recirc & Treated Water & Clarifier Mech Size)
  useEffect(() => {
    if (anaerobicFeedParams) {
      const anaFlow = parseFloat(anaerobicFeedParams.find(p => p.name === 'Flow')?.value || 0);
      if (anaFlow > 0) {
        // Sludge Recirculation Pump Capacity = Anaerobic feed flow / 24
        const sludgeRecircCap = (anaFlow / 24).toFixed(2);
        if (sludgeRecircPump.capacity !== sludgeRecircCap) {
          setSludgeRecircPump(prev => ({ ...prev, capacity: sludgeRecircCap }));
        }

        // Treated Water Pump Capacity = (Anaerobic feed flow / 24) * 1.5
        const treatedWaterCap = ((anaFlow / 24) * 1.5).toFixed(2);
        if (treatedWaterPump.capacity !== treatedWaterCap) {
          setTreatedWaterPump(prev => ({ ...prev, capacity: treatedWaterCap }));
        }
      }
    }

    // Sync Primary Clarifier, Sludge Pump & Cooling System
    const anaFlow = parseFloat(anaerobicFeedParams.find(p => p.name === 'Flow')?.value || 0);
    const anaTSS = anaerobicFeedParams.find(p => p.name === 'TSS')?.value || '';

    if (anaFlow > 0) {
      // Primary Sludge Pump Capacity = 30% of Anaerobic Feed Flow (assuming flow is m3/day for pump sizing)
      // Usually pump cap is m3/hr. User said "Capacity (m3/hr) - 30% of anaerobic feed flow". 
      // If flow is m3/day, then 30% of daily flow? Or 30% of hourly flow?
      // Assuming user means capacity should be able to handle 30% of the *flow rate*.
      // If Anaerobic Feed Flow is X m3/day. Hourly = X/24. 
      // If "30% of anaerobic feed flow" implies recirculation or sludge volume, it's typically a ratio.
      // Let's interpret "30% of anaerobic feed flow" as (Flow * 0.30) / 24 if Flow is daily.
      const primarySludgeCap = ((anaFlow * 0.30) / 24).toFixed(2);
      if (primarySludgePump.capacity !== primarySludgeCap) {
        setPrimarySludgePump(prev => ({ ...prev, capacity: primarySludgeCap }));
      }

      // Cooling System Capacity = (Anaerobic Flow / 24) * 1.1
      const coolingCap = ((anaFlow / 24) * 1.1).toFixed(2);
      if (coolingSystem.capacity !== coolingCap) {
        setCoolingSystem(prev => ({ ...prev, capacity: coolingCap }));
      }
    }

    // Sync Primary Clarifier Outlet TSS from Anaerobic Feed TSS
    if (anaTSS && primaryClarifier.outletTSS !== anaTSS) {
      setPrimaryClarifier(prev => ({ ...prev, outletTSS: anaTSS }));
    }

    // Sync Primary Clarifier Mechanism Size/Qty from Clarifier
    if (primaryClarifier.capacity || primaryClarifier.qty) {
      const needsUpdate = primaryClarifierMech.capacity !== primaryClarifier.dim || primaryClarifierMech.qty !== primaryClarifier.qty;
      // Note: primaryClarifier 'dim' maps to 'capacity' (Size) for mech based on user request "Size - copy from primary clarifier dim"
      // Actually primaryClarifier has 'dim' field? Let's check state. 
      // State: primaryClarifier: { ..., dim: '', ... }
      if (needsUpdate) {
        setPrimaryClarifierMech(prev => ({ ...prev, capacity: primaryClarifier.dim, qty: primaryClarifier.qty }));
      }
    }

  }, [anaerobicFeedParams, secondaryClarifierTank.proposedDia, primaryClarifier.dim, primaryClarifier.qty, primaryClarifier.outletTSS]);



  // State for Surface Aerators Calculation
  const [surfaceAeratorCalc, setSurfaceAeratorCalc] = useState({
    bodEntering: 0,
    bodPerHour: 0,
    totalHP: 0,
    hpPerHour: 0,
    selectedHP: '',
    motorQty: 0,
    standbyMotors: 0,
    totalMotors: 0,
    configText: '-'
  });

  // State for Diffuser Calculation
  const [diffuserCalc, setDiffuserCalc] = useState({
    type: 'Fine Bubble',
    quantity: 0
  });

  // State for Aeration Tank Geometry
  const [aerationTankGeometry, setAerationTankGeometry] = useState({
    existingVolume: 0,
    additionalVolume: 0,
    quantity: 1,
    volumePerTank: 0,
    shape: 'Rectangular',
    height: '4',
    dimensions: '-',
    dimDetails: { length: 0, width: 0, side: 0, diameter: 0, height: 4 }
  });

  // Performance Guarantees Effect
  useEffect(() => {
    if (performanceSpecs) {
      const {
        anaFlow, anaFeedSCOD, anaFeedBOD, anaSCODEff, anaBODEff,
        aeroFlow, aeroFeedSCOD, aeroFeedBOD, aeroSCODEff, aeroBODEff,
        biogasFactor
      } = performanceSpecs;

      const kgSCODRemovedAna = (parseFloat(anaFlow || 0) * parseFloat(anaFeedSCOD || 0) * parseFloat(anaSCODEff || 0)) / 100000;
      const kgBODRemovedAna = (parseFloat(anaFlow || 0) * parseFloat(anaFeedBOD || 0) * parseFloat(anaBODEff || 0)) / 100000;
      const kgSCODRemovedAero = (parseFloat(aeroFlow || 0) * parseFloat(aeroFeedSCOD || 0) * parseFloat(aeroSCODEff || 0)) / 100000;
      const kgBODRemovedAero = (parseFloat(aeroFlow || 0) * parseFloat(aeroFeedBOD || 0) * parseFloat(aeroBODEff || 0)) / 100000;
      const biogasGen = kgSCODRemovedAna * parseFloat(biogasFactor || 0);

      setPerformanceResults({
        kgSCODRemovedAna: kgSCODRemovedAna.toFixed(2),
        kgBODRemovedAna: kgBODRemovedAna.toFixed(2),
        kgSCODRemovedAero: kgSCODRemovedAero.toFixed(2),
        kgBODRemovedAero: kgBODRemovedAero.toFixed(2),
        biogasGen: biogasGen.toFixed(2)
      });
    }
  }, [performanceSpecs, setPerformanceResults]);

  // Aeration & Surface Aerator Calculations
  useEffect(() => {
    // Use live inputs from Step 2 performanceSpecs
    const anaFlow = parseFloat(performanceSpecs?.anaFlow || 0);
    const anaFeedBOD = parseFloat(performanceSpecs?.anaFeedBOD || 0);
    const anaBODLoad = (anaFlow * anaFeedBOD) / 1000; // kg/day

    // Only proceed if we have meaningful data
    if (anaBODLoad > 0 || (clientInfo.anaerobicBODLoad && performanceResults)) {
      // Use the larger of live calculation or static clientInfo
      const effectiveBODLoad = anaBODLoad > 0 ? anaBODLoad : (parseFloat(clientInfo.anaerobicBODLoad) || 0);

      // Use dynamic efficiency from guarantees if available, else fallback
      const efficiency = parseFloat(guarantees?.anaerobicBODEff || performanceSpecs?.anaBODEff || 80);

      // Calculate entering BOD based on efficiency formula
      const bodEntering = Math.max(0, effectiveBODLoad * (1 - efficiency / 100));
      const removedBODAna = Math.max(0, effectiveBODLoad - bodEntering);

      const fm = parseFloat(aerationTank.fmRatio) || 0.15;
      const mlss = parseFloat(aerationTank.mlss) || 3500;

      let requiredVolume = 0;
      if (fm > 0 && mlss > 0) {
        requiredVolume = (bodEntering / (fm * mlss)) * 1000;
        if (aerationTank.capacity !== requiredVolume.toFixed(2)) {
          setAerationTank(prev => ({ ...prev, capacity: requiredVolume.toFixed(2), bodEntering: bodEntering.toFixed(2) }));
        }
      }

      // 2. Aeration Tank Geometry Calcs
      const additionalVol = calculateAdditionalVolume(requiredVolume, aerationTankGeometry.existingVolume);
      const volPerTank = calculateVolumePerTank(additionalVol, aerationTankGeometry.quantity);
      let dimRes = { text: '-' };
      if (aerationTankGeometry.shape === 'Rectangular') {
        dimRes = calculateRectangularTankDimensions(volPerTank, aerationTankGeometry.height);
      } else if (aerationTankGeometry.shape === 'Square') {
        dimRes = calculateSquareTankDimensions(volPerTank, aerationTankGeometry.height);
      } else if (aerationTankGeometry.shape === 'Circular') {
        dimRes = calculateCircularTankDimensions(volPerTank, aerationTankGeometry.height);
      }

      setAerationTankGeometry(prev => ({
        ...prev,
        additionalVolume: additionalVol,
        volumePerTank: volPerTank,
        dimensions: dimRes.text,
        dimDetails: dimRes
      }));

      // Update global aeration tank state for saving (including geometry)
      // Update global aeration tank state for saving (including geometry)
      setAerationTank(prev => ({
        ...prev,
        // Sync hardware specs
        capacity: requiredVolume.toFixed(2), // "add capacity - copy from aeration tank design (m3)"
        qty: aerationTankGeometry.quantity.toString(), // "Qty - copy from tank geometry configuration"
        tankGeometry: {
          existingVolume: aerationTankGeometry.existingVolume,
          additionalVolume: additionalVol,
          quantity: aerationTankGeometry.quantity,
          shape: aerationTankGeometry.shape,
          height: aerationTankGeometry.height,
          dimensions: dimRes.text
        }
      }));


      // 3. Surface Aerator Calcs
      const saResults = calculateSurfaceAeratorHP(effectiveBODLoad, removedBODAna);

      let motorConfig = { quantityRequired: 0, standbyMotors: 0, totalMotors: 0, motor_config_text: '-' };
      if (surfaceAeratorCalc.selectedHP) {
        motorConfig = calculateMotorQuantity(saResults.hpRatingRequired, surfaceAeratorCalc.selectedHP);
      }

      setSurfaceAeratorCalc(prev => ({
        ...prev,
        bodEntering: saResults.bodEnteringAeration,
        bodPerHour: saResults.bodPerHour,
        totalHP: saResults.totalHPRequiredDay,
        hpPerHour: saResults.hpRatingRequired,
        motorQty: motorConfig.quantityRequired,
        standbyMotors: motorConfig.standbyMotors,
        totalMotors: motorConfig.totalMotors,
        configText: motorConfig.motor_config_text
      }));

      // Update global aerators state for saving
      // Task 3: Auto-populate Surface Aerator Qty
      // Update global aerators state for saving
      // Task 3: Auto-populate Surface Aerator Qty, Power
      setAerators(prev => ({
        ...prev,
        qty: motorConfig.totalMotors > 0 ? motorConfig.totalMotors.toString() : prev.qty,
        power: surfaceAeratorCalc.selectedHP || prev.power, // "Power - copy from surface aerator calculation"
        surfaceAeratorData: {
          ...saResults,
          selectedHP: surfaceAeratorCalc.selectedHP,
          ...motorConfig
        }
      }));
    }
  }, [
    clientInfo.anaerobicBODLoad,
    performanceSpecs?.anaFlow,
    performanceSpecs?.anaFeedBOD,
    performanceSpecs?.anaFeedSCOD,
    performanceSpecs?.anaBODEff,
    performanceSpecs?.anaSCODEff,
    performanceSpecs?.aeroFlow,
    performanceSpecs?.aeroFeedBOD,
    performanceSpecs?.aeroFeedSCOD,
    performanceSpecs?.aeroBODEff,
    performanceSpecs?.aeroSCODEff,
    performanceResults?.kgBODRemovedAna,
    aerationTank.fmRatio,
    aerationTank.mlss,
    surfaceAeratorCalc.selectedHP,
    aerationTankGeometry.existingVolume,
    aerationTankGeometry.quantity,
    aerationTankGeometry.shape,
    aerationTankGeometry.height
  ]);

  // Diffuser Calculations
  useEffect(() => {
    if (airBlower.airBlowerData?.airRequirementPerHour) {
      const airReq = parseFloat(airBlower.airBlowerData.airRequirementPerHour);
      let qty = 0;
      if (diffuserCalc.type === 'Fine Bubble') {
        qty = calculateFineBubbleDiffusers(airReq).quantity;
      } else {
        qty = calculateHydrodynamicDiffusers(airReq).quantity;
      }

      setDiffuserCalc(prev => ({ ...prev, quantity: qty }));
      setDiffusers(prev => ({ ...prev, diffuserType: diffuserCalc.type, qty: qty }));
    }
  }, [airBlower.airBlowerData?.airRequirementPerHour, diffuserCalc.type]);

  const handleDiffuserTypeSelect = (type) => {
    // Sync make based on type
    const make = type === 'Hydrodynamic' ? 'Gasion' : 'Magnum/Sigma';
    setDiffuserCalc(prev => ({ ...prev, type }));
    setDiffusers(prev => ({ ...prev, type: type, make: make, diffuserType: type }));
  };

  const handleAirBlowerDataChange = (data) => {
    // Sync hardware specs
    // "QTY - Copy from Blower selection proposed configuration"
    // "Total air required - Copy from hourly air required"
    setAirBlower(prev => ({
      ...prev,
      airBlowerData: data,
      qty: data.total_blowers ? data.total_blowers.toString() : prev.qty,
      totalAirReq: data.airRequirementPerHour || prev.totalAirReq
    }));
  };

  const handleMotorHPSelect = (hp) => {
    setSurfaceAeratorCalc(prev => ({ ...prev, selectedHP: hp }));
  };



  // handleDiffuserTypeSelect moved up to be accessible before return

  // Generate height options: 2.0 to 10.0 step 0.5
  const heightOptions = Array.from({ length: 17 }, (_, i) => (2 + i * 0.5).toString());

  // Extract inputs for Sludge Calc
  const inletWaterFlow = params?.find(p => p.name === 'Flow')?.value || 0;
  const anaerobicFeedWaterFlow = anaerobicFeedParams?.find(p => p.name === 'Flow')?.value || 0;
  const anaerobicFeedWaterTSS = anaerobicFeedParams?.find(p => p.name === 'TSS')?.value || 0;
  const anaerobicFeedWaterCalcium = anaerobicFeedParams?.find(p => p.name === 'Calcium')?.value || 0;
  const kgBODPerDayEnteringAerobic = surfaceAeratorCalc.bodEntering;

  // Calculate Filter Feed Pump Capacity based on anaerobic feed flow
  const filterFeedPumpCapacity = calculateFilterFeedPumpCapacity(anaerobicFeedWaterFlow);



  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

      <div className="flex justify-between items-center mb-4 print:hidden">
        <h2 className="text-xl font-bold text-slate-800">Technical Specifications</h2>
      </div>
      <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 mb-6">
        <h4 className="font-bold text-slate-800 mb-3 border-b pb-2">Inputs</h4>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Anaerobic Section */}
          <div className="bg-white p-3 rounded border border-slate-100">
            <h5 className="font-bold text-sm text-emerald-800 mb-2">Anaerobic Parameters</h5>
            <InputField label="Feed Flow Rate (m³/day)" value={performanceSpecs?.anaFlow} onChange={v => setPerformanceSpecs({ ...performanceSpecs, anaFlow: v })} type="number" />
            <InputField label="Inlet sCOD (mg/l)" value={performanceSpecs?.anaFeedSCOD} onChange={v => setPerformanceSpecs({ ...performanceSpecs, anaFeedSCOD: v })} type="number" />
            <InputField label="Inlet BOD (mg/l)" value={performanceSpecs?.anaFeedBOD} onChange={v => setPerformanceSpecs({ ...performanceSpecs, anaFeedBOD: v })} type="number" />
            <div className="grid grid-cols-2 gap-2">
              <InputField label="sCOD Eff (%)" value={performanceSpecs?.anaSCODEff} onChange={v => setPerformanceSpecs({ ...performanceSpecs, anaSCODEff: v })} type="number" />
              <InputField label="BOD Eff (%)" value={performanceSpecs?.anaBODEff} onChange={v => setPerformanceSpecs({ ...performanceSpecs, anaBODEff: v })} type="number" />
            </div>
            <InputField label="Biogas Factor (NM³/kg)" value={performanceSpecs?.biogasFactor} onChange={v => setPerformanceSpecs({ ...performanceSpecs, biogasFactor: v })} type="number" />
          </div>

          {/* Aerobic Section */}
          <div className="bg-white p-3 rounded border border-slate-100">
            <h5 className="font-bold text-sm text-blue-800 mb-2">Aerobic Parameters</h5>
            <InputField label="Feed Flow Rate (m³/day)" value={performanceSpecs?.aeroFlow} onChange={v => setPerformanceSpecs({ ...performanceSpecs, aeroFlow: v })} type="number" />
            <InputField label="Inlet sCOD (mg/l)" value={performanceSpecs?.aeroFeedSCOD} onChange={v => setPerformanceSpecs({ ...performanceSpecs, aeroFeedSCOD: v })} type="number" />
            <InputField label="Inlet BOD (mg/l)" value={performanceSpecs?.aeroFeedBOD} onChange={v => setPerformanceSpecs({ ...performanceSpecs, aeroFeedBOD: v })} type="number" />
            <div className="grid grid-cols-2 gap-2">
              <InputField label="sCOD Eff (%)" value={performanceSpecs?.aeroSCODEff} onChange={v => setPerformanceSpecs({ ...performanceSpecs, aeroSCODEff: v })} type="number" />
              <InputField label="BOD Eff (%)" value={performanceSpecs?.aeroBODEff} onChange={v => setPerformanceSpecs({ ...performanceSpecs, aeroBODEff: v })} type="number" />
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Calculated Results Panel */}
      {performanceResults && (
        <div className="border border-emerald-200 rounded-lg p-4 bg-gradient-to-br from-emerald-50 to-blue-50 mb-6 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-3 border-b border-emerald-200 pb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-emerald-600" />
            Real-Time Calculated Results
          </h4>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Anaerobic Results */}
            <div className="bg-white p-3 rounded border border-emerald-100">
              <h5 className="font-bold text-sm text-emerald-800 mb-2">Anaerobic Results</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">kg sCOD Removed/day</span>
                  <span className="font-bold text-emerald-700 text-lg">{performanceResults.kgSCODRemovedAna || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">kg BOD Removed/day</span>
                  <span className="font-bold text-emerald-700 text-lg">{performanceResults.kgBODRemovedAna || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center border-t border-emerald-100 pt-2">
                  <span className="text-xs font-semibold text-slate-700">Biogas Generation (Nm³/day)</span>
                  <span className="font-bold text-amber-600 text-lg">{performanceResults.biogasGen || '0.00'}</span>
                </div>
              </div>
            </div>
            {/* Aerobic Results */}
            <div className="bg-white p-3 rounded border border-blue-100">
              <h5 className="font-bold text-sm text-blue-800 mb-2">Aerobic Results</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">kg sCOD Removed/day</span>
                  <span className="font-bold text-blue-700 text-lg">{performanceResults.kgSCODRemovedAero || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">kg BOD Removed/day</span>
                  <span className="font-bold text-blue-700 text-lg">{performanceResults.kgBODRemovedAero || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center border-t border-blue-100 pt-2">
                  <span className="text-xs font-semibold text-slate-700">BOD Entering Aeration (kg/day)</span>
                  <span className="font-bold text-orange-600 text-lg">{surfaceAeratorCalc.bodEntering || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <SectionHeader title="Pre-Treatment & Screening" />
      <EquipmentCard name="Screens" data={screens} onChange={setScreens} />
      <EquipmentCard
        name="Pre-Acidification Tank"
        data={preAcid}
        onChange={setPreAcid}
        fieldOptions={{
          agitator: ['Yes', 'No'],
          agitatorType: ['Submersible', 'Top Mounted'],
          agitatorQuantity: ['1', '2', '3', '4', '5']
        }}
      />

      <SectionHeader title="DAF System (if required)" />
      <EquipmentCard name="DAF Unit" data={daf} onChange={setDaf} />

      {daf.required && (
        <>
          <SectionHeader title="4.1.1 Dosing Systems" />
          <PolymerDosingSection data={dafPolyDosing} setData={setDafPolyDosing} calculations={dafPolyDosingCalc} />
          <CoagulantDosingSection data={dafCoagulantDosing} setData={setDafCoagulantDosing} calculations={dafCoagulantDosingCalc} />
        </>
      )}

      {selectedSections.includes('Anaerobic Section') && (
        <>
          <SectionHeader title="Anaerobic Section" />
          <EquipmentCard
            name="Anaerobic Tank"
            data={anaerobicTank}
            onChange={setAnaerobicTank}
            fieldOptions={{
              diameter: Array.from({ length: 391 }, (_, i) => (1 + i * 0.1).toFixed(1)),
              height: Array.from({ length: 241 }, (_, i) => (6 + i * 0.1).toFixed(1))
            }}
          />
          <EquipmentCard name="Stand Pipe" data={standPipe} onChange={setStandPipe} />
          <EquipmentCard
            name="Anaerobic Feed Pump"
            data={anaerobicFeedPump}
            onChange={setAnaerobicFeedPump}
            fieldOptions={{
              head: Array.from({ length: 21 }, (_, i) => (20 + i).toString())
            }}
          />
          <EquipmentCard
            name="Biomass Pump"
            data={biomassPump}
            onChange={setBiomassPump}
            fieldOptions={{
              head: Array.from({ length: 31 }, (_, i) => (10 + i).toString()),
              moc: ['CI/Nitrile rubber']
            }}
          />

          <SectionHeader title="Biogas Handling" />
          <EquipmentCard name="Biogas Holder (Mechanical)" data={biogasHolder} onChange={setBiogasHolder} />
          <EquipmentCard name="Biogas Civil (Storage)" data={biogasCivil} onChange={setBiogasCivil} />
          <EquipmentCard
            name="Biogas Flare"
            data={biogasFlare}
            onChange={setBiogasFlare}
            fieldOptions={{
              head: Array.from({ length: 8 }, (_, i) => (8 + i).toString())
            }}
          />

          <EquipmentCard name="Biomass Holding Tank" data={biomassHoldingTank} onChange={setBiomassHoldingTank} fieldOptions={{ capacity: Array.from({ length: 8 }, (_, i) => ((i + 1) * 50).toString()) }} />
        </>
      )}

      {selectedSections.includes('Aerobic Section') && (
        <>
          <SectionHeader title="Aeration Section" />

          <div className="border border-blue-100 rounded-lg p-4 mb-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-blue-100">
              <h4 className="font-bold text-blue-800 flex items-center"><Layers className="w-4 h-4 mr-2" /> Aeration Tank Design</h4>
            </div>

            {/* Volume Calculation */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <InputField label="F/M Ratio" value={aerationTank.fmRatio} onChange={v => setAerationTank({ ...aerationTank, fmRatio: v })} />
              <InputField label="MLSS (mg/L)" value={aerationTank.mlss} onChange={v => setAerationTank({ ...aerationTank, mlss: v })} />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <InputField
                label="Existing Aeration Volume (m³)"
                value={aerationTankGeometry.existingVolume}
                onChange={v => setAerationTankGeometry(prev => ({ ...prev, existingVolume: v }))}
                type="number"
                placeholder="0 if none"
              />
              <div className="bg-blue-50 p-2 rounded border border-blue-100 flex flex-col">
                <span className="text-xs font-semibold text-blue-700">Total Required</span>
                <span className="font-bold text-gray-900 text-lg">{aerationTank.capacity || '0.00'} m³</span>
              </div>
              <div className="bg-yellow-50 p-2 rounded border border-yellow-100 flex flex-col">
                <span className="text-xs font-semibold text-yellow-700">Additional Needed</span>
                <span className="font-bold text-gray-900 text-lg">{aerationTankGeometry.additionalVolume} m³</span>
              </div>
            </div>

            {/* Geometry Selection */}
            <div className="border-t border-blue-100 pt-3">
              <h5 className="font-semibold text-sm text-blue-800 mb-3 flex items-center"><Ruler className="w-4 h-4 mr-2" /> Tank Geometry Configuration</h5>
              <div className="grid md:grid-cols-4 gap-4">
                <SelectField
                  label="Quantity"
                  value={aerationTankGeometry.quantity}
                  onChange={v => setAerationTankGeometry(prev => ({ ...prev, quantity: v }))}
                  options={Array.from({ length: 10 }, (_, i) => (i + 1).toString())}
                  required
                />
                <SelectField
                  label="Shape"
                  value={aerationTankGeometry.shape}
                  onChange={v => setAerationTankGeometry(prev => ({ ...prev, shape: v }))}
                  options={['Rectangular', 'Square', 'Circular']}
                  required
                />
                <SelectField
                  label="Height (m)"
                  value={aerationTankGeometry.height}
                  onChange={v => setAerationTankGeometry(prev => ({ ...prev, height: v }))}
                  options={heightOptions}
                  required
                />
                <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-center">
                  <span className="text-xs font-semibold text-slate-500">Volume per Tank</span>
                  <span className="font-bold text-slate-800">{aerationTankGeometry.volumePerTank} m³</span>
                </div>
              </div>

              <div className="mt-3 bg-blue-50 p-3 rounded border border-blue-200 text-center">
                <span className="text-xs font-bold text-blue-600 uppercase block mb-1">Calculated Dimensions</span>
                <span className="text-lg font-mono font-bold text-blue-900">{aerationTankGeometry.dimensions}</span>
              </div>
            </div>
          </div>

          {/* Surface Aerator Section */}
          <div className="border border-blue-100 rounded-lg p-4 mb-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-blue-100">
              <h4 className="font-bold text-blue-800 flex items-center"><Zap className="w-4 h-4 mr-2" /> Surface Aerator Calculation</h4>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-4 bg-blue-50 p-3 rounded border border-blue-100">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-blue-700 uppercase">Total HP (Daily Agg.)</span>
                <span className="font-bold text-gray-900">{surfaceAeratorCalc.totalHP} HP-hr/day</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-blue-700 uppercase">HP Rating (Required)</span>
                <span className="font-bold text-gray-900 text-lg">{surfaceAeratorCalc.hpPerHour} HP</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-blue-700 uppercase">kg BOD/hr</span>
                <span className="font-bold text-gray-900">{surfaceAeratorCalc.bodPerHour} kg/hr</span>
              </div>
            </div>

            <div className="mb-3 relative group w-full md:w-1/2">
              <SelectField
                label="Select Standard Motor HP"
                value={surfaceAeratorCalc.selectedHP}
                onChange={handleMotorHPSelect}
                options={[{ label: 'Select HP', value: '' }, ...STANDARD_MOTOR_HP.map(hp => ({ label: `${hp} HP`, value: hp }))]}
                error={!surfaceAeratorCalc.selectedHP ? "Required" : null}
              />
            </div>

            {surfaceAeratorCalc.selectedHP && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Configuration</div>
                <div className="text-lg font-bold text-emerald-700">{surfaceAeratorCalc.configText}</div>
                <div className="text-xs text-slate-400">({surfaceAeratorCalc.totalMotors} Motors Total)</div>
              </div>
            )}
          </div>

          {/* Air Blower Section - Use dynamic calculated values */}
          <AirBlowerSection
            initialBOD={(() => {
              const anaFlow = parseFloat(performanceSpecs?.anaFlow || 0);
              const anaFeedBOD = parseFloat(performanceSpecs?.anaFeedBOD || 0);
              const dynamicLoad = (anaFlow * anaFeedBOD) / 1000;
              return dynamicLoad > 0 ? dynamicLoad.toFixed(2) : (clientInfo.anaerobicBODLoad || '');
            })()}
            initialBODRemoval={performanceResults?.kgBODRemovedAna}
            onDataChange={handleAirBlowerDataChange}
          />

          {/* Diffuser Selection Section */}
          <div className="border border-indigo-100 rounded-lg p-4 mb-4 bg-white shadow-sm">
            <h4 className="font-bold text-indigo-800 mb-3 flex items-center"><Activity className="w-4 h-4 mr-2" /> Diffuser Selection</h4>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <SelectField
                  label="Diffuser Type"
                  value={diffuserCalc.type}
                  onChange={handleDiffuserTypeSelect} // Updated handler
                  options={['Hydrodynamic', 'Fine Bubble']} // Updated text to match requirement
                />
              </div>
              <div className="bg-indigo-50 p-3 rounded border border-indigo-100 flex flex-col justify-center">
                <span className="text-xs font-semibold text-indigo-500 uppercase">Calculated Quantity</span>
                <span className="text-xl font-bold text-indigo-900">{diffuserCalc.quantity}</span>
                <span className="text-xs text-indigo-400 mt-1">Based on Air Req & Type</span>
              </div>
            </div>
            {/* Diffuser Hardware Card */}
            <EquipmentCard
              name="Diffuser Hardware"
              data={diffusers}
              onChange={setDiffusers}
              fieldOptions={{
                type: ['Hydrodynamic', 'Fine Bubble'],
                make: ['Gasion', 'Magnum/Sigma']
              }}
            />
          </div>

          <EquipmentCard name="Aeration Tank (Hardware)" data={aerationTank} onChange={setAerationTank} />
          <EquipmentCard name="Surface Aerators (Hardware)" data={aerators} onChange={setAerators} />
          <EquipmentCard name="Air Blower" data={airBlower} onChange={setAirBlower} />

          <SectionHeader title="Secondary Clarification" />
          <EquipmentCard name="Secondary Clarifier Tank" data={secondaryClarifierTank} onChange={setSecondaryClarifierTank} />
          <EquipmentCard
            name="Secondary Clarifier Mechanism"
            data={secondaryClarifierMech}
            onChange={setSecondaryClarifierMech}
            fieldOptions={{
              make: ['Indofab/Filsep/Smaart/EQT']
            }}
          />
          <EquipmentCard name="Sludge Recirculation Pump" data={sludgeRecircPump} onChange={setSludgeRecircPump} />
        </>
      )}

      {selectedSections.includes('Filter Section') && (
        <>
          <SectionHeader title="Treated Water Handling" />
          <EquipmentCard name="Treated Water Tank" data={treatedWaterTank} onChange={setTreatedWaterTank} />
          <EquipmentCard
            name="Treated Water Pump"
            data={treatedWaterPump}
            onChange={setTreatedWaterPump}
            fieldOptions={{
              moc: ['CI/SS304']
            }}
          />
        </>
      )}

      <SectionHeader title="Primary Treatment (Paper Industry)" />
      {clientInfo.industry === 'Paper' && (
        <>
          <EquipmentCard name="Primary Clarifier" data={primaryClarifier} onChange={setPrimaryClarifier} />
          <EquipmentCard
            name="Primary Clarifier Mechanism"
            data={primaryClarifierMech}
            onChange={setPrimaryClarifierMech}
            fieldOptions={{
              make: ['Indofab/Filsep/Smaart/EQT']
            }}
          />
          <EquipmentCard name="Primary Sludge Pump" data={primarySludgePump} onChange={setPrimarySludgePump} />
          <EquipmentCard name="Cooling System" data={coolingSystem} onChange={setCoolingSystem} />
        </>
      )}

      <SectionHeader title="Dosing Systems (Others)" />
      {Object.entries(dosingSystems).map(([name, data]) => (
        <DosingSystemConfig
          key={name}
          name={name}
          data={data}
          onChange={newData => setDosingSystems(prev => ({ ...prev, [name]: newData }))}
          calculatedValues={dosingCalculations[name.toLowerCase().replace(/\s+/g, '')] || dosingCalculations[name.toLowerCase().replace(/\s+/g, '').replace('acid', 'acid')]}
          nutrientInputs={nutrientInputs}
          setNutrientInputs={setNutrientInputs}
        />
      ))}

      <SectionHeader title="Sludge Handling" />

      {/* New Sludge Calculation Section */}
      <SludgeHandlingSection
        data={sludgeCalculationDetails}
        setData={setSludgeCalculationDetails}
        inletWaterFlow={inletWaterFlow}
        anaerobicFeedWaterFlow={anaerobicFeedWaterFlow}
        anaerobicFeedWaterTSS={anaerobicFeedWaterTSS}
        kgBODPerDayEnteringAerobic={kgBODPerDayEnteringAerobic}
        anaerobicFeedWaterCalcium={anaerobicFeedWaterCalcium}
      />

      <div className="mb-4 bg-white p-3 rounded border border-indigo-200">
        <p className="text-xs font-bold text-indigo-700 uppercase mb-1">Calculated Filter Feed Pump Capacity</p>
        <p className="text-xl font-bold text-indigo-900">{filterFeedPumpCapacity} m³/hr</p>
        <p className="text-[10px] text-slate-400">Based on Anaerobic Feed Flow / 24</p>
      </div>

      <FiltersSection
        data={filtersSpecs}
        setData={setFiltersSpecs}
      />

      <MultigradeFilterSection
        data={mgfSpecs}
        setData={setMgfSpecs}
        calculations={mgfCalculations}
        setCalculations={setMgfCalculations}
        anaerobicFeedFlow={anaerobicFeedWaterFlow}
      />

      <ActivatedCarbonFilterSection
        data={acfSpecs}
        setData={setAcfSpecs}
        calculations={acfCalculations}
        setCalculations={setAcfCalculations}
        anaerobicFeedFlow={anaerobicFeedWaterFlow}
      />


    </div>
  );
};

export default Step2;