
export const calculateProcessDesign = (inputs) => {
  return {};
};

export const STANDARD_MOTOR_HP = [0.5, 1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100];

// --- Aeration Calculations ---
// ...

export const calculateBiogasFlareCapacity = (anaerobicFeedKgSCOD, anaerobicSCODEff, biogasFactor) => {
  const load = parseFloat(anaerobicFeedKgSCOD || 0); // kg sCOD per day
  const eff = parseFloat(anaerobicSCODEff || 0); // %
  const factor = parseFloat(biogasFactor || 0); // m3/kg

  // (anaerobic feed water kg sCOD * anaerobic sCOD removal%) * biogas factor
  // Note: If input Load is kg/day, Output is m3/day. User asked for Nm3/hr.
  // Assuming calculation gives m3/day, then divide by 24 for hr.

  if (load <= 0 || eff <= 0 || factor <= 0) return '0.00';

  const codRemoved = load * (eff / 100);
  const m3Day = codRemoved * factor;
  const m3Hr = m3Day / 24;

  return m3Hr.toFixed(2);
};

export const calculateBiomassHoldingTankCapacity = (anaerobicFeedKgSCOD, anaerobicSCODEff) => {
  const load = parseFloat(anaerobicFeedKgSCOD || 0); // kg sCOD per day
  const eff = parseFloat(anaerobicSCODEff || 0); // %

  // Formula: ((anaerobic feed water kg sCOD * anaerobic sCOD removal%)*0.02*100)/120

  if (load <= 0 || eff <= 0) return '0.00';

  const codRemoved = load * (eff / 100);
  const capacity = (codRemoved * 0.02 * 100) / 120;

  return capacity.toFixed(2);
};

export const calculateSurfaceAeratorHP = (bodPerDayAnaerobic, bodRemovalAnaerobic) => {
  const bodIn = parseFloat(bodPerDayAnaerobic || 0);
  const bodRem = parseFloat(bodRemovalAnaerobic || 0);

  // (1) kg BOD entering to aeration
  const bodEnteringAeration = Math.max(0, bodIn - bodRem);

  // (2) kg BOD/hr
  const bodPerHour = bodEnteringAeration / 24;

  // (3) Total HP required (Daily aggregate equivalent)
  // Formula: ((kg BOD entering to aeration × 2.2 × 1.92) / 1.4)
  const totalHPRequiredDay = (bodEnteringAeration * 2.2 * 1.92) / 1.4;

  // (4) HP Rating Required (HP per hour / Continuous rating)
  const hpRatingRequired = totalHPRequiredDay / 24;

  return {
    bodEnteringAeration: bodEnteringAeration.toFixed(2),
    bodPerHour: bodPerHour.toFixed(2),
    totalHPRequiredDay: totalHPRequiredDay.toFixed(2),
    hpRatingRequired: hpRatingRequired.toFixed(2)
  };
};

export const calculateSurfaceAeratorHPPerHour = (totalHP) => {
  return (parseFloat(totalHP || 0) / 24).toFixed(2);
};

export const calculateMotorQuantity = (hpRatingRequired, selectedMotorHP) => {
  const hpReq = parseFloat(hpRatingRequired || 0);
  const selectedHP = parseFloat(selectedMotorHP || 0);

  if (hpReq <= 0 || selectedHP <= 0) {
    return {
      selectedMotorHP: selectedHP || 0,
      quantityRequired: 0,
      standbyMotors: 0,
      totalMotors: 0,
      motor_config_text: "0 Working + 0 Standby"
    };
  }

  // calculate quantity needed = ceil(HP Rating / selectedMotorHP)
  const quantityRequired = Math.ceil(hpReq / selectedHP);
  const standbyMotors = 1;
  const totalMotors = quantityRequired + standbyMotors;
  const motor_config_text = `${quantityRequired} Working (${selectedHP} HP) + ${standbyMotors} Standby`;

  return {
    selectedMotorHP: selectedHP,
    quantityRequired,
    standbyMotors,
    totalMotors,
    motor_config_text
  };
};

export const calculateBlowerQuantity = (airRequirementPerHour, selectedBlowerSize) => {
  const airReq = parseFloat(airRequirementPerHour || 0);
  const size = parseFloat(selectedBlowerSize || 0);

  if (airReq <= 0 || size <= 0) {
    return {
      blowers_needed: 0,
      standby_blowers: 0,
      total_blowers: 0,
      blower_config_text: "0 Working + 0 Standby"
    };
  }

  const blowers_needed = Math.ceil(airReq / size);
  const standby_blowers = 1;
  const total_blowers = blowers_needed + standby_blowers;
  const blower_config_text = `${blowers_needed} Working (${size} Nm³/hr) + ${standby_blowers} Standby`;

  return {
    blowers_needed,
    standby_blowers,
    total_blowers,
    blower_config_text
  };
};

