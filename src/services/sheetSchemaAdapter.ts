// Maps the existing Google Sheets snake_case schema into dashboard models.
// Missing measurements remain zero/empty; no synthetic financial values are invented.
const num = (v: unknown) => Number(v) || 0;
const str = (v: unknown) => v == null ? '' : String(v);
export function normalizeSheetRows(sheet: string, rows: Record<string, any>[]): any[] {
  const k = (r: Record<string, any>, name: string) => r[name];
  return rows.map(r => {
    switch (sheet) {
      case 'Hub_Master': return { ...r, Hub_ID:str(k(r,'hub_id')),Hub_Name:str(k(r,'hub_name')),City:str(k(r,'city')),Region:str(k(r,'region')),Status:str(k(r,'status')) };
      case 'SKU_Master': return {...r,SKU_ID:str(r.sku_id),SKU_Name:str(r.sku_name),Category:str(r.category),Cost_Price:num(r.unit_cost_inr),Selling_Price:num(r.mrp_inr),Shelf_Life_Days:num(r.shelf_life_days)};
      case 'Vendor_Master': return {...r,Vendor_ID:str(r.vendor_id),Vendor_Name:str(r.vendor_name),Category_Supplied:str(r.category),Status:str(r.status)};
      case 'Loss_Events': return {...r,Loss_Event_ID:str(r.loss_event_id),Occurrence_Date:str(r.event_date),Detection_Date:str(r.event_date),Posting_Date:str(r.event_date),Hub_ID:str(r.hub_id),SKU_ID:str(r.sku_id),Category:str(r.loss_category),Loss_Type:str(r.loss_category),Process_Stage:str(r.process_stage),Quantity_Lost:num(r.quantity),Unit_Cost:num(r.unit_cost_inr),Gross_Loss_Value:num(r.gross_loss_inr),Realized_Recovery:0,Recoverable_Amount:0,Net_Loss_Value:num(r.gross_loss_inr),Status:str(r.status)};
      case 'Cycle_Count': return {...r,Count_ID:str(r.count_id),Count_Date:str(r.event_date),Hub_ID:str(r.hub_id),SKU_ID:str(r.sku_id),Book_Quantity:num(r.book_qty),Physical_Quantity:num(r.physical_qty),Variance_Quantity:num(r.variance_qty),Variance_Value:0,Recount_Status:str(r.status)};
      case 'GRN_Data': return {...r,GRN_ID:str(r.grn_id),Date:str(r.event_date),Hub_ID:str(r.hub_id),Vendor_ID:str(r.vendor_id),SKU_ID:str(r.sku_id),Invoiced_Quantity:num(r.invoiced_qty),Physically_Received_Qty:num(r.received_qty),Accepted_Quantity:num(r.accepted_qty),Rejected_Damage_Qty:num(r.rejected_qty),Shortage_Quantity:Math.max(0,num(r.invoiced_qty)-num(r.received_qty))};
      case 'Transfer_Data': return {...r,Transfer_ID:str(r.transfer_id),Dispatch_Date:str(r.event_date),Hub_ID:str(r.source_hub),Dark_Store_ID:str(r.destination_store),SKU_ID:str(r.sku_id),Dispatched_Qty:num(r.dispatched_qty),Received_Qty:num(r.received_qty),In_Transit_Qty:num(r.pending_qty),Discrepancy_Qty:num(r.pending_qty)};
      case 'Damage_Expiry': return {...r,Incident_ID:str(r.event_id),Date:str(r.event_date),Hub_ID:str(r.hub_id),SKU_ID:str(r.sku_id),Incident_Type:str(r.reason),Sub_Reason:str(r.reason),Quantity:num(r.quantity),Batch_Number:str(r.batch_id)};
      case 'RCA_Tracker': return {...r,RCA_ID:str(r.incident_id),Loss_Event_ID:str(r.loss_event_id),Root_Cause_Category:str(r.root_cause),Assigned_Owner:str(r.owner),Status:str(r.status),Target_Closure_Date:str(r.due_date),Corrective_Action:str(r.corrective_action)};
      case 'Vendor_Claims': return {...r,Claim_ID:str(r.claim_id),Vendor_ID:str(r.vendor_id),Claimed_Amount:num(r.claim_amount_inr),Approved_Amount:num(r.approved_amount_inr),Claim_Status:str(r.status),Loss_Event_ID:str(r.loss_event_id)};
      case 'Recovery_Data': return {...r,Recovery_ID:str(r.recovery_id),Claim_ID:str(r.claim_id),Loss_Event_ID:str(r.loss_event_id),Date:str(r.recovery_date),Amount_Recovered:num(r.amount_inr),Reference_Doc:str(r.settlement_reference),Status:'Completed'};
      case 'Shift_Data': return {...r,Shift_ID:str(r.shift),Shift_Date:str(r.event_date),Hub_ID:str(r.hub_id),Units_Handled:num(r.handled_units),Total_Staff_Count:num(r.staff_count)};
      case 'Alert_Tracker': return {...r,Alert_ID:str(r.alert_id),Loss_Event_ID:str(r.loss_event_id),Severity:str(r.severity),Alert_Type:str(r.alert_type),Status:str(r.status),Assigned_Owner:str(r.owner)};
      case 'Action_Tracker': return {...r,Action_ID:str(r.action_id),RCA_ID:str(r.incident_id),Proposed_Action:str(r.action),Action_Owner:str(r.owner),Status:str(r.status),Due_Date:str(r.due_date),Validated_Avoided_Loss:num(r.validated_savings_inr)};
      case 'KPI_Daily': return {...r,Date:str(r.event_date),Hub_ID:str(r.hub_id),Gross_Loss:num(r.gross_loss_inr),Realized_Recovery:num(r.realized_recovery_inr),Net_Loss:num(r.net_loss_inr),Handled_Throughput_Value:0,Loss_Rate_Pct:0};
      case 'Inventory_Movement': return {...r,Movement_ID:str(r.movement_id),Timestamp:str(r.event_date),Hub_ID:str(r.hub_id),SKU_ID:str(r.sku_id),Movement_Type:str(r.movement_type),Quantity:num(r.quantity),Unit_Cost:num(r.unit_cost_inr),Total_Value:num(r.quantity)*num(r.unit_cost_inr)};
      default: return r;
    }
  });
}
