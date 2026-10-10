import { DataDictionaryItem } from '../types';

export const DATA_DICTIONARY: DataDictionaryItem[] = [
  // Hub Master
  { Table_Name: 'Hub_Master', Column_Name: 'Hub_ID', Data_Type: 'VARCHAR(20)', Primary_Foreign_Key: 'PK', Description: 'Unique identifier for Mother Hub', Business_Rule_Formula: 'MH-{CITY_CODE}-{SEQ}' },
  { Table_Name: 'Hub_Master', Column_Name: 'Hub_Name', Data_Type: 'VARCHAR(100)', Primary_Foreign_Key: '', Description: 'Full facility operational name', Business_Rule_Formula: 'Standard facility naming convention' },
  { Table_Name: 'Hub_Master', Column_Name: 'Region', Data_Type: 'VARCHAR(20)', Primary_Foreign_Key: '', Description: 'Geographic zone (North/South/West/East)', Business_Rule_Formula: 'Standard logistics territory' },
  { Table_Name: 'Hub_Master', Column_Name: 'Associated_Dark_Stores_Count', Data_Type: 'INTEGER', Primary_Foreign_Key: '', Description: 'Number of feeder dark stores supplied by hub', Business_Rule_Formula: 'Count of active linked Dark Stores' },
  { Table_Name: 'Hub_Master', Column_Name: 'Target_Max_Loss_Rate_Pct', Data_Type: 'DECIMAL(4,2)', Primary_Foreign_Key: '', Description: 'Target ceiling for net loss as % of throughput', Business_Rule_Formula: 'Annual budget loss rate ceiling' },

  // SKU Master
  { Table_Name: 'SKU_Master', Column_Name: 'SKU_ID', Data_Type: 'VARCHAR(20)', Primary_Foreign_Key: 'PK', Description: 'Unique Stock Keeping Unit barcode / identifier', Business_Rule_Formula: 'SKU-{NUMBER}' },
  { Table_Name: 'SKU_Master', Column_Name: 'SKU_Name', Data_Type: 'VARCHAR(150)', Primary_Foreign_Key: '', Description: 'Commercial product title with packaging size', Business_Rule_Formula: 'Brand + Sub-brand + Size/UoM' },
  { Table_Name: 'SKU_Master', Column_Name: 'Category', Data_Type: 'VARCHAR(50)', Primary_Foreign_Key: '', Description: 'Primary product category hierarchy', Business_Rule_Formula: '12 standard quick-commerce categories' },
  { Table_Name: 'SKU_Master', Column_Name: 'Cost_Price', Data_Type: 'DECIMAL(10,2)', Primary_Foreign_Key: '', Description: 'Weighted Average Cost (WAC) per unit in ₹', Business_Rule_Formula: 'Landed PO Cost net of tax' },
  { Table_Name: 'SKU_Master', Column_Name: 'Shelf_Life_Days', Data_Type: 'INTEGER', Primary_Foreign_Key: '', Description: 'Total valid manufacturer shelf life in days', Business_Rule_Formula: 'Expiry Date - Manufacturing Date' },
  { Table_Name: 'SKU_Master', Column_Name: 'Storage_Type', Data_Type: 'VARCHAR(30)', Primary_Foreign_Key: '', Description: 'Storage temperature protocol', Business_Rule_Formula: 'Ambient | Chilled 2-8°C | Frozen -18°C' },

  // Loss Events
  { Table_Name: 'Loss_Events', Column_Name: 'Loss_Event_ID', Data_Type: 'VARCHAR(20)', Primary_Foreign_Key: 'PK', Description: 'Unique confirmed loss incident reference', Business_Rule_Formula: 'LE-{ID}' },
  { Table_Name: 'Loss_Events', Column_Name: 'Occurrence_Date', Data_Type: 'DATE', Primary_Foreign_Key: '', Description: 'Date when physical loss or incident occurred', Business_Rule_Formula: 'YYYY-MM-DD' },
  { Table_Name: 'Loss_Events', Column_Name: 'Detection_Date', Data_Type: 'DATE', Primary_Foreign_Key: '', Description: 'Date when discrepancy was detected / audited', Business_Rule_Formula: 'YYYY-MM-DD (Occurrence <= Detection)' },
  { Table_Name: 'Loss_Events', Column_Name: 'Hub_ID', Data_Type: 'VARCHAR(20)', Primary_Foreign_Key: 'FK -> Hub_Master', Description: 'Mother Hub where loss was booked', Business_Rule_Formula: 'Must match valid Hub_ID' },
  { Table_Name: 'Loss_Events', Column_Name: 'SKU_ID', Data_Type: 'VARCHAR(20)', Primary_Foreign_Key: 'FK -> SKU_Master', Description: 'Product lost or written off', Business_Rule_Formula: 'Must match valid SKU_ID' },
  { Table_Name: 'Loss_Events', Column_Name: 'Loss_Type', Data_Type: 'VARCHAR(50)', Primary_Foreign_Key: '', Description: 'Categorization of loss driver', Business_Rule_Formula: 'Standard 10 Loss Categories' },
  { Table_Name: 'Loss_Events', Column_Name: 'Process_Stage', Data_Type: 'VARCHAR(30)', Primary_Foreign_Key: '', Description: 'Operational stage where loss happened', Business_Rule_Formula: 'Inbound | Putaway | Storage | Picking | Dispatch | Transfer | Returns' },
  { Table_Name: 'Loss_Events', Column_Name: 'Gross_Loss_Value', Data_Type: 'DECIMAL(12,2)', Primary_Foreign_Key: '', Description: 'Gross financial loss before recovery', Business_Rule_Formula: 'Quantity_Lost * Unit_Cost' },
  { Table_Name: 'Loss_Events', Column_Name: 'Realized_Recovery', Data_Type: 'DECIMAL(12,2)', Primary_Foreign_Key: '', Description: 'Actual cash or credit note recovered', Business_Rule_Formula: 'Debit note approved + Salvage cash' },
  { Table_Name: 'Loss_Events', Column_Name: 'Net_Loss_Value', Data_Type: 'DECIMAL(12,2)', Primary_Foreign_Key: '', Description: 'Final unrecoverable operational loss', Business_Rule_Formula: 'Gross_Loss_Value - Realized_Recovery' },

  // Cycle Counts
  { Table_Name: 'Cycle_Count', Column_Name: 'Count_ID', Data_Type: 'VARCHAR(20)', Primary_Foreign_Key: 'PK', Description: 'Unique physical cycle audit session', Business_Rule_Formula: 'CC-{ID}' },
  { Table_Name: 'Cycle_Count', Column_Name: 'Book_Quantity', Data_Type: 'INTEGER', Primary_Foreign_Key: '', Description: 'System inventory recorded at count snapshot', Business_Rule_Formula: 'WMS inventory ledger' },
  { Table_Name: 'Cycle_Count', Column_Name: 'Physical_Quantity', Data_Type: 'INTEGER', Primary_Foreign_Key: '', Description: 'Actual counted items on rack/bin', Business_Rule_Formula: 'Blind physical barcode scan count' },
  { Table_Name: 'Cycle_Count', Column_Name: 'Variance_Quantity', Data_Type: 'INTEGER', Primary_Foreign_Key: '', Description: 'Discrepancy count between physical and book', Business_Rule_Formula: 'Physical_Quantity - Book_Quantity' },
  { Table_Name: 'Cycle_Count', Column_Name: 'Variance_Value', Data_Type: 'DECIMAL(12,2)', Primary_Foreign_Key: '', Description: 'Absolute financial value of variance', Business_Rule_Formula: 'ABS(Variance_Quantity) * Unit_Cost' },

  // GRN Data
  { Table_Name: 'GRN_Data', Column_Name: 'GRN_ID', Data_Type: 'VARCHAR(20)', Primary_Foreign_Key: 'PK', Description: 'Goods Receipt Note identifier', Business_Rule_Formula: 'GRN-{ID}' },
  { Table_Name: 'GRN_Data', Column_Name: 'PO_Quantity', Data_Type: 'INTEGER', Primary_Foreign_Key: '', Description: 'Quantity ordered in purchase order', Business_Rule_Formula: 'PO Authorized Quantity' },
  { Table_Name: 'GRN_Data', Column_Name: 'Physically_Received_Qty', Data_Type: 'INTEGER', Primary_Foreign_Key: '', Description: 'Quantity physically unloaded at dock', Business_Rule_Formula: 'Dock scan receipt' },
  { Table_Name: 'GRN_Data', Column_Name: 'Shortage_Quantity', Data_Type: 'INTEGER', Primary_Foreign_Key: '', Description: 'Supplier short delivery quantity', Business_Rule_Formula: 'Invoiced_Quantity - Physically_Received_Qty' },

  // Vendor Claims
  { Table_Name: 'Vendor_Claims', Column_Name: 'Claim_ID', Data_Type: 'VARCHAR(20)', Primary_Foreign_Key: 'PK', Description: 'Formal vendor chargeback claim', Business_Rule_Formula: 'CLM-{ID}' },
  { Table_Name: 'Vendor_Claims', Column_Name: 'Claimed_Amount', Data_Type: 'DECIMAL(12,2)', Primary_Foreign_Key: '', Description: 'Amount billed to supplier for shortage/damage', Business_Rule_Formula: 'Shortage/Damage Qty * Contract Price' },
  { Table_Name: 'Vendor_Claims', Column_Name: 'Realized_Recovery', Data_Type: 'DECIMAL(12,2)', Primary_Foreign_Key: '', Description: 'Amount collected via debit note deduction', Business_Rule_Formula: 'Settled amount in ERP ledger' },

  // Action Tracker
  { Table_Name: 'Action_Tracker', Column_Name: 'Action_ID', Data_Type: 'VARCHAR(20)', Primary_Foreign_Key: 'PK', Description: 'Loss prevention corrective action plan', Business_Rule_Formula: 'ACT-{ID}' },
  { Table_Name: 'Action_Tracker', Column_Name: 'Baseline_Loss_Rate', Data_Type: 'DECIMAL(4,2)', Primary_Foreign_Key: '', Description: 'Loss rate before operational intervention', Business_Rule_Formula: 'Pre-intervention 30-day average' },
  { Table_Name: 'Action_Tracker', Column_Name: 'Current_Loss_Rate', Data_Type: 'DECIMAL(4,2)', Primary_Foreign_Key: '', Description: 'Loss rate post intervention deployment', Business_Rule_Formula: 'Post-intervention running average' },
  { Table_Name: 'Action_Tracker', Column_Name: 'Validated_Avoided_Loss', Data_Type: 'DECIMAL(12,2)', Primary_Foreign_Key: '', Description: 'Quantified gross savings from loss prevention', Business_Rule_Formula: '(Baseline Rate - Current Rate) * Throughput' },
  { Table_Name: 'Action_Tracker', Column_Name: 'Verified_Net_Benefit', Data_Type: 'DECIMAL(12,2)', Primary_Foreign_Key: '', Description: 'Net savings after subtracting project cost', Business_Rule_Formula: 'Validated_Avoided_Loss - Intervention_Cost' },

  // Temperature Logs
  { Table_Name: 'Temperature_Logs', Column_Name: 'Log_ID', Data_Type: 'VARCHAR(20)', Primary_Foreign_Key: 'PK', Description: 'IoT Cold Room sensor reading telemetry', Business_Rule_Formula: 'TMP-{ID}' },
  { Table_Name: 'Temperature_Logs', Column_Name: 'Recorded_Temp_C', Data_Type: 'DECIMAL(4,1)', Primary_Foreign_Key: '', Description: 'Physical temperature recorded by sensor', Business_Rule_Formula: 'Degree Celsius' },
  { Table_Name: 'Temperature_Logs', Column_Name: 'Excursion_Flag', Data_Type: 'BOOLEAN', Primary_Foreign_Key: '', Description: 'Flag indicating temp went outside safe threshold', Business_Rule_Formula: 'Temp < Min_Threshold OR Temp > Max_Threshold' },
];