// --- Diffuser Calculations ---

export const calculateFineBubbleDiffusers = (airRequirementPerHour) => {
  const airReq = parseFloat(airRequirementPerHour || 0);
  if (airReq <= 0) return { quantity: 0 };
  const quantity = Math.ceil(airReq / 10);
  return { quantity };
};

export const calculateHydrodynamicDiffusers = (airRequirementPerHour) => {
  const airReq = parseFloat(airRequirementPerHour || 0);
  if (airReq <= 0) return { quantity: 0 };
  const quantity = Math.ceil(airReq / 60);
  return { quantity };
};

export const calculateAerationTankBODPerHour = (bodPerDayAnaerobic, bodRemovalAnaerobic) => {
  const bodIn = parseFloat(bodPerDayAnaerobic || 0);
  const bodRem = parseFloat(bodRemovalAnaerobic || 0);
  const result = (bodIn - bodRem) / 24;
  return Math.max(0, result).toFixed(2);
};

export const calculateAirRequirement = (bodPerHour) => {
  const bodHr = parseFloat(bodPerHour || 0);
  if (bodHr <= 0) return '0.00';
  // Formula: ((kg BOD/hr × 1.5 × 1.2) / 0.21 / 0.12)
  const val = ((bodHr * 1.5 * 1.2) / 0.21 / 0.12);
  return val.toFixed(2);
};

// --- Aeration Tank Geometry Calculations ---

export const calculateAdditionalVolume = (requiredVolume, existingVolume) => {
  const req = parseFloat(requiredVolume || 0);
  const exist = parseFloat(existingVolume || 0);
  return Math.max(0, req - exist).toFixed(2);
};

export const calculateVolumePerTank = (totalVolume, quantity) => {
  const vol = parseFloat(totalVolume || 0);
  const qty = parseInt(quantity || 1);
  if (qty <= 0) return "0.00";
  return (vol / qty).toFixed(2);
};

export const calculateRectangularTankDimensions = (volumePerTank, height) => {
  const vol = parseFloat(volumePerTank || 0);
  const h = parseFloat(height || 0);
  if (vol <= 0 || h <= 0) return { length: "0.00", width: "0.00", height: "0.00", text: "-" };

  // W = sqrt(Vol / (2*H))
  const width = Math.sqrt(vol / (2 * h));
  const length = 2 * width;

  return {
    length: length.toFixed(2),
    width: width.toFixed(2),
    height: h.toFixed(2),
    text: `${length.toFixed(2)}m (L) x ${width.toFixed(2)}m (W) x ${h.toFixed(2)}m (H)`
  };
};

export const calculateSquareTankDimensions = (volumePerTank, height) => {
  const vol = parseFloat(volumePerTank || 0);
  const h = parseFloat(height || 0);
  if (vol <= 0 || h <= 0) return { side: "0.00", height: "0.00", text: "-" };

  // Side = sqrt(Vol / H)
  const side = Math.sqrt(vol / h);

  return {
    side: side.toFixed(2),
    height: h.toFixed(2),
    text: `${side.toFixed(2)}m (Side) x ${side.toFixed(2)}m (Side) x ${h.toFixed(2)}m (H)`
  };
};

export const calculateCircularTankDimensions = (volumePerTank, height) => {
  const vol = parseFloat(volumePerTank || 0);
  const h = parseFloat(height || 0);
  if (vol <= 0 || h <= 0) return { diameter: "0.00", height: "0.00", text: "-" };

  // Dia = sqrt((4*Vol) / (pi*H))
  const diameter = Math.sqrt((4 * vol) / (Math.PI * h));

  return {
    diameter: diameter.toFixed(2),
    height: h.toFixed(2),
    text: `Dia ${diameter.toFixed(2)}m x ${h.toFixed(2)}m (H)`
  };
};

// --- Sludge Handling Calculations ---

export const calculateTotalSludgeGeneration = (primarySludge, dafSludge, secondarySludge) => {
  const p = parseFloat(primarySludge || 0);
  const d = parseFloat(dafSludge || 0);
  const s = parseFloat(secondarySludge || 0);
  const total = p + d + s;
  return total.toFixed(2);
};

