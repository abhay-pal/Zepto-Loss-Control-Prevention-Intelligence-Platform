// Zepto Mother Hub - Loss Control & Prevention Intelligence Platform
// Types and Data Models matching Google Sheets Database schema

export type UserRole =
  | 'Senior Manager'
  | 'Hub Manager'
  | 'Inventory Analyst'
  | 'Loss Prevention Analyst'
  | 'Finance Viewer'
  | 'Admin';

export type ProcessStage =
  | 'Inbound'
  | 'Putaway'
  | 'Storage'
  | 'Picking'
  | 'Dispatch'
  | 'Transfer'
  | 'Returns';

export type LossCategory =
  | 'Unexplained Inventory Shrinkage'
  | 'Physical Damage'
  | 'Expiry'
  | 'Spoilage'
  | 'Temperature-Related Loss'
  | 'Inbound Shortage'
  | 'Putaway Discrepancy'
  | 'Picking Errors'
  | 'Dispatch / Transfer Shortage'
  | 'Returns Discrepancy'
  | 'Other Confirmed Operational Loss';

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type AlertStatus =
  | 'New'
  | 'Assigned'
  | 'Investigating'
  | 'RCA Completed'
  | 'Corrective Action'
  | 'Validated'
  | 'Closed';

export type ActionStatus = 'Open' | 'In Progress' | 'Completed' | 'Validated';

export type ClaimStatus =
  | 'Raised'
  | 'Under Review'
  | 'Approved'
  | 'Debit Note Issued'
  | 'Settled'
  | 'Rejected';

// Database Models matching Google Sheets Tabs:

export interface HubMaster {
  Hub_ID: string;
  Hub_Name: string;
  Region: 'North' | 'South' | 'West' | 'East';
  City: string;
  Associated_Dark_Stores_Count: number;
  Total_Storage_Capacity_SqFt: number;
  Cold_Storage_Capacity_SqFt: number;
  Active_Shifts_Count: number;
  Headcount: number;
  Status: 'Active' | 'Under Maintenance';
  Target_Max_Loss_Rate_Pct: number;
}

export interface SKUMaster {
  SKU_ID: string;
  SKU_Name: string;
  Category: string;
  Sub_Category: string;
  Cost_Price: number;
  Selling_Price: number;
  UoM: string;
  Shelf_Life_Days: number;
  Storage_Type: 'Ambient' | 'Chilled 2-8°C' | 'Frozen -18°C';
  High_Value_Flag: boolean;
  High_Risk_Flag: boolean;
  Velocity_Class: 'A' | 'B' | 'C';
}

export interface VendorMaster {
  Vendor_ID: string;
  Vendor_Name: string;
  Category_Supplied: string;
  SLA_Score: number;
  Historical_Fill_Rate: number;
  Payment_Terms_Days: number;
  Contact_Person: string;
  Contact_Email: string;
  Status: 'Active' | 'On Probation' | 'Blocked';
}

export interface LossEvent {
  Loss_Event_ID: string;
  Occurrence_Date: string;
  Detection_Date: string;
  Posting_Date: string;
  Hub_ID: string;
  SKU_ID: string;
  SKU_Name?: string;
  Category: string;
  Loss_Type: LossCategory;
  Process_Stage: ProcessStage;
  Quantity_Lost: number;
  Unit_Cost: number;
  Gross_Loss_Value: number;
  Recoverable_Amount: number;
  Realized_Recovery: number;
  Net_Loss_Value: number;
  Root_Cause_Code: string;
  Root_Cause_Description: string;
  Storage_Zone: string;
  Shift_ID: string;
  Discovered_By: string;
  Status: 'Confirmed' | 'Investigating' | 'RCA Completed' | 'Recovered';
  Investigation_ID?: string;
}

export interface CycleCountRecord {
  Count_ID: string;
  Hub_ID: string;
  Zone_ID: string;
  SKU_ID: string;
  SKU_Name?: string;
  Count_Date: string;
  Book_Quantity: number;
  Physical_Quantity: number;
  Variance_Quantity: number;
  Variance_Value: number;
  Variance_Type: 'Zero Variance' | 'Negative Shrinkage' | 'Positive Found';
  Auditor_ID: string;
  Recount_Status: 'Resolved' | 'Pending Recount' | 'Confirmed WriteOff';
  Shift_ID: string;
}

