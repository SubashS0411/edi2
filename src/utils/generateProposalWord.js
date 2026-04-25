
import { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableCell, 
  TableRow, 
  TextRun, 
  WidthType, 
  BorderStyle, 
  AlignmentType,
  Header,
  Footer,
  PageBreak,
  ImageRun,
  VerticalAlign
} from "docx";
import { saveAs } from "file-saver";

// --- Helpers for Safe Text Handling ---

const safeString = (val) => {
  if (val === null || val === undefined) return "-";
  return String(val);
};

// --- Basic Formatting Helpers (Word 2010 Compatible) ---

const createText = (text, options = {}) => {
  return new TextRun({
    text: safeString(text),
    font: "Arial",
    size: options.size || 22, // 11pt default
    bold: options.bold || false,
    italics: options.italics || false,
    color: options.color || "000000",
  });
};

const createParagraph = (textOrRuns, options = {}) => {
  const children = Array.isArray(textOrRuns) 
    ? textOrRuns 
    : [createText(textOrRuns, options.textOptions)];

  return new Paragraph({
    children: children,
    spacing: { 
      before: options.spacingBefore || 120, 
      after: options.spacingAfter || 120,
      line: 276 // 1.15 line spacing
    },
    alignment: options.alignment || AlignmentType.LEFT,
    bullet: options.bullet ? { level: 0 } : undefined,
    indent: options.indent
  });
};

const createHeading = (text, level = 1) => {
  const size = level === 1 ? 32 : (level === 2 ? 28 : 24); // 16pt, 14pt, 12pt
  return new Paragraph({
    children: [createText(text, { bold: true, size, color: "000000" })],
    spacing: { before: 240, after: 120 },
    alignment: AlignmentType.LEFT,
    heading: level === 1 ? "Heading1" : (level === 2 ? "Heading2" : "Heading3")
  });
};

// --- Table Helpers (Simple Structure) ---

const createCell = (content, options = {}) => {
  return new TableCell({
    children: [
      createParagraph(content, { 
        textOptions: options.textOptions, 
        alignment: options.alignment || AlignmentType.LEFT 
      })
    ],
    width: options.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 100, bottom: 100, left: 100, right: 100 }
  });
};

const createSimpleTable = (headers, data, widths = []) => {
  const rows = [];

  // Header Row
  if (headers && headers.length > 0) {
    rows.push(
      new TableRow({
        children: headers.map((h, i) => 
          createCell(h, { 
            textOptions: { bold: true }, 
            alignment: AlignmentType.CENTER,
            width: widths[i]
          })
        ),
        tableHeader: true
      })
    );
  }

  // Data Rows
  data.forEach(rowData => {
    rows.push(
      new TableRow({
        children: rowData.map((cellData, i) => 
          createCell(cellData, { width: widths[i] })
        )
      })
    );
  });

  return new Table({
    rows: rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    }
  });
};

// --- Main Generator Function ---

