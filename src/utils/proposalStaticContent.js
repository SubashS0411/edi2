export const staticDesignBasis = {
    intro: "The design basis is based on the paper production of 300 TPD.",
    parameters: [
        { sn: 1, param: "Flow", unit: "m3/day", raw: "6000", anaInlet: "4890" },
        { sn: 2, param: "pH", unit: "-", raw: "6.5 - 7.5", anaInlet: "6.5 - 7.5" },
        { sn: 3, param: "Temperature", unit: "°C", raw: "30 - 38", anaInlet: "30 - 38" },
        { sn: 4, param: "TSS", unit: "mg/l", raw: "4000", anaInlet: "< 300" },
        { sn: 5, param: "TDS", unit: "mg/l", raw: "4000", anaInlet: "4000" },
        { sn: 6, param: "VFA", unit: "meq/l", raw: "30", anaInlet: "< 30" },
        { sn: 7, param: "Calcium", unit: "mg/l", raw: "< 600", anaInlet: "< 600" },
        { sn: 8, param: "Sulphate", unit: "mg/l", raw: "< 200", anaInlet: "< 200" },
        { sn: 9, param: "tCOD", unit: "mg/l", raw: "6000", anaInlet: "6000" },
        { sn: 10, param: "BOD", unit: "mg/l", raw: "2500", anaInlet: "2500" },
        { sn: 11, param: "sCOD", unit: "mg/l", raw: "5000", anaInlet: "5000" },
        { sn: 12, param: "Chlorides", unit: "mg/l", raw: "500", anaInlet: "500" },
        { sn: 13, param: "ORP", unit: "mV", raw: "-100 to -150", anaInlet: "-100 to -150" },
        { sn: 14, param: "Toxic Elements", unit: "mg/l", raw: "Nil", anaInlet: "Nil" },
        { sn: 15, param: "NH4-N", unit: "mg/l", raw: "0", anaInlet: "0" },
        { sn: 16, param: "PO4-P", unit: "mg/l", raw: "0", anaInlet: "0" },
        { sn: 17, param: "FOG", unit: "mg/l", raw: "50", anaInlet: "50" }
    ],
    notes: [
        "Client has to ensure the feed limiting parameters like pH, TSS and temperature are maintaining well within the limit.",
        "Client has to avoid using bromine based biocide in the mill as it is a strong oxidant.",
        "Client has to ensure all the mill chemicals used in the wet end get prior approval from EDI enviro."
    ]
};

export const technologyOverview = {
    title: "2.1 Technology Overview",
    sections: [
        {
            title: "ELAR (Elevated Anaerobic Reactor)",
            intro: "The ELAR is a high-rate anaerobic system designed for industrial wastewater. It utilizes a granular sludge blanket to degrade organic matter, producing biogas as a valuable by-product.",
            subsections: [
                {
                    heading: "Working Principle",
                    text: "The ELAR is a high-rate anaerobic system designed for industrial wastewater. It utilizes a granular sludge blanket to degrade organic matter, producing biogas as a valuable by-product."
                },
                {
                    heading: "Key Features & Advantages",
                    bullets: [
                        "Compact design with small footprint",
                        "High organic loading capacity",
                        "Flexible biomass retention",
                        "Efficient energy recovery (biogas)"
                    ]
                },
                {
                    heading: "Applications",
                    text: "Suitable for high COD wastewaters including paper mills, starch, distilleries, and food processing industries."
                }
            ]
        },
        {
            title: "Aerobic Treatment System",
            intro: "The aerobic tank serves as a post-anaerobic treatment stage to polish the effluent. It utilizes activated sludge process where microorganisms degrade remaining organics in the presence of oxygen.",
            subsections: [
                {
                    heading: "Key Parameters & Mechanism",
                    bullets: [
                        "Calcium precipitation mechanism integration for scaling control",
                        "MLSS Range: 5,000 - 10,000 mg/L for high stability",
                        "MLVSS: 40 - 50% indicating active biomass",
                        "High efficiency oxygen transfer system for energy savings",
                        "Robust biological reduction of residual COD and BOD"
                    ]
                }
            ]
        },
        {
            title: "Secondary Clarification",
            intro: "Designed for effective solid-liquid separation after the aerobic stage. It ensures high-quality effluent and proper sludge recirculation.",
            subsections: [
                {
                    heading: "Specifications & Operation",
                    bullets: [
                        "Optimized Hydraulic Loading Rate (HLR) for clear separation",
                        "Controlled Solids Loading Rate (SLR) to handle biomass flux",
                        "Efficient Return Activated Sludge (RAS) system to maintain MLSS",
                        "Waste Activated Sludge (WAS) management for excess biomass removal",
                        "Ensures final effluent meets discharge or recycle quality norms"
                    ]
                }
            ]
        }
    ]
};