export const calculateSecondarySludge = (anaerobicFeedFlow, anaerobicFeedTSS, kgBODPerDayEnteringAerobic, anaerobicFeedCalcium) => {
  const flow = parseFloat(anaerobicFeedFlow || 0);
  const tss = parseFloat(anaerobicFeedTSS || 0);
  const bodLoad = parseFloat(kgBODPerDayEnteringAerobic || 0);
  const ca = parseFloat(anaerobicFeedCalcium || 0);

  // Term 1: Mass from TSS (kg)
  const term1 = (flow * 1.1 * tss) / 1000;

  // Term 2: Mass from BOD (kg)
  const term2 = 0.6 * bodLoad;

  // Term 3: Mass from Calcium (kg)
  // Note: Formula implies excess calcium precipitation.
  const caDiff = Math.max(0, ca - 250);
  const term3Mass = (2.5 * caDiff * flow) / 1000;

  // Total Mass
  const totalMass = term1 + term2 + term3Mass;

  // Divide by 20 to get Volume (m3). Assuming this factor handles consistency/density conversion.
  const volume = totalMass / 20;

  return volume.toFixed(2);
};

export const calculateFinalSludgeConsistency = (
  primarySludge, primaryConsistency,
  dafSludge, dafConsistency,
  secondarySludge, secondaryConsistency
) => {
  const p = parseFloat(primarySludge || 0);
  const pc = parseFloat(primaryConsistency || 0);
  const d = parseFloat(dafSludge || 0);
  const dc = parseFloat(dafConsistency || 0);
  const s = parseFloat(secondarySludge || 0);
  const sc = parseFloat(secondaryConsistency || 0);

  const totalSludge = p + d + s;
  if (totalSludge <= 0) return "0.00";

  // Weighted Average: (Sum of (Volume * Consistency)) / Total Volume
  const weightedSum = (p * pc) + (d * dc) + (s * sc);
  const result = weightedSum / totalSludge;

  return result.toFixed(2);
};

// --- Solids and Poly Calculations ---

export const calculateTonsSolidsGeneration = (totalSludgeGeneration, finalSludgeConsistency) => {
  const ts = parseFloat(totalSludgeGeneration || 0);
  const fc = parseFloat(finalSludgeConsistency || 0);
  // (totalSludgeGeneration × finalSludgeConsistency × 10) / 1000
  const result = (ts * fc * 10) / 1000;
  return result.toFixed(2);
};

export const calculateKgPolyRequired = (tonsSolidsGeneration) => {
  const tons = parseFloat(tonsSolidsGeneration || 0);
  // tonsSolidsGeneration × 3
  const result = tons * 3;
  return result.toFixed(2);
};

export const calculatePrepTankVolume = (kgPolyRequired) => {
  const kg = parseFloat(kgPolyRequired || 0);
  // Formula: (kgPolyRequired * 1000) / 6
  if (kg <= 0) return "0.00";
  const result = (kg * 1000) / 6;
  return result.toFixed(2);
};

export const calculateDosingTankVolume = (kgPolyRequired) => {
  const kg = parseFloat(kgPolyRequired || 0);
  // Formula: (kgPolyRequired * 1000) / 6
  if (kg <= 0) return "0.00";
  const result = (kg * 1000) / 6;
  return result.toFixed(2);
};

export const calculatePrepTankAgitatorPower = (prepTankVolume) => {
  const vol = parseFloat(prepTankVolume || 0);
  // (prepTankVolume / 1000) × 0.5
  const result = (vol / 1000) * 0.5;
  return result.toFixed(2);
};

export const calculateDosingTankAgitatorPower = (dosingTankVolume) => {
  const vol = parseFloat(dosingTankVolume || 0);
  // (dosingTankVolume / 1000) × 0.25
  const result = (vol / 1000) * 0.25;
  return result.toFixed(2);
};

export const calculateDewateringProcessingCapacity = (tonsSolidsGeneration) => {
  const tons = parseFloat(tonsSolidsGeneration || 0);
  if (tons <= 0) return "0.00";
  // Formula: (Solids generation × 1000) / 20
  const result = (tons * 1000) / 20;
  return result.toFixed(2);
};

// --- MGF (Multigrade Filter) Calculations ---

export const calculateFilterFeedPumpCapacity = (anaerobicFeedFlow) => {
  const flow = parseFloat(anaerobicFeedFlow || 0);
  if (flow <= 0) return "0.00";
  return (flow / 24).toFixed(2);
};

