// Zepto Mother Hub - Multi-Format Export Engine
// Supports CSV (PapaParse), Excel .xlsx (SheetJS), JSON, jsPDF, and Complete Data Pack ZIP (JSZip)

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DATA_DICTIONARY } from '../data/dataDictionary';
import { GeneratedDataPackage } from '../data/dataGenerator';

/**
 * Trigger browser file download
 */
function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export data array to CSV
 */
export function exportToCSV(data: any[], fileName: string = 'export.csv') {
  if (!data || data.length === 0) {
    alert('No data available to export');
    return;
  }
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
}

/**
 * Export data array to Excel (.xlsx)
 */
export function exportToExcel(data: any[], sheetName: string = 'Sheet1', fileName: string = 'export.xlsx') {
  if (!data || data.length === 0) {
    alert('No data available to export');
    return;
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}

/**
 * Export data to formatted JSON
 */
export function exportToJSON(data: any, fileName: string = 'export.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, fileName.endsWith('.json') ? fileName : `${fileName}.json`);
}

/**
 * Export executive PDF summary report
 */
export function exportExecutivePDF(
  kpiSummary: any,
  insights: string[],
  topHubs: any[],
  topCategories: any[]
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header
  doc.setFillColor(88, 28, 135); // Zepto deep purple
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('ZEPTO MOTHER HUB - LOSS CONTROL INTELLIGENCE', 14, 12);
  doc.setFontSize(9);
  doc.text('EXECUTIVE OPERATIONS & FINANCIAL LOSS REDUCTION REPORT', 14, 19);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 150, 19);

  // Executive KPI Grid
  doc.setTextColor(30, 27, 75);
  doc.setFontSize(12);
  doc.text('Key Operational Loss Metrics', 14, 38);

  const kpiData = [
    ['Gross Operational Loss', `INR ${Number(kpiSummary.totalGrossLoss || 0).toLocaleString('en-IN')}`],
    ['Realized Vendor & Transit Recovery', `INR ${Number(kpiSummary.realizedRecovery || 0).toLocaleString('en-IN')}`],
    ['Net Operational Loss', `INR ${Number(kpiSummary.totalNetLoss || 0).toLocaleString('en-IN')}`],
    ['Net Loss Rate % of Throughput', `${kpiSummary.netLossPct}%`],
    ['Inventory Accuracy Rate', `${kpiSummary.inventoryAccuracyPct}%`],
    ['Validated Prevented / Avoided Loss', `INR ${Number(kpiSummary.preventedAvoidedLoss || 0).toLocaleString('en-IN')}`],
    ['Open High-Priority Investigations', `${kpiSummary.openInvestigationsCount} cases`],
  ];

  autoTable(doc, {
    startY: 42,
    head: [['Metric Name', 'Reported Value']],
    body: kpiData,
    theme: 'striped',
    headStyles: { fillColor: [124, 58, 237] },
  });

  // Top Hubs Table
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('Top Mother Hubs by Loss Concentration', 14, finalY);

  const hubRows = topHubs.slice(0, 5).map((h) => [
    h.hubId,
    h.hubName,
    `INR ${Number(h.grossLoss).toLocaleString('en-IN')}`,
    `INR ${Number(h.netLoss).toLocaleString('en-IN')}`,
    `${h.lossRate}%`,
  ]);

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Hub ID', 'Facility Name', 'Gross Loss', 'Net Loss', 'Loss Rate %']],
    body: hubRows,
    theme: 'grid',
    headStyles: { fillColor: [88, 28, 135] },
  });

  // Dynamic Insights
  finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('Algorithmic Operational Findings & RCA Insights', 14, finalY);
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);

  let insightY = finalY + 6;
  insights.slice(0, 4).forEach((ins, idx) => {
    const lines = doc.splitTextToSize(`${idx + 1}. ${ins}`, 180);
    doc.text(lines, 14, insightY);
    insightY += lines.length * 5 + 2;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('Confidential - Internal Zepto Mother Hub Operations Intelligence Report', 14, 285);

  doc.save('Zepto_Executive_Loss_Control_Report.pdf');
}

/**
 * Generate Complete 3-Month Data Pack as ZIP file containing 20 CSV datasets, README, and Data Dictionary
 */
export async function downloadCompleteDataPackZip(pkg: GeneratedDataPackage, onProgress?: (msg: string) => void) {
  if (onProgress) onProgress('Compiling 20 datasets into ZIP archive...');
  const zip = new JSZip();

  // 1. Add Data Dictionary
  const dictCSV = Papa.unparse(DATA_DICTIONARY);
  zip.file('00_Data_Dictionary.csv', dictCSV);

  // 2. Add README & Schema Description
  const readmeContent = `# ZEPTO MOTHER HUB LOSS CONTROL & PREVENTION INTELLIGENCE PLATFORM
## Complete 3-Month Seeded Data Pack (Aug 1, 2026 - Oct 10, 2026)

### Database Overview:
- Mother Hubs: ${pkg.hubs.length}
- SKUs: ${pkg.skus.length}
- Vendors: ${pkg.vendors.length}
- Loss Events: ${pkg.lossEvents.length}
- Cycle Counts: ${pkg.cycleCounts.length}
- GRN Inbound Records: ${pkg.grnRecords.length}
- Transfer Dispatches: ${pkg.transfers.length}
- Damage & Expiry Incidents: ${pkg.damageExpiry.length}
- RCA Investigations: ${pkg.rcaRecords.length}
- Vendor Claims: ${pkg.vendorClaims.length}
- Realized Recoveries: ${pkg.recoveries.length}
- Shift Performance Records: ${pkg.shifts.length}
- Alert Records: ${pkg.alerts.length}
- Actions & Savings Tracker: ${pkg.actions.length}
- Daily Reconciled KPIs: ${pkg.kpiDaily.length}
- Cold Chain Temperature Logs: ${pkg.temperatureLogs.length}
- Inventory Movements: ${pkg.inventoryMovements.length}
- Inventory Snapshots: ${pkg.inventorySnapshots.length}

### Relational Model:
- Primary Key for Hubs: Hub_ID (joins to Loss_Events, GRN, Transfer, Cycle_Count, Shifts)
- Primary Key for SKUs: SKU_ID (joins to Loss_Events, Cycle_Count, Movements)
- Primary Key for Claims: Claim_ID (joins to Recovery_Data)
- Primary Key for Loss Events: Loss_Event_ID (joins to RCA_Tracker)

### Financial Formulas:
- Gross Loss = Sum(Quantity_Lost * Unit_Cost)
- Net Loss = Gross_Loss - Realized_Recovery
- Loss Rate % = (Net_Loss / Throughput_Value) * 100
- Verified Savings = Validated_Avoided_Loss - Intervention_Cost
`;
  zip.file('README.txt', readmeContent);

  // 3. Add each dataset as CSV
  const datasets = [
    { name: '01_Hub_Master.csv', data: pkg.hubs },
    { name: '02_SKU_Master.csv', data: pkg.skus },
    { name: '03_Vendor_Master.csv', data: pkg.vendors },
    { name: '04_Loss_Events.csv', data: pkg.lossEvents },
    { name: '05_Cycle_Count.csv', data: pkg.cycleCounts },
    { name: '06_GRN_Data.csv', data: pkg.grnRecords },
    { name: '07_Transfer_Data.csv', data: pkg.transfers },
    { name: '08_Damage_Expiry.csv', data: pkg.damageExpiry },
    { name: '09_RCA_Tracker.csv', data: pkg.rcaRecords },
    { name: '10_Vendor_Claims.csv', data: pkg.vendorClaims },
    { name: '11_Recovery_Data.csv', data: pkg.recoveries },
    { name: '12_Shift_Data.csv', data: pkg.shifts },
    { name: '13_Alert_Tracker.csv', data: pkg.alerts },
    { name: '14_Action_Tracker.csv', data: pkg.actions },
    { name: '15_KPI_Daily.csv', data: pkg.kpiDaily },
    { name: '16_Temperature_Logs.csv', data: pkg.temperatureLogs },
    { name: '17_Inventory_Movements.csv', data: pkg.inventoryMovements },
    { name: '18_Inventory_Snapshots.csv', data: pkg.inventorySnapshots },
  ];

  datasets.forEach((ds) => {
    zip.file(ds.name, Papa.unparse(ds.data as any));
  });

  if (onProgress) onProgress('Compressing data archive...');
  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, 'Zepto_MotherHub_3Month_LossControl_DataPack.zip');
  if (onProgress) onProgress('Complete! Download started.');
}
