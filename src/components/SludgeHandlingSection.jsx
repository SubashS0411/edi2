import React, { useEffect } from 'react';
import { Trash2, Activity, Square, CheckSquare, Beaker, Zap, Settings, Thermometer, Briefcase, Filter } from 'lucide-react';
import {
  calculateTotalSludgeGeneration,
  calculateFinalSludgeConsistency,
  calculateSecondarySludge,
  calculateTonsSolidsGeneration,
  calculateKgPolyRequired,
  calculatePrepTankVolume,
  calculateDosingTankVolume,
  calculatePrepTankAgitatorPower,
  calculateDosingTankAgitatorPower,
  calculateDewateringProcessingCapacity
} from '@/utils/engineeringCalculations';

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

const SludgeSourceCard = ({
  title,
  required,
  onToggleRequired,
  sludgeVolume,
  consistency,
  onConsistencyChange
}) => (
  <div className={`p-3 rounded border transition-colors duration-200 ${required ? 'bg-white border-amber-200' : 'bg-slate-50 border-slate-200 opacity-75'}`}>
    <div className="flex justify-between items-center mb-3 pb-2 border-b border-dashed border-slate-200">
      <h5 className={`font-bold text-sm ${required ? 'text-amber-800' : 'text-slate-500'}`}>{title}</h5>
      <button
        onClick={onToggleRequired}
        className={`flex items-center text-xs font-medium px-2 py-1 rounded transition-colors
          ${required ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700' : 'bg-slate-200 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'}`}
      >
        {required ? <CheckSquare className="w-3 h-3 mr-1" /> : <Square className="w-3 h-3 mr-1" />}
        {required ? 'Enabled' : 'Disabled'}
      </button>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col justify-center">
        <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Sludge Volume</span>
        <span className={`text-lg font-bold ${required ? 'text-slate-800' : 'text-slate-400'}`}>
          {sludgeVolume} <span className="text-xs font-normal text-slate-500">m³/day</span>
        </span>
      </div>
      <InputField
        label="Consistency (%)"
        value={consistency}
        onChange={onConsistencyChange}
        disabled={!required}
        type="number"
      />
    </div>
  </div>
);

