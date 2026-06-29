import * as XLSX from 'xlsx';
import type { Tire, Sale } from './types';

export const downloadExcelReport = (
  sales: Sale[],
  tires: Tire[],
  locationName: string,
  reportType: string,
  startDate: string,
  endDate: string,
  kpis: {
    totalTiresSold: number;
    totalCurrentStock: number;
    lowStockCount: number;
    topTireType: string;
    topTireTypeQty: number;
    topTireModel: string;
    topTireModelQty: number;
  }
) => {
  const wb = XLSX.utils.book_new();

  // --- SHEET 1: SUMMARY ---
  const summaryAOA: any[][] = [
    [{ v: "TREADFLOW BUSINESS REPORT SUMMARY", t: 's' }],
    [],
    [{ v: "1. REPORT METADATA", t: 's' }],
    ["Store Location:", locationName],
    ["Report Interval:", reportType.charAt(0).toUpperCase() + reportType.slice(1)],
    ["Date Range:", `${startDate} to ${endDate}`],
    ["Generated On:", new Date().toLocaleString()],
    [],
    [{ v: "2. KEY PERFORMANCE INDICATORS", t: 's' }],
    ["Key Metric", "Value", "Context / Description"],
    ["Total Tires Sold", { v: kpis.totalTiresSold, t: 'n', z: '#,##0' }, "Total quantity of tires sold in this period"],
    ["Current Stock Quantity", { v: kpis.totalCurrentStock, t: 'n', z: '#,##0' }, "Total stock units currently available in inventory"],
    ["Low Stock Warnings (<5)", { v: kpis.lowStockCount, t: 'n', z: '#,##0' }, "Number of tire models with critically low stock levels"],
    ["Top Performing Tire Category", kpis.topTireType || "N/A", kpis.topTireTypeQty ? `${kpis.topTireTypeQty} units sold` : ""],
    ["Top Selling Tire Model", kpis.topTireModel || "N/A", kpis.topTireModelQty ? `${kpis.topTireModelQty} units sold` : ""]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAOA);

  // --- SHEET 2: SALES HISTORY ---
  const salesHeader = [
    "S.No", 
    "Sale Date", 
    "Tire Model Name", 
    "Tire Type Category", 
    "Quantity Sold (Units)", 
    "Location/Store"
  ];
  const salesRows = sales.map((sale, idx) => [
    idx + 1,
    sale.saleDate,
    sale.tireName,
    sale.tireType,
    { v: sale.quantity, t: 'n', z: '#,##0' },
    locationName
  ]);
  const salesAOA = [
    [{ v: `SALES HISTORY LOGS - ${locationName.toUpperCase()}`, t: 's' }],
    [`Period: ${startDate} to ${endDate}`],
    [],
    salesHeader,
    ...salesRows
  ];

  if (salesRows.length === 0) {
    salesAOA.push(["No sales transactions recorded for this period."]);
  }

  const wsSales = XLSX.utils.aoa_to_sheet(salesAOA);

  // --- SHEET 3: CURRENT INVENTORY ---
  const inventoryHeader = [
    "S.No",
    "Tire Model Name",
    "Type Category",
    "Stock Quantity (Units)",
    "Stock Status"
  ];
  const inventoryRows = tires.map((tire, idx) => {
    let status = "In Stock";
    if (tire.quantity === 0) {
      status = "Out of Stock";
    } else if (tire.quantity < 5) {
      status = "Low Stock Alert";
    }
    return [
      idx + 1,
      tire.name,
      tire.type,
      { v: tire.quantity, t: 'n', z: '#,##0' },
      status
    ];
  });
  const inventoryAOA = [
    [{ v: `CURRENT STOCK INVENTORY - ${locationName.toUpperCase()}`, t: 's' }],
    [`Generated On: ${new Date().toLocaleDateString()}`],
    [],
    inventoryHeader,
    ...inventoryRows
  ];

  if (inventoryRows.length === 0) {
    inventoryAOA.push(["No tire models registered in this location."]);
  }

  const wsInventory = XLSX.utils.aoa_to_sheet(inventoryAOA);

  // --- AUTO-FIT COLUMN WIDTHS & STYLING HELPER ---
  const fitColumns = (ws: XLSX.WorkSheet) => {
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
    const cols = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxLen = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        const cell = ws[cell_ref];
        if (cell && cell.v) {
          const valStr = String(cell.v);
          if (valStr.length > maxLen) {
            maxLen = valStr.length;
          }
        }
      }
      cols.push({ wch: Math.min(maxLen + 3, 40) }); // cap width at 40 chars
    }
    ws['!cols'] = cols;
  };

  fitColumns(wsSummary);
  fitColumns(wsSales);
  fitColumns(wsInventory);

  // Append sheets
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary Overview");
  XLSX.utils.book_append_sheet(wb, wsSales, "Sales Transactions");
  XLSX.utils.book_append_sheet(wb, wsInventory, "Current Inventory");

  // Format filenames beautifully
  const cleanLocName = locationName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `treadflow_report_${cleanLocName}_${reportType}_${startDate}_to_${endDate}.xlsx`;

  // Write file
  XLSX.writeFile(wb, filename);
};