export const generateProposalWord = async (data) => {
  try {
    const { 
      clientInfo = {}, 
      params = [], 
      anaerobicFeedParams = [], 
      guarantees = {}, 
      daf = {}, 
      dafPolyDosing = {}, 
      dafPolyDosingCalc = {},
      dafCoagulantDosing = {},
      dafCoagulantDosingCalc = {},
      anaerobicTank = {}, 
      anaerobicFeedPump = {}, // Added missing destructuring
      biogasHolder = {}, 
      biogasFlare = {},
      aerationTank = {}, 
      airBlower = {}, 
      sludgeCalculationDetails = {},
      mgfSpecs = {}, 
      mgfCalculations = {},
      acfSpecs = {}, 
      acfCalculations = {},
      performanceResults = {},
      equipment = [],
      importantConsiderationsPoints = [],
      dosingSystems = {},
      dosingBreakdowns = {},
      screens = {},
      secondaryClarifierMech = {},
      instruments = [] // Assuming list of strings or objects
    } = data || {};

    const sections = [];

    // --- Header Definition (Logo + Text) ---
    // Note: Since we can't fetch external images easily without CORS or converting to base64 in browser,
    // we will use a text-based header for robustness in this environment. 
    // If a logo base64 string is available in data, it could be used.
    
    const headerElement = new Header({
        children: [
            new Paragraph({
                children: [
                    createText("Hostinger Horizons Engineering", { bold: true, size: 20, color: "444444" }),
                ],
                alignment: AlignmentType.RIGHT,
                border: { bottom: { color: "CCCCCC", space: 1, style: BorderStyle.SINGLE, size: 6 } }
            })
        ]
    });

    const footerElement = new Footer({
        children: [
            new Paragraph({
                children: [
                    createText("Technical Proposal - Confidential | Page ", { size: 18, color: "888888" }),
                    // Page numbering field
                ],
                alignment: AlignmentType.CENTER,
                border: { top: { color: "CCCCCC", space: 1, style: BorderStyle.SINGLE, size: 6 } }
            })
        ]
    });


    // ==========================================
    // PAGE 1-2: COVER PAGE
    // ==========================================
    
    sections.push(
        new Paragraph({ text: "", spacing: { before: 2000 } }), // Vertical Spacer
        createParagraph("TECHNICAL PROPOSAL", { textOptions: { bold: true, size: 48 }, alignment: AlignmentType.CENTER }),
        createParagraph("FOR", { textOptions: { size: 24 }, alignment: AlignmentType.CENTER }),
        createParagraph("WASTEWATER TREATMENT PLANT", { textOptions: { bold: true, size: 36 }, alignment: AlignmentType.CENTER }),
        
        new Paragraph({ text: "", spacing: { before: 1500 } }),
        
        createParagraph("PREPARED FOR:", { textOptions: { bold: true, size: 24, color: "555555" }, alignment: AlignmentType.CENTER }),
        createParagraph(clientInfo.clientName || "Client Name", { textOptions: { bold: true, size: 32 }, alignment: AlignmentType.CENTER }),
        createParagraph(clientInfo.address || "Address", { textOptions: { size: 24 }, alignment: AlignmentType.CENTER }),
        
        new Paragraph({ text: "", spacing: { before: 1500 } }),
        
        createParagraph(`Date: ${new Date().toLocaleDateString()}`, { alignment: AlignmentType.CENTER }),
        createParagraph(`Reference: ${safeString(clientInfo.referenceNumber)}`, { alignment: AlignmentType.CENTER }),
        
        new PageBreak()
    );

    // ==========================================
    // PAGE 3: TABLE OF CONTENTS
    // ==========================================
    
    sections.push(
        createHeading("Table of Contents"),
        createParagraph("1. Executive Summary"),
        createParagraph("2. Design Basis"),
        createParagraph("3. Process Description & Technology Overview"),
        createParagraph("4. Anaerobic Treatment System"),
        createParagraph("5. Dissolved Air Flotation (DAF)"),
        createParagraph("6. Aeration System"),
        createParagraph("7. Chemical Dosing System"),
        createParagraph("8. Biogas Handling System"),
        createParagraph("9. Sludge Handling System"),
        createParagraph("10. Tertiary Treatment (MGF & ACF)"),
        createParagraph("11. Piping Specifications"),
        createParagraph("12. Equipment List"),
        createParagraph("13. Instrument List"),
        createParagraph("14. Exclusions & Considerations"),
        new PageBreak()
    );

    // ==========================================
    // PAGE 4-5: EXECUTIVE SUMMARY
    // ==========================================
    
    sections.push(
        createHeading("1. Executive Summary"),
        createParagraph("We thank you for the opportunity to submit this technical proposal. This document outlines a comprehensive wastewater treatment solution designed specifically for your facility's requirements."),
        
        createHeading("1.1 Project Overview", 2),
        createParagraph(`The proposed plant is designed to treat ${safeString(clientInfo.calcFlow || params.find(p => p.name === 'Flow')?.value)} m³/day of effluent generated from ${safeString(clientInfo.industry)} industry. The primary objective is to achieve regulatory compliance and potential water reuse.`),

        createHeading("1.2 Key Objectives", 2),
        createParagraph("• Reduction of COD/BOD to permissible limits.", { bullet: true }),
        createParagraph("• Efficient separation of solids and oil/grease.", { bullet: true }),
        createParagraph("• Generation of biogas for energy recovery (where applicable).", { bullet: true }),
        createParagraph("• Production of clear, reusable water.", { bullet: true }),

        createHeading("1.3 Client Details", 2),
        createSimpleTable(
            ["Item", "Description"],
            [
                ["Client Name", safeString(clientInfo.clientName)],
                ["Industry Type", safeString(clientInfo.industry)],
                ["Contact Person", safeString(clientInfo.contactPerson)],
                ["Email / Phone", `${safeString(clientInfo.email)} / ${safeString(clientInfo.phone)}`]
            ],
            [30, 70]
        ),
        new PageBreak()
    );

    // ==========================================
    // PAGE 8 (Moved up logic): DESIGN BASIS
    // ==========================================

    sections.push(
        createHeading("2. Design Basis"),
        createParagraph("The treatment plant is designed based on the following inlet characteristics provided by the client:"),
        
        createHeading("2.1 Influent Parameters", 2),
        createSimpleTable(
            ["Parameter", "Unit", "Raw Effluent", "Anaerobic Feed"],
            params.map(p => {
                const anaParam = anaerobicFeedParams.find(ap => ap.id === p.id);
                return [
                    safeString(p.name), 
                    safeString(p.unit), 
                    safeString(p.value), 
                    safeString(anaParam ? anaParam.value : "-")
                ];
            }),
            [30, 15, 27, 28]
        ),
        
        createParagraph(""),
        createHeading("2.2 Design Flow Rates", 2),
        createParagraph(`• Total Design Flow: ${safeString(clientInfo.calcFlow || params.find(p => p.name === 'Flow')?.value)} m³/day`),
        createParagraph(`• Hourly Peak Flow: ${safeString( (parseFloat(clientInfo.calcFlow || params.find(p => p.name === 'Flow')?.value) / 20).toFixed(2) )} m³/hr (approx)`),
        new PageBreak()
    );

    // ==========================================
    // PAGE 6-7: PROCESS DESCRIPTION
    // ==========================================

    sections.push(
        createHeading("3. Process Description & Technology Overview"),
        
        createHeading("3.1 Pre-Treatment (Screens & DAF)", 2),
        createParagraph("Raw effluent first passes through screens to remove coarse solids. It is then pumped to the Dissolved Air Flotation (DAF) unit. DAF uses micro-bubbles to float suspended solids, oils, and grease to the surface for removal."),
        
        createHeading("3.2 Anaerobic Treatment", 2),
        createParagraph("The conditioned effluent enters the High-Rate Anaerobic Reactor. Here, granular sludge degrades organic matter (COD/BOD) in the absence of oxygen, converting it into biogas (methane) and treated water."),
        
        createHeading("3.3 Aerobic Treatment (Extended Aeration)", 2),
        createParagraph("Effluent from the anaerobic stage flows to the Aeration Tank. Surface aerators or diffusers provide oxygen, allowing aerobic bacteria to further degrade remaining organic pollutants. The mixed liquor then goes to the Secondary Clarifier for solids separation."),
        
        createHeading("3.4 Tertiary Treatment", 2),
        createParagraph("Clarified water is filtered through a Multigrade Filter (MGF) to remove suspended solids, followed by an Activated Carbon Filter (ACF) to remove color, odor, and trace organics."),
        
        new PageBreak()
    );

    // ==========================================
    // PAGE 9-10: ANAEROBIC TREATMENT
    // ==========================================

    if (anaerobicTank && anaerobicTank.required) {
        sections.push(
            createHeading("4. Anaerobic Treatment System"),
            
            createHeading("4.1 Design Specifications", 2),
            createSimpleTable(
                ["Parameter", "Value"],
                [
                    ["Reactor Type", safeString(anaerobicTank.type)],
                    ["Dimensions", `Dia ${safeString(anaerobicTank.diameter)}m x ${safeString(anaerobicTank.height)}m H`],
                    ["Effective Volume", safeString(anaerobicTank.capacity)],
                    ["Volumetric Loading Rate", `${safeString(anaerobicTank.vlr)} kg COD/m³/day`],
                    ["Material of Construction", safeString(anaerobicTank.moc)]
                ],
                [50, 50]
            ),
            
            createParagraph(""),
            createHeading("4.2 Performance Expected", 2),
            createSimpleTable(
                ["Parameter", "Efficiency / Output"],
                [
                    ["COD Removal Efficiency", `${safeString(guarantees.anaerobicSCODEff)} %`],
                    ["BOD Removal Efficiency", `${safeString(guarantees.anaerobicBODEff)} %`],
                    ["Biogas Generation Factor", `${safeString(guarantees.biogasFactor)} m³/kg COD removed`]
                ],
                [60, 40]
            ),
            new PageBreak()
        );
    }

    // ==========================================
    // PAGE 11-12: DAF SYSTEM
    // ==========================================

    if (daf && daf.required) {
        sections.push(
            createHeading("5. Dissolved Air Flotation (DAF)"),
            createParagraph("The DAF unit is critical for removing suspended solids (TSS) and Oil & Grease prior to biological treatment."),
            
            createHeading("5.1 Technical Specifications", 2),
            createSimpleTable(
                ["Item", "Specification"],
                [
                    ["Design Flow", `${safeString(daf.flow)} m³/hr`],
                    ["Recirculation Pump", `${safeString(daf.hpPumpCapacity)} m³/hr`],
                    ["Air Compressor", `${safeString(daf.airCompCapacity)} CFM`],
                    ["Inlet TSS", `${safeString(daf.inletTSS)} mg/l`],
                    ["Outlet TSS (Expected)", `${safeString(daf.outletTSS)} mg/l`]
                ],
                [50, 50]
            ),
            new PageBreak()
        );
    }

    // ==========================================
    // PAGE 13-14: AERATION SYSTEM
    // ==========================================

    if (aerationTank && aerationTank.required) {
        sections.push(
            createHeading("6. Aeration System"),
            
            createHeading("6.1 Tank Details", 2),
            createSimpleTable(
                ["Parameter", "Details"],
                [
                    ["Tank Volume", `${safeString(aerationTank.capacity)} m³`],
                    ["F/M Ratio", safeString(aerationTank.fmRatio)],
                    ["MLSS Maintained", `${safeString(aerationTank.mlss)} mg/l`],
                    ["Material", safeString(aerationTank.moc)]
                ],
                [50, 50]
            ),

            createParagraph(""),
            createHeading("6.2 Aeration Equipment", 2),
            
            airBlower && airBlower.required ? 
            createSimpleTable(
                ["Equipment", "Specs"],
                [
                    ["Blower Type", "Twin/Tri Lobe Roots Blower"],
                    ["Air Capacity", `${safeString(airBlower.airBlowerData?.selected_blower_size)} Nm³/hr`],
                    ["Total Air Req", `${safeString(airBlower.airBlowerData?.airRequirementPerHour)} Nm³/hr`],
                    ["Quantity", safeString(airBlower.qty)],
                    ["Diffusers", "Fine Bubble / Coarse Bubble Membrane"]
                ],
                [40, 60]
            ) : createParagraph("Surface Aerators proposed (Refer equipment list)."),
            
            new PageBreak()
        );
    }

    // ==========================================
    // PAGE 15: CHEMICAL DOSING
    // ==========================================

    sections.push(
        createHeading("7. Chemical Dosing System"),
        createParagraph("Chemical dosing is required to maintain pH, provide nutrients, and assist in solids separation."),
        
        createHeading("7.1 Nutrient & Chemical Requirement", 2),
        createSimpleTable(
            ["Chemical", "Est. Daily Consumption", "Tank Capacity", "Pump Capacity"],
            Object.entries(dosingSystems).filter(([_, sys]) => sys.required).map(([name, sys]) => {
                 const calc = dosingBreakdowns[name.toLowerCase().replace(/\s+/g, '')];
                 let reqVal = "-";
                 if(name === 'Urea' && calc) reqVal = calc.ureaReq;
                 if(name === 'Phosphoric Acid' && calc) reqVal = calc.phosReq;
                 if(name === 'DAF Polymer') reqVal = dafPolyDosingCalc.polymerReqKgDay;
                 if(name === 'DAF Coagulant') reqVal = dafCoagulantDosingCalc.coagulantReqKgDay;
                 
                 return [
                     name, 
                     `${safeString(reqVal)} kg/day`, 
                     `${safeString(sys.tank.capacity)} Lit`,
                     `${safeString(sys.pump.capacity)} LPH`
                 ];
            }),
            [25, 25, 25, 25]
        ),
        new PageBreak()
    );

    // ==========================================
    // PAGE 16: BIOGAS SYSTEM
    // ==========================================

    if (biogasHolder && biogasHolder.required) {
        sections.push(
            createHeading("8. Biogas Handling System"),
            createParagraph("Biogas generated from the anaerobic reactor is collected, stored, and flared safely."),
            
            createSimpleTable(
                ["Component", "Specification"],
                [
                    ["Est. Biogas Generation", `${safeString(performanceResults.biogasGen)} m³/day`],
                    ["Gas Holder Capacity", safeString(biogasHolder.capacity)],
                    ["Holder Type", "Floating Dome / Membrane"],
                    ["Holder Dimensions", safeString(biogasHolder.dimensions)],
                    ["Flare Capacity", safeString(biogasFlare.capacity)],
                    ["Flare Height", `${safeString(biogasFlare.height)} m`]
                ],
                [40, 60]
            ),
            new PageBreak()
        );
    }

    // ==========================================
    // PAGE 17: SLUDGE HANDLING
    // ==========================================

    if (sludgeCalculationDetails) {
        sections.push(
            createHeading("9. Sludge Handling System"),
            createParagraph("Sludge generated from DAF, Anaerobic, and Aerobic units is dewatered to reduce volume before disposal."),
            
            createSimpleTable(
                ["Parameter", "Details"],
                [
                    ["Total Sludge (Dry Solids)", `${safeString(sludgeCalculationDetails.tonsSolidsGeneration)} Tons/day`],
                    ["Total Wet Sludge Volume", `${safeString(sludgeCalculationDetails.totalSludge)} m³/day`],
                    ["Dewatering Machine", safeString(sludgeCalculationDetails.decanterSpecs?.make || "Screw Press / Decanter")],
                    ["Machine Capacity", `${safeString(sludgeCalculationDetails.dewateringProcessingCapacityKgHr)} kg/hr`],
                    ["Polymer Dosing for Sludge", `${safeString((parseFloat(sludgeCalculationDetails.tonsSolidsGeneration || 0) * 3).toFixed(2))} kg/day`]
                ],
                [50, 50]
            ),
            new PageBreak()
        );
    }

    // ==========================================
    // PAGE 18-19: MULTIGRADE FILTER (MGF)
    // ==========================================

    if (mgfSpecs) {
        sections.push(
            createHeading("10. Tertiary Treatment - Filtration"),
            
            createHeading("10.1 Multigrade Filter (MGF)", 2),
            createParagraph("MGF removes residual suspended solids using graded sand media."),
            
            createSimpleTable(
                ["Design Parameter", "Value"],
                [
                    ["Design Flow", `${safeString(mgfCalculations.designFlow)} m³/hr`],
                    ["Filtration Rate", `${safeString(mgfSpecs.filtrationRate)} m³/m²/hr`],
                    ["Filter Area Required", `${safeString(mgfCalculations.areaReq)} m²`],
                    ["Unit Diameter", `${safeString(mgfSpecs.diameter)} m`],
                    ["No. of Units", safeString(mgfCalculations.numMGF)]
                ],
                [50, 50]
            ),
            createParagraph(""),
        );
    }

    // ==========================================
    // PAGE 20: ACTIVATED CARBON FILTER (ACF)
    // ==========================================

    if (acfSpecs) {
        sections.push(
            createHeading("10.2 Activated Carbon Filter (ACF)", 2),
            createParagraph("ACF adsorbs color, odor, and dissolved organics using activated carbon media."),
            
            createSimpleTable(
                ["Design Parameter", "Value"],
                [
                    ["Design Flow", `${safeString(acfCalculations.designFlow)} m³/hr`],
                    ["Filtration Rate", "Based on EBCT / Surface Velocity"],
                    ["Filter Area Required", `${safeString(acfCalculations.areaReq)} m²`],
                    ["Unit Diameter", `${safeString(acfSpecs.diameter)} m`],
                    ["No. of Units", safeString(acfCalculations.numACF)]
                ],
                [50, 50]
            ),
            new PageBreak()
        );
    }

    // ==========================================
    // PAGE 21: PIPING SPECIFICATIONS
    // ==========================================

    sections.push(
        createHeading("11. Piping Material of Construction (MOC)"),
        createSimpleTable(
            ["Service Line", "Material (MOC)", "Type / Class"],
            [
                ["Raw Effluent", "UPVC / HDPE", "Sch 80 / PE100"],
                ["Anaerobic Feed", "SS 304 / HDPE", "Sch 10 / PE100"],
                ["Biogas Line", "SS 304 / HDPE", "Sch 10 / PN6"],
                ["Air Line (Blower to Tank)", "MS 'B' Class / SS 304", "Heavy Duty"],
                ["Air Grid (Inside Tank)", "UPVC / ABS", "High Pressure"],
                ["Sludge Line", "UPVC / HDPE", "Sch 80"],
                ["Chemical Dosing", "UPVC / Braided Hose", "Chemical Resistant"],
                ["Treated Water", "UPVC", "Sch 40"]
            ],
            [40, 30, 30]
        ),
        new PageBreak()
    );

    // ==========================================
    // PAGE 22-23: EQUIPMENT LIST
    // ==========================================

    const equipTableRows = [];
    const addEquipRow = (name, desc, qty, moc) => {
        if(name) {
            equipTableRows.push([
                safeString(name), 
                safeString(desc), 
                safeString(qty || "1"), 
                safeString(moc || "Std")
            ]);
        }
    };

    // Populate Equipment Rows
    if(screens.required) addEquipRow("Bar Screen", `${screens.capacity} ${screens.type}`, "1", screens.moc);
    if(daf.required) addEquipRow("DAF Unit", `${daf.flow} m³/hr`, "1", "Epoxy Coated MS");
    if(anaerobicFeedPump.required) addEquipRow("Anaerobic Feed Pump", anaerobicFeedPump.capacity, anaerobicFeedPump.qty, anaerobicFeedPump.moc);
    if(anaerobicTank.required) addEquipRow("Anaerobic Reactor", anaerobicTank.capacity, anaerobicTank.qty, anaerobicTank.moc);
    if(biogasHolder.required) addEquipRow("Biogas Holder", biogasHolder.capacity, "1", "MSEP / Membrane");
    if(airBlower.required) addEquipRow("Air Blower", airBlower.capacity, airBlower.qty, "CI");
    if(equipment && equipment.length > 0) {
        equipment.forEach(e => addEquipRow(e.name, e.specs, e.qty, "-"));
    }

    sections.push(
        createHeading("12. Equipment List"),
        createSimpleTable(
            ["Equipment Name", "Specifications / Description", "Qty", "MOC"],
            equipTableRows,
            [30, 40, 10, 20]
        ),
        new PageBreak()
    );

    // ==========================================
    // PAGE 24: INSTRUMENT LIST
    // ==========================================

    sections.push(
        createHeading("13. Instrument List"),
        createSimpleTable(
            ["Instrument", "Range/Spec", "Location"],
            instruments && instruments.length > 0 
                ? instruments.map(inst => {
                    // Simple parsing if string, or object usage
                    const parts = typeof inst === 'string' ? inst.split('-') : [inst.name, inst.range, inst.location];
                    return [
                        safeString(parts[0]),
                        safeString(parts[2] || parts[1] || "-"),
                        safeString(parts[1] || "-")
                    ];
                })
                : [["-", "-", "-"]],
            [40, 30, 30]
        ),
        new PageBreak()
    );

    // ==========================================
    // PAGE 25: EXCLUSIONS
    // ==========================================

    sections.push(
        createHeading("14. Exclusions & Important Considerations"),
        createParagraph("The following items are excluded from our scope of supply and shall be arranged by the client:"),
        
        ...importantConsiderationsPoints.map(point => 
            createParagraph(`• ${safeString(point)}`, { spacingBefore: 60, spacingAfter: 60, indent: { left: 720 } })
        ),
        
        createParagraph("• Civil works foundation and construction.", { spacingBefore: 60, indent: { left: 720 } }),
        createParagraph("• Incoming power supply and cabling up to the panel.", { spacingBefore: 60, indent: { left: 720 } }),
        createParagraph("• Laboratory equipment and chemicals.", { spacingBefore: 60, indent: { left: 720 } }),
        createParagraph("• Operation and maintenance staff.", { spacingBefore: 60, indent: { left: 720 } })
    );

    // --- Final Document Assembly ---

    const doc = new Document({
      sections: [{
        properties: {},
        headers: { default: headerElement },
        footers: { default: footerElement },
        children: sections,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Technical_Proposal_${safeString(clientInfo.clientName).replace(/[^a-z0-9]/gi, '_')}.docx`);

  } catch (error) {
    console.error("Error generating Word document:", error);
    throw error;
  }
};