export interface GRNRecord {
  GRN_ID: string;
  PO_ID: string;
  Hub_ID: string;
  Vendor_ID: string;
  Vendor_Name?: string;
  SKU_ID: string;
  Date: string;
  PO_Quantity: number;
  ASN_Quantity: number;
  Invoiced_Quantity: number;
  Physically_Received_Qty: number;
  Accepted_Quantity: number;
  Shortage_Quantity: number;
  Rejected_Damage_Qty: number;
  Shortage_Value: number;
  Damage_Value: number;
  QC_Status: 'Pass' | 'Partial Shortage' | 'Damaged Rejection' | 'QC Failed';
  Shift_ID: string;
}

export interface TransferRecord {
  Transfer_ID: string;
  Dispatch_Date: string;
  Hub_ID: string;
  Dark_Store_ID: string;
  SKU_ID: string;
  SKU_Name?: string;
  Dispatched_Qty: number;
  Received_Qty: number;
  In_Transit_Qty: number;
  Discrepancy_Qty: number;
  Discrepancy_Value: number;
  Transfer_Status: 'Delivered Reconciled' | 'Discrepancy Reported' | 'In Transit';
  Vehicle_Number: string;
  Shift_ID: string;
}

export interface DamageExpiryRecord {
  Incident_ID: string;
  Date: string;
  Hub_ID: string;
  SKU_ID: string;
  SKU_Name?: string;
  Category: string;
  Incident_Type: 'Physical Damage' | 'Expiry' | 'Near Expiry At Risk' | 'Spoilage' | 'Cold Chain Breach';
  Sub_Reason: string;
  Quantity: number;
  Loss_Value: number;
  Temperature_At_Detection?: number;
  Standard_Temp_Range?: string;
  Batch_Number: string;
  Expiry_Date: string;
  Days_Remaining_Shelf_Life: number;
  Action_Taken: 'Liquidated' | 'Scrapped' | 'Vendor Claimed' | 'Marked Down';
}

export interface RCATracker {
  RCA_ID: string;
  Loss_Event_ID: string;
  Hub_ID: string;
  Date_Opened: string;
  Target_Closure_Date: string;
  Root_Cause_Category:
    | 'Human Error'
    | 'Process Gap'
    | 'Cold Chain Failure'
    | 'Vendor Quality'
    | 'System Discrepancy'
    | 'Equipment Fault'
    | 'Security / Pilferage';
  Detailed_Problem_Statement: string;
  Five_Whys_Summary: string;
  Assigned_Owner: string;
  Status: 'Open' | 'In Progress' | 'Corrective Action Planned' | 'Validated & Closed';
  Corrective_Action: string;
  Preventative_Action: string;
  Validation_Evidence: string;
  Financial_Impact: number;
}

export interface VendorClaim {
  Claim_ID: string;
  Vendor_ID: string;
  Vendor_Name?: string;
  Hub_ID: string;
  PO_ID: string;
  GRN_ID: string;
  Claim_Date: string;
  Claim_Type: 'Inbound Shortage' | 'Inbound Damage' | 'Cold Chain Breach' | 'Quality Non-Compliance';
  Claimed_Amount: number;
  Approved_Amount: number;
  Rejected_Amount: number;
  Realized_Recovery: number;
  Pending_Recovery: number;
  Claim_Status: ClaimStatus;
  Settlement_Ref: string;
  SLA_Days: number;
  Ageing_Days: number;
}

export interface RecoveryTransaction {
  Recovery_ID: string;
  Claim_ID: string;
  Loss_Event_ID?: string;
  Date: string;
  Source: 'Vendor Debit Note' | 'Transporter Claim' | 'Insurance' | 'Salvage Sale';
  Amount_Recovered: number;
  Payment_Mode: 'Debit Note Adjustment' | 'Direct Transfer' | 'Salvage Auction';
  Reconciled_By: string;
  Status: 'Completed';
  Reference_Doc: string;
}

export interface ShiftData {
  Hub_ID: string;
  Shift_Date: string;
  Shift_ID: 'Shift 1 (06:00-14:00)' | 'Shift 2 (14:00-22:00)' | 'Shift 3 (22:00-06:00)';
  Supervisor: string;
  Total_Staff_Count: number;
  Units_Handled: number;
  Throughput_Value: number;
  Damage_Incidents: number;
  Discrepancy_Incidents: number;
  Total_Loss_Value: number;
  Loss_Per_10k_Units: number;
}