export const calculateMGFDesignFlow = (anaerobicFeedFlow) => {
  // Design flow is essentially hourly flow
  const flow = parseFloat(anaerobicFeedFlow || 0);
  if (flow <= 0) return "0.00";
  return (flow / 24).toFixed(2);
};

export const calculateFilterArea = (diameter) => {
  const d = parseFloat(diameter || 0);
  if (d <= 0) return "0.00";
  // Area = (π * d^2) / 4
  const area = (Math.PI * Math.pow(d, 2)) / 4;
  return area.toFixed(2);
};

export const calculateAreaRequired = (designFlow, filtrationRate) => {
  const flow = parseFloat(designFlow || 0);
  const rate = parseFloat(filtrationRate || 0);
  if (flow <= 0 || rate <= 0) return "0.00";
  const area = flow / rate;
  return area.toFixed(2);
};

export const calculateNumberOfMGF = (areaRequired, filterArea) => {
  const req = parseFloat(areaRequired || 0);
  const unitArea = parseFloat(filterArea || 0);
  if (req <= 0 || unitArea <= 0) return 0;
  return Math.ceil(req / unitArea);
};

export const calculateActualAreaSelected = (numberOfMGF, filterArea) => {
  const n = parseInt(numberOfMGF || 0);
  const unitArea = parseFloat(filterArea || 0);
  if (n <= 0 || unitArea <= 0) return "0.00";
  return (n * unitArea).toFixed(2);
};

export const calculateBackwashFlow = (backwashRate, actualArea) => {
  const rate = parseFloat(backwashRate || 0);
  const area = parseFloat(actualArea || 0);
  if (rate <= 0 || area <= 0) return "0.00";
  return (rate * area).toFixed(2);
};

export const calculateBackwashPumpCapacity = (backwashFlow, backwashTime) => {
  const flow = parseFloat(backwashFlow || 0);
  const time = parseFloat(backwashTime || 0);
  if (flow <= 0 || time <= 0) return "0.00";
  // Capacity = (Flow * Time) / 60
  return ((flow * time) / 60).toFixed(2);
};

export const calculateAirRequirementMGF = (actualArea, airBackwashRate) => {
  const area = parseFloat(actualArea || 0);
  const rate = parseFloat(airBackwashRate || 0);
  if (area <= 0 || rate <= 0) return "0.00";
  return (area * rate).toFixed(2);
};

// --- ACF (Activated Carbon Filter) Calculations ---

export const calculateACFDesignFlow = (anaerobicFeedFlow) => {
  const flow = parseFloat(anaerobicFeedFlow || 0);
  if (flow <= 0) return "0.00";
  return (flow / 24).toFixed(2);
};

export const calculateACFFilterArea = (diameter) => {
  const d = parseFloat(diameter || 0);
  if (d <= 0) return "0.00";
  const area = (Math.PI * Math.pow(d, 2)) / 4;
  return area.toFixed(2);
};

export const calculateACFAreaRequired = (designFlow, filtrationRate) => {
  const flow = parseFloat(designFlow || 0);
  const rate = parseFloat(filtrationRate || 0);
  if (flow <= 0 || rate <= 0) return "0.00";
  return (flow / rate).toFixed(2);
};

export const calculateACFNumberOfFilters = (areaRequired, filterArea) => {
  const req = parseFloat(areaRequired || 0);
  const area = parseFloat(filterArea || 0);
  if (req <= 0 || area <= 0) return 0;
  return Math.ceil(req / area);
};

export const calculateACFActualArea = (numberOfFilters, filterArea) => {
  const n = parseInt(numberOfFilters || 0);
  const area = parseFloat(filterArea || 0);
  return (n * area).toFixed(2);
};

export const calculateACFBackwashFlow = (backwashRate, actualArea) => {
  const rate = parseFloat(backwashRate || 0);
  const area = parseFloat(actualArea || 0);
  if (rate <= 0 || area <= 0) return "0.00";
  return (rate * area).toFixed(2);
};

export const calculateACFBackwashPumpCapacity = (backwashFlow, backwashingTime) => {
  const flow = parseFloat(backwashFlow || 0);
  const time = parseFloat(backwashingTime || 0);
  if (flow <= 0 || time <= 0) return "0.00";
  return ((flow * time) / 60).toFixed(2);
};


// --- Legacy / Misc Calculations ---

