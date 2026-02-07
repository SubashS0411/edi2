// Utility to prepare detailed calculation data for the backup document
export const prepareCalculationData = (data) => {
  const { 
    clientInfo, params, anaerobicFeedParams, daf, 
    dafPolyDosing, dafCoagulantDosing,
    screens, primaryClarifier, 
    coolingSystem, preAcid, anaerobicFeedPump, anaerobicTank, 
    standPipe, 
    biomassHoldingTank, aerationTank,
    sludgeSystem,
    dosingSystems
  } = data;

  const flowVal = parseFloat(params.find(p => p.name === 'Flow')?.value || 0);
  const scodInlet = parseFloat(params.find(p => p.name === 'sCOD')?.value || 0);
  const tssInlet = parseFloat(params.find(p => p.name === 'TSS')?.value || 0);
  const anaerobicFlow = parseFloat(anaerobicFeedParams.find(p => p.name === 'Flow')?.value || flowVal);
  const anaerobicSCOD = parseFloat(anaerobicFeedParams.find(p => p.name === 'sCOD')?.value || 0);
  const anaerobicTSS = parseFloat(anaerobicFeedParams.find(p => p.name === 'TSS')?.value || 0);

  const calcSections = [];

  // 1. General & Flow
  calcSections.push({
    title: "1. Design Basis & Flows",
    rows: [
      ["Parameter", "Value", "Unit"],
      ["Inlet Flow", flowVal, "m³/day"],
      ["Inlet sCOD", scodInlet, "mg/l"],
      ["Inlet TSS", tssInlet, "mg/l"],
      ["Anaerobic Flow", anaerobicFlow, "m³/day"],
      ["Anaerobic sCOD", anaerobicSCOD, "mg/l"],
      ["Anaerobic TSS", anaerobicTSS, "mg/l"],
      ["sCOD Load (Inlet)", clientInfo.inletSCODLoad, "kg/day"],
      ["sCOD Load (Anaerobic)", clientInfo.anaerobicSCODLoad, "kg/day"],
    ]
  });

  // 2. DAF
  if (daf.required) {
    calcSections.push({
      title: "2. Dissolved Air Flotation (DAF)",
      rows: [
        ["Item", "Calculation / Value"],
        ["Flow Rate", `${daf.flow} m³/hr`],
        ["TSS Removal", `${daf.tssRemovedKg} kg/day`],
        ["High Pressure Pump", `${daf.hpPumpCapacity} m³/hr (@ 30% recycle)`],
        ["Air Compressor", `${daf.airCompCapacity} CFM (based on flow)`],
      ]
    });
  }

  // 3. Chemical Dosing
  const dosingRows = [["System", "Chemical", "Calculation Logic", "Tank Size", "Pump Capacity"]];
  
  if (dafPolyDosing && daf.required) {
    dosingRows.push([
      "DAF Poly", 
      "Polyelectrolyte", 
      `Load: ${daf.tssRemovedTons} tons * 4 kg/ton`, 
      `${dafPolyDosing.dosingTankCapacity} L`, 
      `${dafPolyDosing.pumpCapacity} LPH`
    ]);
  }
  
  if (dafCoagulantDosing && daf.required) {
    dosingRows.push([
        "DAF Coagulant",
        "Coagulant",
        `10 ppm dose @ ${daf.flow} m³/hr`,
        `${dafCoagulantDosing.tankVolume} L`,
        `${dafCoagulantDosing.pumpCapacity} LPH`
    ]);
  }

  Object.entries(dosingSystems).forEach(([key, sys]) => {
      if (sys.required) {
          let logic = "Standard dosing rate";
          if (key === 'Urea') logic = "N req = BOD * 5/100 or sCOD removal based";
          if (key === 'Phosphoric Acid') logic = "P req = BOD * 1/100 or sCOD removal based";
          if (key === 'Caustic') logic = "pH Adjustment based on Alkalinity";
          
          dosingRows.push([
              key, 
              key, 
              logic, 
              `${sys.tank.capacity} L`, 
              `${sys.pump.capacity} LPH`
          ]);
      }
  });

  calcSections.push({
    title: "3. Chemical Dosing Systems",
    rows: dosingRows
  });

  // 4. Biological Treatment
  const bioRows = [["Unit", "Parameter", "Value"]];
  if (anaerobicTank.required) {
      bioRows.push(["Anaerobic Reactor", "Volume", anaerobicTank.capacity]);
      bioRows.push(["Anaerobic Reactor", "Loading Rate", `${(parseFloat(clientInfo.anaerobicSCODLoad)/parseFloat(anaerobicTank.capacity.replace(' m³',''))).toFixed(2)} kg COD/m³.d`]);
      if (standPipe.required) {
          bioRows.push(["Stand Pipe", "Diameter", standPipe.diameter]);
          bioRows.push(["Stand Pipe", "Velocity check", "Designed for 4 cm/s"]);
      }
  }
  
  if (aerationTank.required) {
      bioRows.push(["Aeration Tank", "Volume", aerationTank.capacity]);
      bioRows.push(["Aeration Tank", "Type", "Extended Aeration / Activated Sludge"]);
  }

  calcSections.push({
      title: "4. Biological Treatment",
      rows: bioRows
  });

  // 5. Equipment Sizing
  const equipRows = [["Equipment", "Sizing Criteria", "Selected Specs"]];
  
  if (screens.required) {
      equipRows.push(["Screens", "Peak Flow + 30%", screens.capacity]);
  }
  if (primaryClarifier.required) {
      equipRows.push(["Primary Clarifier", "Surface Rate < 22 m³/m².d", primaryClarifier.dim]);
  }
  if (coolingSystem.required) {
      equipRows.push(["Cooling Tower/PHE", "Heat Load based on Delta T", coolingSystem.capacity]);
  }
  if (preAcid.required) {
      equipRows.push(["Pre-Acidification", "Retention Time check", preAcid.capacity]);
  }
  if (anaerobicFeedPump.required) {
      equipRows.push(["Feed Pump", "Flow + Margin", anaerobicFeedPump.capacity]);
  }

  calcSections.push({
      title: "5. Mechanical Equipment Sizing",
      rows: equipRows
  });

  // 6. Sludge
  if (sludgeSystem.required) {
      calcSections.push({
          title: "6. Sludge Handling",
          rows: [
              ["Parameter", "Value"],
              ["Total Sludge Generation", `${sludgeSystem.totalCapacity} kg/day`],
              ["Dewatering System", "Screw Press / Centrifuge"],
              ["Poly Dosing for Sludge", "Yes"]
          ]
      });
  }

  return {
    projectName: clientInfo.clientName || "Project",
    date: new Date().toLocaleDateString(),
    sections: calcSections
  };
};