export interface AlertItem {
  Alert_ID: string;
  Timestamp: string;
  Severity: AlertSeverity;
  Alert_Type:
    | 'High-Value Inventory Variance'
    | 'Repeated SKU Shortage'
    | 'Unusual Manual Adjustment'
    | 'High Damage Rate'
    | 'Expiry Risk'
    | 'Transfer Reconciliation Delay'
    | 'Vendor Claim SLA Breach'
    | 'Temperature Excursion'
    | 'Unusual Shift-Level Loss Rate';
  Hub_ID: string;
  SKU_ID?: string;
  SKU_Name?: string;
  Process_Stage: ProcessStage;
  Reason: string;
  Financial_Exposure: number;
  Assigned_Owner: string;
  Status: AlertStatus;
  Due_Date: string;
  Investigation_Notes: string;
  Is_Read?: boolean;
}

export interface ActionItem {
  Action_ID: string;
  Problem: string;
  Root_Cause: string;
  Proposed_Action: string;
  Action_Owner: string;
  Hub_ID: string;
  Priority: 'Critical' | 'High' | 'Medium' | 'Low';
  Start_Date: string;
  Due_Date: string;
  Status: ActionStatus;
  Baseline_Loss_Rate: number;
  Current_Loss_Rate: number;
  Observed_Reduction: number;
  Validated_Avoided_Loss: number;
  Intervention_Cost: number;
  Verified_Net_Benefit: number;
  Evidence_Validation_Notes: string;
}

export interface TemperatureLog {
  Log_ID: string;
  Timestamp: string;
  Hub_ID: string;
  Zone_ID: string;
  Sensor_ID: string;
  Recorded_Temp_C: number;
  Min_Threshold_C: number;
  Max_Threshold_C: number;
  Excursion_Flag: boolean;
  Excursion_Duration_Mins: number;
  Action_Taken: string;
}

export interface InventoryMovement {
  Movement_ID: string;
  Timestamp: string;
  Hub_ID: string;
  SKU_ID: string;
  SKU_Name?: string;
  Movement_Type:
    | 'Inbound_GRN'
    | 'Putaway'
    | 'Pick_Dispatch'
    | 'Cycle_Adjustment'
    | 'Damage_WriteOff'
    | 'Expiry_WriteOff'
    | 'DS_Return';
  Quantity: number;
  Unit_Cost: number;
  Total_Value: number;
  Source_Zone: string;
  Destination_Zone: string;
  Performed_By: string;
  Shift_ID: string;
}

export interface InventorySnapshot {
  Snapshot_Date: string;
  Hub_ID: string;
  SKU_ID: string;
  SKU_Name?: string;
  Category: string;
  Closing_Book_Qty: number;
  Closing_Physical_Qty: number;
  Unit_Cost: number;
  Total_Inventory_Value: number;
  Inventory_Status: 'Normal' | 'Overstock' | 'Under-Audit' | 'Quarantine';
}

export interface KPIDaily {
  Date: string;
  Hub_ID: string;
  Gross_Loss: number;
  Realized_Recovery: number;
  Net_Loss: number;
  Handled_Throughput_Value: number;
  Loss_Rate_Pct: number;
  Shrinkage_Loss: number;
  Damage_Loss: number;
  Expiry_Loss: number;
  Inbound_Shortage_Loss: number;
  Transfer_Loss: number;
  Inventory_Accuracy_Pct: number;
  Open_Investigations_Count: number;
}

export interface DataDictionaryItem {
  Table_Name: string;
  Column_Name: string;
  Data_Type: string;
  Primary_Foreign_Key: string;
  Description: string;
  Business_Rule_Formula: string;
}

// Global Filter State:
export interface FilterState {
  hubId: string; // 'ALL' or specific Hub_ID
  dateRange: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    label: string;
  };
  region: string; // 'ALL' or 'North', 'South', 'West', 'East'
  category: string; // 'ALL' or category name
  skuSearch: string;
  process: string; // 'ALL' or ProcessStage
  shift: string; // 'ALL' or Shift_ID
  lossReason: string; // 'ALL' or LossCategory
  userRole: UserRole;
}

// Executive KPI Summary:
export interface ExecutiveKPISummary {
  totalGrossLoss: number;
  totalNetLoss: number;
  netLossPct: number;
  shrinkageLoss: number;
  damageLoss: number;
  expiryLoss: number;
  inboundShortageLoss: number;
  transferLoss: number;
  realizedRecovery: number;
  recoveryRatePct: number;
  inventoryAccuracyPct: number;
  highRiskSkusCount: number;
  openInvestigationsCount: number;
  preventedAvoidedLoss: number;
  momLossChangePct: number;
  // Comparative Prior Period Values:
  prevGrossLoss: number;
  prevNetLoss: number;
  prevRecovery: number;
  prevAccuracyPct: number;
  prevLossRatePct: number;
  throughputValue: number;
}