export const calculateAerationCapacity = (bodLoad, fmRatio, mlss) => {
  const bod = parseFloat(bodLoad || 0);
  const fm = parseFloat(fmRatio || 0.15);
  const m = parseFloat(mlss || 3500);
  if (bod <= 0 || fm <= 0 || m <= 0) return '0.00';
  const capacity = bod / (fm * (m / 1000));
  return capacity.toFixed(2);
};

// Wrapper for older dimension calls if any
export const calculateAerationDimensions = (totalCapacity, qty, shape, height) => {
  // Aliasing to new functions for compatibility if needed, though Step 2 uses new ones directly
  return { dimension: '-', singleTankCap: 0 };
};

export const calculatePolymerDosing = (flow, tssIn, tssOut, ratio, concentration) => {
  const f = parseFloat(flow || 0);
  const tIn = parseFloat(tssIn || 0);
  const tOut = parseFloat(tssOut || 0);
  const r = parseFloat(ratio || 0);
  const c = parseFloat(concentration || 0.1);
  if (f <= 0) return {
    solidsKgDay: '0', polymerReqKgDay: '0', dosingSolVolLitDay: '0', dosingFlowRate: '0', prepTankVol: '0', dosingTankVol: '0', totalVol: '0', pumpCapacity: '0', pumpType: ''
  };
  const solidsRemovedKg = ((tIn - tOut) * f) / 1000;
  const solidsRemovedTons = solidsRemovedKg / 1000;
  const polymerReqKg = solidsRemovedTons * r;
  const dosingSolVolL = (polymerReqKg * 100) / c;
  const dosingFlowRate = dosingSolVolL / 24;
  const tankVolL = dosingFlowRate * 10;
  const tankVolM3 = tankVolL / 1000;
  return {
    solidsKgDay: solidsRemovedKg.toFixed(2),
    polymerReqKgDay: polymerReqKg.toFixed(2),
    dosingSolVolLitDay: dosingSolVolL.toFixed(2),
    dosingFlowRate: dosingFlowRate.toFixed(2),
    prepTankVol: tankVolM3.toFixed(2),
    dosingTankVol: tankVolM3.toFixed(2),
    totalVol: (tankVolM3 * 2).toFixed(2),
    pumpCapacity: (dosingFlowRate * 1.5).toFixed(2),
    pumpType: 'Screw Pump / Dosing Pump'
  };
};

export const calculateCoagulantDosing = (flow, ppm, retentionHours) => {
  const f = parseFloat(flow || 0);
  const p = parseFloat(ppm || 0);
  const h = parseFloat(retentionHours || 8);
  if (f <= 0) return {
    coagulantReqKgDay: '0', dosingSolVolLitDay: '0', dosingFlowRate: '0', dosingTankVol: '0', pumpCapacity: '0', pumpType: ''
  };

  // Coagulant Required (kg/day)
  const coagulantReqKgDay = (f * p) / 1000;

  // Coagulant Required (kg/hr)
  const coagulantReqKgHr = coagulantReqKgDay / 24;

  // Dosing Flow (LPH) = Coagulant Required (kg/hr) / 0.1
  const dosingFlowRate = coagulantReqKgHr / 0.1;

  // Dosing Solution Volume per Day (L/day) = LPH * 24
  const dosingSolVolLitDay = dosingFlowRate * 24;

  // Tank Volume (m3) = Dosing Flow Rate (LPH) * Retention Time (hrs) / 1000
  const tankVolL = dosingFlowRate * h;
  const tankVolM3 = tankVolL / 1000;

  return {
    coagulantReqKgDay: coagulantReqKgDay.toFixed(2),
    dosingSolVolLitDay: dosingSolVolLitDay.toFixed(2),
    dosingFlowRate: dosingFlowRate.toFixed(2),
    dosingTankVol: tankVolM3.toFixed(2),
    pumpCapacity: (dosingFlowRate * 1.5).toFixed(2),
    pumpType: 'Dosing Pump'
  };
};

export const calculateBiomassTankCapacity = (sCODRemoval) => {
  const removal = parseFloat(sCODRemoval || 0);
  if (removal <= 0) return '0.00';
  const val = ((removal * 0.02) / 100) * 90;
  return val.toFixed(2);
};

export const calculateCylinderTankDimensions = (capacity, height) => {
  const cap = parseFloat(capacity || 0);
  const h = parseFloat(height || 4);
  if (cap <= 0 || h <= 0) return '';
  const r = Math.sqrt(cap / (Math.PI * h));
  const d = 2 * r;
  return `Dia ${d.toFixed(2)}m x ${h}m (H)`;
};

export const generateCSV = (results, inputs) => {
  return "";
};