export const processDescription = {
    title: "2.2 Process Description",
    items: [
        { title: "DAF", text: "The Dissolved Air Flotation (DAF) unit removes suspended solids and fats/oils/grease (FOG) from the raw effluent using micro-bubbles. This pre-treatment step protects downstream biological systems from inert solids accumulation and shock loads." },
        { title: "Pre-Acidification", text: "This tank conditions the wastewater, adjusting pH and ensuring partial acidification (VFA generation) before entering the anaerobic reactor. Degree of acidification is controlled <40% to prevent scaling issues. Includes necessary agitation to maintain homogeneity." },
        { title: "ELAR", text: "The main biological treatment stage where organic pollutants are converted into biogas by anaerobic bacteria in a controlled, oxygen-free environment. Features internal three-phase separation (Gas-Liquid-Solid) to retain granular biomass while releasing biogas and treated effluent. Includes sampling points and instrumentation for process monitoring." },
        { title: "Biogas & Flare", text: "Biogas generated is collected in a constant pressure gas holder. Excess gas is safely burned via an automated flare stack system to prevent atmospheric discharge. System includes safety devices like flame arrestors, pressure relief valves, and condensate traps." },
        { title: "Biomass Tank", text: "Stores excess granular sludge or biomass for future use or system restart, preserving valuable biological inventory. Essential for quick recovery after shutdowns or upsets." },
        { title: "Aeration Tank", text: "An oxygen-rich environment where aerobic bacteria further degrade COD/BOD to meet final discharge norms. Equipped with fine bubble or surface aeration systems to provide dissolved oxygen and mixing." },
        { title: "Secondary Clarifier", text: "Separates biological sludge from treated water by gravity settling. Settled sludge is recycled to the aeration tank (RAS) to maintain MLSS, while clear overflow water is discharged for tertiary treatment or disposal." },
        { title: "Sludge Handling", text: "Generates excess biological and chemical sludge is dewatered using a screw press or centrifuge to reduce volume before disposal. Includes polymer dosing system for sludge conditioning." }
    ]
};

export const performanceGuarantees = {
    title: "2.3 Performance Guarantees",
    anaerobic: {
        title: "Anaerobic Section",
        headers: ["Parameter", "Guaranteed Value"],
        data: [
            { param: "Anaerobic SCOD Removal", val: "80%" },
            { param: "Anaerobic BOD Removal", val: "80%" },
            { param: "Biogas Generation Factor", val: "0.42 Nm3/kg COD removed" }
        ]
    },
    aerobic: {
        title: "Aerobic Section (Secondary Clarifier Outlet)",
        headers: ["Parameter", "Guaranteed Value"],
        data: [
            { param: "Secondary Clarifier Outlet SCOD", val: "~250 mg/l" },
            { param: "Secondary Clarifier Outlet TSS", val: "50 mg/l" },
            { param: "Secondary Clarifier Outlet BOD", val: "30 mg/l" }
        ]
    },
    importantConsiderations: {
        title: "Important Considerations",
        bullets: [
            "Client has to ensure strict adherence to the limiting parameters like pH, TSS, Temperature etc.",
            "Anaerobic reactor performance depends on the VFA, Alkalinity, pH and Temperature inside the reactor.",
            "Biogas generation depends on the COD reduction and VFA profile.",
            "Acid sizing chemicals (Rosins/Alum) should be minimized or substituted as they inhibit anaerobic activity.",
            "Oxidizing biocides (Hypo, Chlorine Dioxide, Bromine etc.) are strictly prohibited.",
            "Mill must ensure discharge is approx 200 m3/day and fresh water intake is restricted to 800 m3/day.",
            "Approx 5,300 m3/day treated water to be recycled to pulping section.",
            "Mill retention time should be less than 24 hours to prevent VFA generation in the mill loop itself."
        ]
    }
};

