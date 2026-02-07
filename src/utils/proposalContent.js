// Proposal Text Content based on User Sample

export const BROMIDE_IMPACT_TEXT = `Anaerobic microbes (like methanogens, fermenters, sulfate reducers) are sensitive to halogens and oxidizing compounds.
- Bromide (Br⁻): Low toxicity. Generally tolerated up to several hundred mg/L in anaerobic digesters.
- Hypobromous acid (HOBr): Highly toxic. Even low mg/L levels can inhibit methanogenesis.
- Bromate (BrO₃⁻): Strongly inhibitory. Acts as an oxidant; damages enzymes and cell walls.
- Organic bromides: Variable. Some (like bromoform, CHBr₃) can strongly inhibit methanogens.`;

export const VFA_IMPACT_TEXT = `In recycled fiber (RCF)-based paper mills, elevated VFAs significantly influence anaerobic processes.
Higher VFA levels (acetic, propionic acids) dissociate calcium carbonate (CaCO₃) to form calcium acetate (Ca(CH₃COO)₂):
CaCO₃ + 2CH₃COOH → Ca(CH₃COO)₂ + H₂O + CO₂
Degradation of calcium acetate releases calcium ions, which precipitate as coatings on granular biomass.
Negative consequences: Reduced surface area, increased sludge density (poor settling), and mass transfer interference.
Control: Maintain pre-acidification degree < 40% to limit VFA accumulation and calcium precipitation.`;

export const TECH_OVERVIEW_CONTENT = [
    {
        type: 'heading',
        text: '1. Anaerobic: ELAR (Elevated Anaerobic Reactor)'
    },
    {
        type: 'paragraph',
        text: 'The ELAR is an advanced anaerobic system for high-strength organic wastewater, combining compact design, enhanced separation, and high-rate digestion.'
    },
    {
        type: 'list',
        items: [
            'Working Principle: Converts COD/BOD into biogas (methane). Elevated separator ensures biomass retention.',
            'Key Features: Compact design, High Loading (10–15 kg COD/m³/day), Biomass Flexibility.',
            'Applications: Paper/Pulp, Food/Bev, Starch, Distilleries.'
        ]
    },
    {
        type: 'heading',
        text: '2. Aerobic Tank'
    },
    {
        type: 'paragraph',
        text: 'Follows anaerobic treatment. Surface aerators oxidize residuals and precipitate calcium carbonate, increasing sludge density for better settling.'
    },
    {
        type: 'heading',
        text: '3. Secondary Clarifier'
    },
    {
        type: 'paragraph',
        text: 'Circular clarifier for solids separation. Features high settling efficiency (SVI 50–80 mL/g) due to inorganic-rich sludge.'
    }
];

export const PROCESS_DESC_CONTENT = [
    {
        type: 'heading',
        text: 'Overview'
    },
    {
        type: 'paragraph',
        text: 'The process integrates physical, chemical, and biological stages for COD removal and energy recovery.'
    },
    {
        type: 'list',
        items: [
            'DAF Unit: Removes suspended solids.',
            'Pre-Acidification: Conditions wastewater (hydrolysis).',
            'ELAR (Anaerobic): Core COD removal & biogas generation.',
            'Biogas Holder: Buffers gas flow.',
            'Aeration Tank: Polishing & calcium precipitation.',
            'Secondary Clarifier: Solids separation.',
            'Sludge Handling: Dewatering via Screw Press.'
        ]
    }
];

export const EXCLUSIONS_LIST = [
    "Civil Works: Excavation, RCC, foundations, roads, drains, etc.",
    "Erection, Fabrication & Site Handling: Site welding, alignment, unloading, shifting.",
    "Storage Shed: For equipment and chemicals.",
    "Start-up Biomass / Seed Sludge: Supply and transportation excluded unless specified.",
    "Dewatered Sludge Disposal: Handling and statutory compliance.",
    "Statutory Clearances: EC, CTE, CTO, local approvals.",
    "Utilities: Power, water, compressed air supply.",
    "Lab Instruments & Chemicals: For daily operations.",
    "Cranes & Heavy Handling Equipment: For erection.",
    "Electrical Systems: MCC, PLC, Transformers, Cabling (unless specified in EDI scope).",
    "Lightning Protection & Plant Lighting.",
    "Unspecified Items."
];

// Keep existing object for backward compatibility if needed, though individual exports are preferred now.
export const PROPOSAL_CONTENT = {
    impactBromide: { text: BROMIDE_IMPACT_TEXT },
    impactVFA: { text: VFA_IMPACT_TEXT },
    exclusions: EXCLUSIONS_LIST
};
