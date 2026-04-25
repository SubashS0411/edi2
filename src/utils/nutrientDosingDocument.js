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
  HeadingLevel, 
  AlignmentType,
  Header,
  Footer,
  PageNumber
} from "docx";
import { saveAs } from "file-saver";

const BRAND_COLOR = "047857";
const GRAY_COLOR = "666666";

const borders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
};

const createCell = (text, isHeader = false, shading) => new TableCell({
  children: [new Paragraph({
    children: [new TextRun({ 
      text: String(text || '-'), 
      bold: isHeader,
      size: 24,
      font: "Calibri"
    })]
  })],
  shading: shading ? shading : (isHeader ? { fill: "F8FAFC" } : undefined),
  margins: { top: 100, bottom: 100, left: 100, right: 100 }
});

const createRow = (label, value) => new TableRow({
  children: [
    createCell(label, true),
    createCell(value)
  ]
});

export const createNutrientDosingDocument = async (data) => {
  try {
    const children = [
      new Paragraph({
        text: "Nutrient Dosing Requirement Report",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "EDI ENVIRO AND ENGINEERING", color: GRAY_COLOR, size: 20 })
        ],
        spacing: { after: 500 }
      }),
    ];

    if (data) {
        children.push(new Paragraph({
            text: "Process Parameters",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
        }));

        children.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borders,
            rows: [
                createRow("Flow Rate", `${data.flow} m³/hr`),
                createRow("sCOD Concentration", `${data.scod} mg/l`),
                createRow("Removal Efficiency", `${data.efficiency}%`),
                createRow("Influent NH4-N", `${data.nh4} mg/l`),
                createRow("Influent PO4-P", `${data.po4} mg/l`),
            ]
        }));

        if (data.results) {
             children.push(new Paragraph({
                text: "Nutrient Requirements",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 100 }
            }));

             children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: borders,
                rows: [
                    createRow("Total N Required", `${data.results.requiredN.toFixed(2)} kg/day`),
                    createRow("Net N Deficit", `${data.results.deficitN.toFixed(2)} kg/day`),
                    createRow("Total P Required", `${data.results.requiredP.toFixed(2)} kg/day`),
                    createRow("Net P Deficit", `${data.results.deficitP.toFixed(2)} kg/day`),
                ]
            }));

            children.push(new Paragraph({
                text: "Dosing Option 1: Urea + Phosphoric Acid",
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300, after: 100 }
            }));

            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: borders,
                rows: [
                    createRow("Urea Dosing Rate", `${data.results.opt1.urea.toFixed(2)} kg/day`),
                    createRow("Suggested Urea Tank", `${data.results.opt1.ureaTank} m³`),
                    createRow("Phosphoric Acid Rate", `${data.results.opt1.acid.toFixed(2)} kg/day`),
                    createRow("Suggested Acid Tank", `${data.results.opt1.acidTank} m³`),
                ]
            }));

            children.push(new Paragraph({
                text: "Dosing Option 2: Urea + DAP",
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300, after: 100 }
            }));

             children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: borders,
                rows: [
                    createRow("Urea Dosing Rate", `${data.results.opt2.urea.toFixed(2)} kg/day`),
                    createRow("Suggested Urea Tank", `${data.results.opt2.ureaTank} m³`),
                    createRow("DAP Dosing Rate", `${data.results.opt2.dap.toFixed(2)} kg/day`),
                    createRow("Suggested DAP Tank", `${data.results.opt2.dapTank} m³`),
                ]
            }));
        }
    } else {
        children.push(new Paragraph({ text: "No data provided for report." }));
    }

    const doc = new Document({
      sections: [{
        properties: {},
        headers: {
            default: new Header({
                children: [new Paragraph({ text: "Nutrient Dosing Calculation", alignment: AlignmentType.RIGHT })]
            })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun("Page "),
                  new TextRun({ children: [PageNumber.CURRENT] }),
                  new TextRun(" of "),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
                ],
              }),
            ],
          }),
        },
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Nutrient_Dosing_Report.docx");
    return true;
  } catch (error) {
    console.error("Nutrient Doc Error:", error);
    throw error;
  }
};