export const theoryContent = {
    title: "3. Process Impact Analysis",
    bromide: {
        title: "3.1 Impact of Bromide",
        intro: "Anaerobic microbes (like methanogens, fermenters, sulfate reducers) are sensitive to halogens and oxidizing compounds.",
        headers: ["Compound", "Effect on Anaerobes", "Notes"],
        table: [
            { compound: "Bromide (Br-)", effect: "Generally inert", notes: "Acts as a precursor. Can be oxidized to HOBr." },
            { compound: "Hypobromous acid (HOBr)", effect: "Highly toxic", notes: "Stronger biocide than HOCl at high pH." },
            { compound: "Bromate (BrO3-)", effect: "Inhibitory", notes: "Formed if bromide is oxidized by ozone." },
            { compound: "Organic bromides", effect: "Variable toxicity", notes: "Some can be degraded, others recalcitrant." }
        ]
    },
    heavyMetals: {
        title: "3.2 Impact of Heavy Metals",
        headers: ["Metal", "Role (Trace)", "Beneficial (mg/L)", "Toxic (mg/L)", "Comments"],
        table: [
            { metal: "Zinc (Zn2+)", role: "Essential", beneficial: "0.05 - 2.0", toxic: "> 5 - 10", comments: "High levels precipitate." },
            { metal: "Cobalt (Co2+)", role: "Essential", beneficial: "0.01 - 0.5", toxic: "> 1.0 - 5.0", comments: "Critical for B12." },
            { metal: "Manganese (Mn2+)", role: "Essential", beneficial: "0.05 - 5.0", toxic: "> 10 - 50", comments: "Stabilizes enzymes." },
            { metal: "Copper (Cu2+)", role: "Essential", beneficial: "0.01 - 0.5", toxic: "> 1.0 - 2.0", comments: "Toxic free ion." },
            { metal: "Nickel (Ni2+)", role: "Essential", beneficial: "0.05 - 0.5", toxic: "> 2.0 - 5.0", comments: "Critical for F430." },
            { metal: "Iron (Fe2+/3+)", role: "Macro/Trace", beneficial: "1.0 - 10.0", toxic: "> 50", comments: "Precipitates sulfide." }
        ]
    },
    vfa: {
        title: "3.3 Impact of Higher VFA (Volatile Fatty Acids)",
        text: "In RCF based paper mills, VFA concentration is generally on the higher side. Due to anaerobic activity inside the reactor, VFA is converted into methane and carbon dioxide. Calcium reacts with acetate to form Calcium Acetate, which eventually degrades to Calcium Carbonate (CaCO3).",
        equation: "CaCO3 + 2CH3COOH → Ca(CH3COO)2 + H2O + CO2",
        consequencesTitle: "Negative Consequences of Calcium Deposition:",
        consequences: [
            "Reduces effective surface area for microbial activity.",
            "Increases sludge density, leading to poor settling or granule disintegration.",
            "Interferes with mass transfer, lowering reactor efficiency."
        ],
        controlMeasure: "Control Measure: Maintain Pre-acidification degree <40% to minimize scaling risks."
    }
};

export const exclusionsList = [
    { title: "Civil Works", desc: "All civil, structural, and allied works including excavation, PCC, RCC, foundations, etc." },
    { title: "Erection, Fabrication & Site Handling", desc: "Mechanical erection, fabrication, and material handling at site." },
    { title: "Storage Shed", desc: "Covered area for equipment and chemical storage." },
    { title: "Start-up Biomass", desc: "Supply and acclimatization of seed sludge." },
    { title: "Dewatered Sludge Handling", desc: "Disposal of sludge or waste solids." },
    { title: "Statutory Clearances", desc: "EC, CTE, CTO, and other approvals." },
    { title: "HAZOP / Safety Studies", desc: "Safety audits and risk assessments." },
    { title: "Utilities for Operation", desc: "Continuous and uninterrupted supply of electric power, service water, compressed air, and other utilities required for plant commissioning and regular operation, including infrastructure, cabling, piping, and backup systems." },
    { title: "Laboratory Instruments & Chemicals", desc: "Supply, calibration, operation, and maintenance of laboratory instruments, reagents, consumables, and chemicals required for testing during commissioning and routine operation." },
    { title: "Cranes & Heavy Handling Equipment", desc: "Provision, mobilization, operation, and demobilization of cranes, forklifts, hydras, chain blocks, or any heavy lifting equipment required for erection or maintenance." },
    { title: "Electrical Systems & Panels", desc: "Complete electrical scope including MCC panels, PLC panels, main incomer panels, transformers, cables, cable trays, earthing, VFDs, field cabling, termination, testing, and commissioning, unless explicitly included." },
    { title: "Lightning / Lighting Arrestor", desc: "Design, supply, installation, testing, and certification of lightning protection or lightning arrestor systems." },
    { title: "Plant Lighting", desc: "Supply and installation of area lighting, yard lighting, internal plant lighting, fixtures, poles, cabling, and switches for the plant premises." },
    { title: "Unspecified Items", desc: "Any item, service, activity, or material not explicitly mentioned in the scope of supply, scope of services, or commercial offer shall be deemed excluded." }
];

export const exclusionsConclusion = "Any additional items required for successful completion or operation of the plant, but not specifically mentioned in this proposal, shall be discussed and mutually agreed upon as a variation in scope.";