const SpecsSection = ({ title, icon: Icon, children }) => (
  <div className="border border-slate-200 rounded p-3 bg-white mb-4">
    <div className="text-xs font-bold text-slate-700 uppercase mb-3 border-b pb-1 flex items-center">
      {Icon && <Icon className="w-3 h-3 mr-2 text-amber-600" />} {title}
    </div>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

const SludgeHandlingSection = ({
  data,
  setData,
  inletWaterFlow,
  anaerobicFeedWaterFlow,
  anaerobicFeedWaterTSS,
  kgBODPerDayEnteringAerobic,
  anaerobicFeedWaterCalcium
}) => {

  // Calculations Effect
  useEffect(() => {
    let pSludge = 0;
    let dSludge = 0;
    let sSludge = 0;

    // 1. Primary Clarifier Sludge
    if (data.primaryRequired) {
      const inlet = parseFloat(inletWaterFlow || 0);
      const anaFeed = parseFloat(anaerobicFeedWaterFlow || 0);
      pSludge = Math.max(0, inlet - anaFeed);
    }

    // 2. DAF Sludge
    if (data.dafRequired) {
      const inlet = parseFloat(inletWaterFlow || 0);
      // Formula: Inlet water flow * 0.01 (1%)
      dSludge = inlet * 0.01;
    }

    // 3. Secondary Clarifier Sludge
    if (data.secondaryRequired) {
      sSludge = parseFloat(calculateSecondarySludge(
        anaerobicFeedWaterFlow,
        anaerobicFeedWaterTSS,
        kgBODPerDayEnteringAerobic,
        anaerobicFeedWaterCalcium
      ));
    }

    const pSludgeStr = pSludge.toFixed(2);
    const dSludgeStr = dSludge.toFixed(2);
    const sSludgeStr = sSludge.toFixed(2);

    const total = calculateTotalSludgeGeneration(
      data.primaryRequired ? pSludgeStr : 0,
      data.dafRequired ? dSludgeStr : 0,
      data.secondaryRequired ? sSludgeStr : 0
    );

    // Only pass values if enabled to weighted average calc
    const consistency = calculateFinalSludgeConsistency(
      data.primaryRequired ? pSludgeStr : 0, data.primaryConsistency,
      data.dafRequired ? dSludgeStr : 0, data.dafConsistency,
      data.secondaryRequired ? sSludgeStr : 0, data.secondaryConsistency
    );

    // Calculate Solids & Poly
    const tonsSolids = calculateTonsSolidsGeneration(total, consistency);
    const kgPoly = calculateKgPolyRequired(tonsSolids);
    const prepVol = calculatePrepTankVolume(kgPoly);
    const doseVol = calculateDosingTankVolume(kgPoly);
    const prepPower = calculatePrepTankAgitatorPower(prepVol);
    const dosePower = calculateDosingTankAgitatorPower(doseVol);

    // Calculate Dewatering Capacities
    // Dewatering unit capacity (tons/day) = Solids generation (tons/day)
    const dewateringCap = tonsSolids;
    const processCap = calculateDewateringProcessingCapacity(tonsSolids);

    // Update state if different
    if (
      data.primarySludge !== pSludgeStr ||
      data.dafSludge !== dSludgeStr ||
      data.secondarySludge !== sSludgeStr ||
      data.totalSludge !== total ||
      data.finalConsistency !== consistency ||
      data.tonsSolidsGeneration !== tonsSolids ||
      data.kgPolyRequired !== kgPoly ||
      data.prepTankVolume !== prepVol ||
      data.dosingTankVolume !== doseVol ||
      data.prepTankAgitatorPower !== prepPower ||
      data.dosingTankAgitatorPower !== dosePower ||
      data.dewateringCapacityTons !== dewateringCap ||
      data.dewateringProcessingCapacityKgHr !== processCap
    ) {
      setData(prev => ({
        ...prev,
        primarySludge: pSludgeStr,
        dafSludge: dSludgeStr,
        secondarySludge: sSludgeStr,
        totalSludge: total,
        finalConsistency: consistency,
        tonsSolidsGeneration: tonsSolids,
        kgPolyRequired: kgPoly,
        prepTankVolume: prepVol,
        dosingTankVolume: doseVol,
        prepTankAgitatorPower: prepPower,
        dosingTankAgitatorPower: dosePower,
        dewateringCapacityTons: dewateringCap,
        dewateringProcessingCapacityKgHr: processCap
      }));
    }
  }, [
    data.primaryRequired, data.dafRequired, data.secondaryRequired,
    data.primaryConsistency, data.dafConsistency, data.secondaryConsistency,
    inletWaterFlow, anaerobicFeedWaterFlow, anaerobicFeedWaterTSS,
    kgBODPerDayEnteringAerobic, anaerobicFeedWaterCalcium,
    setData, data.primarySludge, data.dafSludge, data.secondarySludge, data.totalSludge, data.finalConsistency,
    data.tonsSolidsGeneration, data.kgPolyRequired, data.prepTankVolume, data.dosingTankVolume, data.prepTankAgitatorPower, data.dosingTankAgitatorPower,
    data.dewateringCapacityTons, data.dewateringProcessingCapacityKgHr
  ]);

  const handleChange = (field, value) => {
    if (typeof value === 'boolean') {
      setData(prev => ({ ...prev, [field]: value }));
    } else {
      // If it's a numeric field with validation needed, check it
      if (['primaryConsistency', 'dafConsistency', 'secondaryConsistency'].includes(field)) {
        if (parseFloat(value) < 0 || parseFloat(value) > 100) return;
      }
      setData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNestedChange = (parentField, field, value) => {
    setData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const TANK_MOC_OPTIONS = ['MS', 'SS', 'FRP', 'HDPE'];
  const AGITATOR_MOC_OPTIONS = ['MS', 'SS', 'CI', 'Aluminum'];
  const TANK_TYPE_OPTIONS = ['Vertical', 'Horizontal', 'Conical', 'Cylindrical'];
  const AGITATOR_TYPES = ['Paddle', 'Turbine', 'Propeller'];
  const PUMP_MAKE_OPTIONS = ['Hydroprokav/Netzsch/EQT', 'Milton Roy/PROMINENT/EQT'];
  const PUMP_MOC_OPTIONS = ['CI/Nitrile Rubber/SS', 'PP'];
  const PUMP_TYPE_OPTIONS = ['Positive Displacement', 'Diaphragm', 'Centrifugal', 'Peristaltic', 'Other'];

  const DECANTER_MAKE_OPTIONS = ['Alfa Laval', 'Hilton', 'EQT'];
  const SCREW_PRESS_MAKE_OPTIONS = ['SNP', 'Chemi Science', 'EQT'];

  return (
    <div className="border border-amber-200 rounded-lg p-4 mb-6 bg-white shadow-sm animate-in fade-in duration-500">
      <div className="flex items-center mb-4 border-b border-amber-100 pb-2">
        <Briefcase className="w-5 h-5 text-amber-600 mr-2" />
        <h4 className="font-bold text-amber-800 text-lg">Sludge Dewatering Unit</h4>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <SludgeSourceCard
          title="1. Primary Clarifier Sludge"
          required={data.primaryRequired}
          onToggleRequired={() => handleChange('primaryRequired', !data.primaryRequired)}
          sludgeVolume={data.primarySludge}
          consistency={data.primaryConsistency}
          onConsistencyChange={(v) => handleChange('primaryConsistency', v)}
        />
        <SludgeSourceCard
          title="2. DAF Sludge"
          required={data.dafRequired}
          onToggleRequired={() => handleChange('dafRequired', !data.dafRequired)}
          sludgeVolume={data.dafSludge}
          consistency={data.dafConsistency}
          onConsistencyChange={(v) => handleChange('dafConsistency', v)}
        />
        <SludgeSourceCard
          title="3. Secondary Clarifier Sludge"
          required={data.secondaryRequired}
          onToggleRequired={() => handleChange('secondaryRequired', !data.secondaryRequired)}
          sludgeVolume={data.secondarySludge}
          consistency={data.secondaryConsistency}
          onConsistencyChange={(v) => handleChange('secondaryConsistency', v)}
        />
      </div>

      <div className="bg-amber-50 p-4 rounded-md border border-amber-100 mb-4">
        <h5 className="font-semibold text-amber-900 mb-3 flex items-center border-b border-amber-200 pb-2">
          <Activity className="w-4 h-4 mr-2" /> Final Sludge Results
        </h5>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-3 rounded border border-amber-100 shadow-sm flex flex-col items-center justify-center">
            <div className="text-xs text-amber-600 font-semibold uppercase mb-1">Total Sludge Generation</div>
            <div className="text-3xl font-bold text-gray-900">{data.totalSludge} <span className="text-sm font-normal text-gray-500">m³/day</span></div>
          </div>
          <div className="bg-white p-3 rounded border border-amber-100 shadow-sm flex flex-col items-center justify-center">
            <div className="text-xs text-amber-600 font-semibold uppercase mb-1">Final Sludge Consistency</div>
            <div className="text-3xl font-bold text-gray-900">{data.finalConsistency} <span className="text-sm font-normal text-gray-500">%</span></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
        <h5 className="font-semibold text-slate-800 mb-3 flex items-center border-b border-slate-200 pb-2">
          <Beaker className="w-4 h-4 mr-2" /> Polymer Dosing System Design
        </h5>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-3 rounded border border-slate-200">
            <div className="text-xs text-slate-500 font-bold uppercase mb-2">Solids Generation</div>
            <div className="text-2xl font-bold text-slate-800">{data.tonsSolidsGeneration} <span className="text-sm font-normal text-slate-500">Tons/day</span></div>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200">
            <div className="text-xs text-slate-500 font-bold uppercase mb-2">Poly Required</div>
            <div className="text-2xl font-bold text-slate-800">{data.kgPolyRequired} <span className="text-sm font-normal text-slate-500">kg/day</span></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SpecsSection title="Preparation Tank" icon={Beaker}>
              <div className="bg-blue-50 p-2 rounded border border-blue-100 text-center mb-2">
                <div className="text-xs text-blue-600 font-bold uppercase">Volume (Calculated)</div>
                <div className="text-xl font-bold text-blue-900">{data.prepTankVolume} <span className="text-xs font-normal">Liters</span></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SelectField label="MOC" value={data.prepTankSpecs?.moc} onChange={(v) => handleNestedChange('prepTankSpecs', 'moc', v)} options={TANK_MOC_OPTIONS} />
                <InputField label="Make" value={data.prepTankSpecs?.make} onChange={(v) => handleNestedChange('prepTankSpecs', 'make', v)} />
                <InputField label="Qty" type="number" value={data.prepTankSpecs?.qty} onChange={(v) => handleNestedChange('prepTankSpecs', 'qty', v)} />
                <SelectField label="Type" value={data.prepTankSpecs?.type} onChange={(v) => handleNestedChange('prepTankSpecs', 'type', v)} options={TANK_TYPE_OPTIONS} />
              </div>
            </SpecsSection>

            <SpecsSection title="Prep Tank Agitator" icon={Zap}>
              <div className="bg-yellow-50 p-2 rounded border border-yellow-100 text-center mb-2">
                <div className="text-xs text-yellow-600 font-bold uppercase">Power (Calculated)</div>
                <div className="text-xl font-bold text-yellow-900">{data.prepTankAgitatorPower} <span className="text-xs font-normal">kW</span></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SelectField label="Type" value={data.prepAgitatorSpecs?.type} onChange={(v) => handleNestedChange('prepAgitatorSpecs', 'type', v)} options={AGITATOR_TYPES} />
                <InputField label="Make" value={data.prepAgitatorSpecs?.make} onChange={(v) => handleNestedChange('prepAgitatorSpecs', 'make', v)} />
                <SelectField label="Qty (Nos)" value={data.prepAgitatorSpecs?.qty} onChange={(v) => handleNestedChange('prepAgitatorSpecs', 'qty', v)} options={Array.from({ length: 10 }, (_, i) => (i + 1).toString())} />
                <SelectField label="MOC" value={data.prepAgitatorSpecs?.moc} onChange={(v) => handleNestedChange('prepAgitatorSpecs', 'moc', v)} options={AGITATOR_MOC_OPTIONS} />
              </div>
            </SpecsSection>
          </div>

          <div className="space-y-4">
            <SpecsSection title="Dosing Tank" icon={Beaker}>
              <div className="bg-blue-50 p-2 rounded border border-blue-100 text-center mb-2">
                <div className="text-xs text-blue-600 font-bold uppercase">Volume (Calculated)</div>
                <div className="text-xl font-bold text-blue-900">{data.dosingTankVolume} <span className="text-xs font-normal">Liters</span></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SelectField label="MOC" value={data.dosingTankSpecs?.moc} onChange={(v) => handleNestedChange('dosingTankSpecs', 'moc', v)} options={TANK_MOC_OPTIONS} />
                <InputField label="Make" value={data.dosingTankSpecs?.make} onChange={(v) => handleNestedChange('dosingTankSpecs', 'make', v)} />
                <InputField label="Qty" type="number" value={data.dosingTankSpecs?.qty} onChange={(v) => handleNestedChange('dosingTankSpecs', 'qty', v)} />
                <SelectField label="Type" value={data.dosingTankSpecs?.type} onChange={(v) => handleNestedChange('dosingTankSpecs', 'type', v)} options={TANK_TYPE_OPTIONS} />
              </div>
            </SpecsSection>

            <SpecsSection title="Dosing Tank Agitator" icon={Zap}>
              <div className="bg-yellow-50 p-2 rounded border border-yellow-100 text-center mb-2">
                <div className="text-xs text-yellow-600 font-bold uppercase">Power (Calculated)</div>
                <div className="text-xl font-bold text-yellow-900">{data.dosingTankAgitatorPower} <span className="text-xs font-normal">kW</span></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SelectField label="Type" value={data.dosingAgitatorSpecs?.type} onChange={(v) => handleNestedChange('dosingAgitatorSpecs', 'type', v)} options={AGITATOR_TYPES} />
                <InputField label="Make" value={data.dosingAgitatorSpecs?.make} onChange={(v) => handleNestedChange('dosingAgitatorSpecs', 'make', v)} />
                <SelectField label="Qty (Nos)" value={data.dosingAgitatorSpecs?.qty} onChange={(v) => handleNestedChange('dosingAgitatorSpecs', 'qty', v)} options={Array.from({ length: 10 }, (_, i) => (i + 1).toString())} />
                <SelectField label="MOC" value={data.dosingAgitatorSpecs?.moc} onChange={(v) => handleNestedChange('dosingAgitatorSpecs', 'moc', v)} options={AGITATOR_MOC_OPTIONS} />
              </div>
            </SpecsSection>
          </div>
        </div>

        <div className="mt-4">
          <SpecsSection title="Dosing Pump" icon={Settings}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SelectField label="Make" value={data.dosingPumpSpecs?.make} onChange={(v) => handleNestedChange('dosingPumpSpecs', 'make', v)} options={PUMP_MAKE_OPTIONS} />
              <SelectField label="MOC" value={data.dosingPumpSpecs?.moc} onChange={(v) => handleNestedChange('dosingPumpSpecs', 'moc', v)} options={PUMP_MOC_OPTIONS} />
              <InputField label="Quantity" value={data.dosingPumpSpecs?.qty} onChange={(v) => handleNestedChange('dosingPumpSpecs', 'qty', v)} />
              <SelectField label="Type" value={data.dosingPumpSpecs?.type} onChange={(v) => handleNestedChange('dosingPumpSpecs', 'type', v)} options={PUMP_TYPE_OPTIONS} />
            </div>
          </SpecsSection>
        </div>
      </div>

      {/* Decanter and Screw Press Section */}
      <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mt-6">
        <h5 className="font-semibold text-slate-800 mb-3 flex items-center border-b border-slate-200 pb-2">
          <Filter className="w-4 h-4 mr-2" /> Dewatering Equipment Selection
        </h5>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-3 rounded border border-slate-200">
            <div className="text-xs text-slate-500 font-bold uppercase mb-2">Dewatering Unit Capacity</div>
            <div className="text-2xl font-bold text-slate-800">{data.dewateringCapacityTons} <span className="text-sm font-normal text-slate-500">Tons/day</span></div>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200">
            <div className="text-xs text-slate-500 font-bold uppercase mb-2">Processing Capacity</div>
            <div className="text-2xl font-bold text-slate-800">{data.dewateringProcessingCapacityKgHr} <span className="text-sm font-normal text-slate-500">kg/hr</span></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-4">
          {/* Decanter Centrifuge Toggle */}
          <div className={`p-4 rounded border transition-colors ${data.decanterRequired ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-100 border-slate-200 opacity-80'}`}>
            <div className="flex justify-between items-center mb-4">
              <h6 className="font-bold text-blue-900">Decanter Centrifuge</h6>
              <button
                onClick={() => handleChange('decanterRequired', !data.decanterRequired)}
                className={`flex items-center text-xs font-medium px-2 py-1 rounded transition-colors
                            ${data.decanterRequired ? 'bg-blue-100 text-blue-700 hover:bg-red-100 hover:text-red-700' : 'bg-slate-200 text-slate-600 hover:bg-blue-100 hover:text-blue-700'}`}
              >
                {data.decanterRequired ? <CheckSquare className="w-3 h-3 mr-1" /> : <Square className="w-3 h-3 mr-1" />}
                {data.decanterRequired ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {data.decanterRequired && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Make"
                    value={data.decanterSpecs?.make}
                    onChange={(v) => handleNestedChange('decanterSpecs', 'make', v)}
                    options={DECANTER_MAKE_OPTIONS}
                  />
                  <InputField
                    label="Quantity"
                    type="number"
                    value={data.decanterSpecs?.qty}
                    onChange={(v) => handleNestedChange('decanterSpecs', 'qty', v)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <InputField label="Mechanism" value="Decanter Centrifuge" disabled />
                  <InputField label="MOC" value="SS316 Screw" disabled />
                  <InputField label="Bowl" value="SS316" disabled />
                </div>
              </div>
            )}
          </div>

          {/* Screw Press Toggle */}
          <div className={`p-4 rounded border transition-colors ${data.screwPressRequired ? 'bg-white border-emerald-200 shadow-sm' : 'bg-slate-100 border-slate-200 opacity-80'}`}>
            <div className="flex justify-between items-center mb-4">
              <h6 className="font-bold text-emerald-900">Screw Press</h6>
              <button
                onClick={() => handleChange('screwPressRequired', !data.screwPressRequired)}
                className={`flex items-center text-xs font-medium px-2 py-1 rounded transition-colors
                            ${data.screwPressRequired ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700' : 'bg-slate-200 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'}`}
              >
                {data.screwPressRequired ? <CheckSquare className="w-3 h-3 mr-1" /> : <Square className="w-3 h-3 mr-1" />}
                {data.screwPressRequired ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {data.screwPressRequired && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Make"
                    value={data.screwPressSpecs?.make}
                    onChange={(v) => handleNestedChange('screwPressSpecs', 'make', v)}
                    options={SCREW_PRESS_MAKE_OPTIONS}
                  />
                  <InputField
                    label="Quantity"
                    type="number"
                    value={data.screwPressSpecs?.qty}
                    onChange={(v) => handleNestedChange('screwPressSpecs', 'qty', v)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <InputField label="Mechanism" value="Screw Press" disabled />
                  <InputField label="MOC" value="SS316 Screw" disabled />
                  <InputField label="Bowl" value="SS316" disabled />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default SludgeHandlingSection;