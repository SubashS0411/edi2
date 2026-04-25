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

const BRAND_COLOR = "047857"; // Emerald 700
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

export const createBioGasGeneratorDocument = async (data) => {
  try {
    const children = [
      new Paragraph({
        text: "Biogas Generation Report",
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
            text: "Input Parameters",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
        }));

        children.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borders,
            rows: [
                createRow("Influent Flow Rate", `${data.flow} m³/hr`),
                createRow("sCOD Concentration", `${data.scod} mg/l`),
                createRow("Anaerobic Efficiency", `${data.efficiency}%`),
                createRow("Comparison Fuel", data.fuelType),
            ]
        }));

        if (data.results) {
             children.push(new Paragraph({
                text: "Calculated Results",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 100 }
            }));

            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: borders,
                rows: [
                    createRow("Biogas Generation", `${data.results.biogasGen.toFixed(1)} Nm³/day`),
                    createRow("sCOD Removed", `${data.results.removedKgDay.toFixed(0)} kg/day`),
                    createRow("Total Energy Value", `${(data.results.totalKcal / 1000).toFixed(0)} Mcal/day`),
                    createRow(`Equivalent ${data.results.fuelName} Savings`, `${data.results.fuelSavings.toFixed(1)} ${data.results.fuelUnit}/day`),
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
                children: [new Paragraph({ text: "Biogas Potential Assessment", alignment: AlignmentType.RIGHT })]
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
    saveAs(blob, "Biogas_Generation_Report.docx");
    return true;
  } catch (error) {
    console.error("Biogas Doc Error:", error);
    throw error;
  }
};