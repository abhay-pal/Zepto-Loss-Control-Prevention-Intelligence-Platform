// Zepto Mother Hub - Deterministic Seeded Synthetic Data Generator
// Generates 3 months of fully reconciled operational quick-commerce data (Aug 1, 2026 - Oct 10, 2026)

import {
  INITIAL_HUBS,
  INITIAL_SKUS,
  INITIAL_VENDORS,
  ROOT_CAUSES_REF,
} from './initialData';
import {
  HubMaster,
  SKUMaster,
  VendorMaster,
  LossEvent,
  CycleCountRecord,
  GRNRecord,
  TransferRecord,
  DamageExpiryRecord,
  RCATracker,
  VendorClaim,
  RecoveryTransaction,
  ShiftData,
  AlertItem,
  ActionItem,
  KPIDaily,
  TemperatureLog,
  InventoryMovement,
  InventorySnapshot,
  LossCategory,
  ProcessStage,
} from '../types';

// Simple deterministic PRNG (Mulberry32)
class SeededRandom {
  private s: number;

  constructor(seed: number = 42892) {
    this.s = seed;
  }

  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  floatRange(min: number, max: number, decimals: number = 2): number {
    const val = min + this.next() * (max - min);
    return parseFloat(val.toFixed(decimals));
  }

  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  boolean(prob: number = 0.5): boolean {
    return this.next() < prob;
  }
}

export interface GeneratedDataPackage {
  hubs: HubMaster[];
  skus: SKUMaster[];
  vendors: VendorMaster[];
  lossEvents: LossEvent[];
  cycleCounts: CycleCountRecord[];
  grnRecords: GRNRecord[];
  transfers: TransferRecord[];
  damageExpiry: DamageExpiryRecord[];
  rcaRecords: RCATracker[];
  vendorClaims: VendorClaim[];
  recoveries: RecoveryTransaction[];
  shifts: ShiftData[];
  alerts: AlertItem[];
  actions: ActionItem[];
  kpiDaily: KPIDaily[];
  temperatureLogs: TemperatureLog[];
  inventoryMovements: InventoryMovement[];
  inventorySnapshots: InventorySnapshot[];
  meta: {
    startDate: string;
    endDate: string;
    generatedAt: string;
    seed: number;
    totalRecords: number;
  };
}

// Generate the 3-month dataset
export function generateSyntheticDataset(seed: number = 20261010): GeneratedDataPackage {
  const rng = new SeededRandom(seed);

  // Generate date list: 2026-08-01 to 2026-10-10 (71 days)
  const dates: string[] = [];
  const start = new Date(2026, 7, 1); // Aug 1, 2026
  const end = new Date(2026, 9, 10); // Oct 10, 2026
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }

  const hubs = [...INITIAL_HUBS];
  const skus = [...INITIAL_SKUS];
  const vendors = [...INITIAL_VENDORS];

  const shiftNames = [
    'Shift 1 (06:00-14:00)' as const,
    'Shift 2 (14:00-22:00)' as const,
    'Shift 3 (22:00-06:00)' as const,
  ];

  const lossEvents: LossEvent[] = [];
  const cycleCounts: CycleCountRecord[] = [];
  const grnRecords: GRNRecord[] = [];
  const transfers: TransferRecord[] = [];
  const damageExpiry: DamageExpiryRecord[] = [];
  const rcaRecords: RCATracker[] = [];
  const vendorClaims: VendorClaim[] = [];
  const recoveries: RecoveryTransaction[] = [];
  const shifts: ShiftData[] = [];
  const alerts: AlertItem[] = [];
  const kpiDaily: KPIDaily[] = [];
  const temperatureLogs: TemperatureLog[] = [];
  const inventoryMovements: InventoryMovement[] = [];
  const inventorySnapshots: InventorySnapshot[] = [];

  const lossTypes: { type: LossCategory; stage: ProcessStage; weight: number }[] = [
    { type: 'Unexplained Inventory Shrinkage', stage: 'Storage', weight: 22 },
    { type: 'Physical Damage', stage: 'Picking', weight: 20 },
    { type: 'Expiry', stage: 'Storage', weight: 15 },
    { type: 'Inbound Shortage', stage: 'Inbound', weight: 14 },
    { type: 'Dispatch / Transfer Shortage', stage: 'Dispatch', weight: 10 },
    { type: 'Temperature-Related Loss', stage: 'Storage', weight: 8 },
    { type: 'Putaway Discrepancy', stage: 'Putaway', weight: 5 },
    { type: 'Picking Errors', stage: 'Picking', weight: 3 },
    { type: 'Returns Discrepancy', stage: 'Returns', weight: 2 },
    { type: 'Spoilage', stage: 'Storage', weight: 1 },
  ];

  const owners = [
    'Rajesh Verma (Loss Prevention Lead)',
    'Anjali Sharma (Inventory Ops Lead)',
    'Kiran Reddy (Hub Ops Specialist)',
    'Pooja Nair (Quality & Compliance)',
    'Vikram Malhotra (Supply Chain Auditor)',
    'Sameer Joshi (Senior Manager - Loss Control)',
  ];

  let lossEventCounter = 10001;
  let cycleCountCounter = 20001;
  let grnCounter = 30001;
  let transferCounter = 40001;
  let damageCounter = 50001;
  let rcaCounter = 60001;
  let claimCounter = 70001;
  let recoveryCounter = 80001;
  let alertCounter = 90001;
  let movementCounter = 100001;
  let tempLogCounter = 500001;

  // Pre-seed baseline loss events per date
  dates.forEach((dateStr) => {
    // For each hub on each day
    hubs.forEach((hub) => {
      // Hub variation factor (MH-04 Kundli and MH-01 Bhiwandi have higher throughput & slight loss spikes)
      const hubFactor = hub.Hub_ID === 'MH-DEL-01' ? 1.25 : hub.Hub_ID === 'MH-MUM-01' ? 1.15 : hub.Hub_ID === 'MH-BLR-02' ? 0.8 : 1.0;

      // 3 shifts per hub per day
      shiftNames.forEach((shiftName) => {
        const staff = rng.range(22, 38);
        const unitsHandled = Math.round(rng.range(12000, 24000) * hubFactor);
        const throughputValue = unitsHandled * rng.range(85, 115);

        // Daily loss events for this shift
        const eventsCount = rng.range(1, 3);
        let shiftLossVal = 0;
        let shiftDamages = 0;
        let shiftDiscrepancies = 0;

        for (let e = 0; e < eventsCount; e++) {
          const ltypeObj = rng.pick(lossTypes);
          const sku = rng.pick(skus);
          const rootCause = rng.pick(ROOT_CAUSES_REF);
          const qtyLost = rng.range(2, sku.High_Value_Flag ? 12 : 45);
          const grossVal = qtyLost * sku.Cost_Price;

          // Recoverability depends on type (Inbound Shortage & Inbound Damage can be recovered from vendors)
          let recoverable = 0;
          let realizedRec = 0;

          if (ltypeObj.type === 'Inbound Shortage') {
            recoverable = Math.round(grossVal * 0.9);
            realizedRec = rng.boolean(0.7) ? Math.round(recoverable * rng.floatRange(0.6, 1.0)) : 0;
          } else if (ltypeObj.type === 'Physical Damage' && rng.boolean(0.4)) {
            recoverable = Math.round(grossVal * 0.5);
            realizedRec = rng.boolean(0.5) ? Math.round(recoverable * 0.7) : 0;
          } else if (ltypeObj.type === 'Dispatch / Transfer Shortage' && rng.boolean(0.3)) {
            recoverable = Math.round(grossVal * 0.4);
            realizedRec = rng.boolean(0.4) ? Math.round(recoverable * 0.5) : 0;
          }

          const netLoss = grossVal - realizedRec;
          shiftLossVal += netLoss;

          if (ltypeObj.type === 'Physical Damage') shiftDamages += qtyLost;
          if (ltypeObj.type === 'Unexplained Inventory Shrinkage' || ltypeObj.type === 'Inbound Shortage') {
            shiftDiscrepancies += qtyLost;
          }

          const eventId = `LE-${lossEventCounter++}`;
          let status: 'Confirmed' | 'Investigating' | 'RCA Completed' | 'Recovered' = 'Confirmed';
          if (grossVal > 2500 || sku.High_Value_Flag) {
            status = rng.pick(['Investigating', 'RCA Completed', 'Recovered']);
          }

          const lossEvt: LossEvent = {
            Loss_Event_ID: eventId,
            Occurrence_Date: dateStr,
            Detection_Date: dateStr,
            Posting_Date: dateStr,
            Hub_ID: hub.Hub_ID,
            SKU_ID: sku.SKU_ID,
            SKU_Name: sku.SKU_Name,
            Category: sku.Category,
            Loss_Type: ltypeObj.type,
            Process_Stage: ltypeObj.stage,
            Quantity_Lost: qtyLost,
            Unit_Cost: sku.Cost_Price,
            Gross_Loss_Value: grossVal,
            Recoverable_Amount: recoverable,
            Realized_Recovery: realizedRec,
            Net_Loss_Value: netLoss,
            Root_Cause_Code: rootCause.code,
            Root_Cause_Description: rootCause.desc,
            Storage_Zone: sku.Storage_Type === 'Chilled 2-8°C' ? 'Cold Room C-1' : sku.Storage_Type === 'Frozen -18°C' ? 'Deep Freeze F-1' : 'Ambient Bay A-3',
            Shift_ID: shiftName,
            Discovered_By: rng.pick(owners),
            Status: status,
          };

          lossEvents.push(lossEvt);

          // If significant, create an RCA Record
          if (grossVal > 3000 && rcaRecords.length < 280) {
            const rcaId = `RCA-${rcaCounter++}`;
            lossEvt.Investigation_ID = rcaId;
            rcaRecords.push({
              RCA_ID: rcaId,
              Loss_Event_ID: eventId,
              Hub_ID: hub.Hub_ID,
              Date_Opened: dateStr,
              Target_Closure_Date: dateStr,
              Root_Cause_Category: rootCause.category as any,
              Detailed_Problem_Statement: `High value discrepancy detected during ${ltypeObj.stage} operations. ${qtyLost} units of ${sku.SKU_Name} unaccounted.`,
              Five_Whys_Summary: `1. Physical count lower than system. 2. Pallet not staged at assigned bin. 3. Operator missed barcode scan. 4. High workload during peak dispatch. 5. Secondary verification bypassed.`,
              Assigned_Owner: rng.pick(owners),
              Status: rng.pick(['Open', 'In Progress', 'Corrective Action Planned', 'Validated & Closed']),
              Corrective_Action: 'Retrain shift picking marshals and enforce mandatory 2-stage scanning verification.',
              Preventative_Action: 'Install automated weight sensors on dispatch conveyer belts.',
              Validation_Evidence: 'Zero repeat discrepancies reported in subsequent 14 shifts.',
              Financial_Impact: grossVal,
            });
          }

          // If recoverable > 0, create Vendor Claim & Recovery Record
          if (recoverable > 500 && vendorClaims.length < 350) {
            const claimId = `CLM-${claimCounter++}`;
            const vendor = rng.pick(vendors);
            const claimStatus = realizedRec > 0 ? 'Debit Note Issued' : rng.pick(['Raised', 'Under Review', 'Approved', 'Rejected']);
            const approvedAmt = claimStatus === 'Rejected' ? 0 : recoverable;

            vendorClaims.push({
              Claim_ID: claimId,
              Vendor_ID: vendor.Vendor_ID,
              Vendor_Name: vendor.Vendor_Name,
              Hub_ID: hub.Hub_ID,
              PO_ID: `PO-2026-${rng.range(10000, 99999)}`,
              GRN_ID: `GRN-${grnCounter++}`,
              Claim_Date: dateStr,
              Claim_Type: ltypeObj.type === 'Inbound Shortage' ? 'Inbound Shortage' : 'Inbound Damage',
              Claimed_Amount: recoverable,
              Approved_Amount: approvedAmt,
              Rejected_Amount: claimStatus === 'Rejected' ? recoverable : 0,
              Realized_Recovery: realizedRec,
              Pending_Recovery: approvedAmt - realizedRec,
              Claim_Status: claimStatus as any,
              Settlement_Ref: realizedRec > 0 ? `DN-ADJ-2026-${rng.range(4000, 9999)}` : 'Pending Approval',
              SLA_Days: 14,
              Ageing_Days: rng.range(2, 28),
            });

            if (realizedRec > 0) {
              recoveries.push({
                Recovery_ID: `REC-${recoveryCounter++}`,
                Claim_ID: claimId,
                Loss_Event_ID: eventId,
                Date: dateStr,
                Source: 'Vendor Debit Note',
                Amount_Recovered: realizedRec,
                Payment_Mode: 'Debit Note Adjustment',
                Reconciled_By: 'Pooja Nair (Accounts Reconciler)',
                Status: 'Completed',
                Reference_Doc: `DN-ZEPTO-${rng.range(10000, 99999)}`,
              });
            }
          }
        }

        // Shift record
        shifts.push({
          Hub_ID: hub.Hub_ID,
          Shift_Date: dateStr,
          Shift_ID: shiftName,
          Supervisor: rng.pick(['Anil Sharma', 'Ritu Saxena', 'Karan Johal', 'Manoj Gowda', 'S. Narayanan']),
          Total_Staff_Count: staff,
          Units_Handled: unitsHandled,
          Throughput_Value: throughputValue,
          Damage_Incidents: shiftDamages,
          Discrepancy_Incidents: shiftDiscrepancies,
          Total_Loss_Value: shiftLossVal,
          Loss_Per_10k_Units: parseFloat(((shiftLossVal / (unitsHandled || 1)) * 10000).toFixed(2)),
        });
      });

      // Daily GRN sample record
      const grnVendor = rng.pick(vendors);
      const grnSku = rng.pick(skus);
      const poQty = rng.range(200, 1500);
      const isShort = rng.boolean(0.2);
      const shortQty = isShort ? rng.range(5, 35) : 0;
      const recQty = poQty - shortQty;
      const dmgQty = rng.boolean(0.12) ? rng.range(2, 12) : 0;
      const acceptedQty = recQty - dmgQty;

      grnRecords.push({
        GRN_ID: `GRN-${grnCounter++}`,
        PO_ID: `PO-2026-${rng.range(10000, 99999)}`,
        Hub_ID: hub.Hub_ID,
        Vendor_ID: grnVendor.Vendor_ID,
        Vendor_Name: grnVendor.Vendor_Name,
        SKU_ID: grnSku.SKU_ID,
        Date: dateStr,
        PO_Quantity: poQty,
        ASN_Quantity: poQty,
        Invoiced_Quantity: poQty,
        Physically_Received_Qty: recQty,
        Accepted_Quantity: acceptedQty,
        Shortage_Quantity: shortQty,
        Rejected_Damage_Qty: dmgQty,
        Shortage_Value: shortQty * grnSku.Cost_Price,
        Damage_Value: dmgQty * grnSku.Cost_Price,
        QC_Status: dmgQty > 0 ? 'Damaged Rejection' : shortQty > 0 ? 'Partial Shortage' : 'Pass',
        Shift_ID: 'Shift 1 (06:00-14:00)',
      });

      // Daily Transfer record to Dark Store
      const trfSku = rng.pick(skus);
      const dispQty = rng.range(50, 400);
      const hasDiscrepancy = rng.boolean(0.15);
      const discQty = hasDiscrepancy ? rng.range(1, 6) : 0;

      transfers.push({
        Transfer_ID: `TRF-${transferCounter++}`,
        Dispatch_Date: dateStr,
        Hub_ID: hub.Hub_ID,
        Dark_Store_ID: `DS-${hub.Hub_ID.split('-')[1]}-${rng.range(1, 12).toString().padStart(2, '0')}`,
        SKU_ID: trfSku.SKU_ID,
        SKU_Name: trfSku.SKU_Name,
        Dispatched_Qty: dispQty,
        Received_Qty: dispQty - discQty,
        In_Transit_Qty: 0,
        Discrepancy_Qty: discQty,
        Discrepancy_Value: discQty * trfSku.Cost_Price,
        Transfer_Status: hasDiscrepancy ? 'Discrepancy Reported' : 'Delivered Reconciled',
        Vehicle_Number: `MH-${rng.range(10, 48)}-E-${rng.range(1000, 9999)}`,
        Shift_ID: 'Shift 2 (14:00-22:00)',
      });

      // Daily Cycle Count record
      const ccSku = rng.pick(skus);
      const bookQty = rng.range(120, 800);
      const isVariance = rng.boolean(0.25);
      const varQty = isVariance ? (rng.boolean(0.8) ? -rng.range(1, 8) : rng.range(1, 4)) : 0;
      const physQty = bookQty + varQty;

      cycleCounts.push({
        Count_ID: `CC-${cycleCountCounter++}`,
        Hub_ID: hub.Hub_ID,
        Zone_ID: ccSku.Storage_Type === 'Chilled 2-8°C' ? 'Zone-C (Cold)' : 'Zone-A (Ambient)',
        SKU_ID: ccSku.SKU_ID,
        SKU_Name: ccSku.SKU_Name,
        Count_Date: dateStr,
        Book_Quantity: bookQty,
        Physical_Quantity: physQty,
        Variance_Quantity: varQty,
        Variance_Value: Math.abs(varQty) * ccSku.Cost_Price,
        Variance_Type: varQty < 0 ? 'Negative Shrinkage' : varQty > 0 ? 'Positive Found' : 'Zero Variance',
        Auditor_ID: rng.pick(['AUD-01 (Rajesh)', 'AUD-02 (Kiran)', 'AUD-03 (Pooja)']),
        Recount_Status: varQty !== 0 ? (rng.boolean(0.7) ? 'Resolved' : 'Confirmed WriteOff') : 'Resolved',
        Shift_ID: 'Shift 3 (22:00-06:00)',
      });

      // Damage & Expiry Record
      const expSku = rng.pick(skus.filter((s) => s.Shelf_Life_Days <= 14));
      if (expSku && rng.boolean(0.65)) {
        const isExp = rng.boolean(0.4);
        const qty = rng.range(3, 18);
        damageExpiry.push({
          Incident_ID: `DE-${damageCounter++}`,
          Date: dateStr,
          Hub_ID: hub.Hub_ID,
          SKU_ID: expSku.SKU_ID,
          SKU_Name: expSku.SKU_Name,
          Category: expSku.Category,
          Incident_Type: isExp ? 'Expiry' : 'Near Expiry At Risk',
          Sub_Reason: isExp ? 'FEFO Non-Compliance' : 'Handling Drop',
          Quantity: qty,
          Loss_Value: qty * expSku.Cost_Price,
          Temperature_At_Detection: expSku.Storage_Type.includes('Chilled') ? rng.floatRange(4.0, 9.5, 1) : undefined,
          Standard_Temp_Range: expSku.Storage_Type,
          Batch_Number: `B-${dateStr.replace(/-/g, '')}-${rng.range(10, 99)}`,
          Expiry_Date: dateStr,
          Days_Remaining_Shelf_Life: isExp ? 0 : rng.range(1, 3),
          Action_Taken: isExp ? 'Scrapped' : 'Liquidated',
        });
      }

      // Inventory movement log
      inventoryMovements.push({
        Movement_ID: `MOV-${movementCounter++}`,
        Timestamp: `${dateStr} 11:30:00`,
        Hub_ID: hub.Hub_ID,
        SKU_ID: ccSku.SKU_ID,
        SKU_Name: ccSku.SKU_Name,
        Movement_Type: 'Putaway',
        Quantity: rng.range(20, 200),
        Unit_Cost: ccSku.Cost_Price,
        Total_Value: rng.range(20, 200) * ccSku.Cost_Price,
        Source_Zone: 'Inbound Dock',
        Destination_Zone: 'Zone-A Racks',
        Performed_By: 'Operator Ravi K.',
        Shift_ID: 'Shift 1 (06:00-14:00)',
      });

      // Temperature sensor log (sample 2 records per hub per day)
      temperatureLogs.push(
        {
          Log_ID: `TMP-${tempLogCounter++}`,
          Timestamp: `${dateStr} 04:00:00`,
          Hub_ID: hub.Hub_ID,
          Zone_ID: 'Zone-C Chilled Room',
          Sensor_ID: `SENS-${hub.Hub_ID}-C1`,
          Recorded_Temp_C: rng.floatRange(3.2, 5.8, 1),
          Min_Threshold_C: 2.0,
          Max_Threshold_C: 8.0,
          Excursion_Flag: false,
          Excursion_Duration_Mins: 0,
          Action_Taken: 'Normal Reading',
        },
        {
          Log_ID: `TMP-${tempLogCounter++}`,
          Timestamp: `${dateStr} 16:30:00`,
          Hub_ID: hub.Hub_ID,
          Zone_ID: 'Zone-F Deep Freeze',
          Sensor_ID: `SENS-${hub.Hub_ID}-F1`,
          Recorded_Temp_C: rng.floatRange(-21.5, -17.2, 1),
          Min_Threshold_C: -24.0,
          Max_Threshold_C: -16.0,
          Excursion_Flag: false,
          Excursion_Duration_Mins: 0,
          Action_Taken: 'Normal Reading',
        }
      );
    });
  });

  // Inject a few realistic Cold Chain Temperature Excursions in Dairy & Frozen
  const coldHubs = ['MH-DEL-01', 'MH-MUM-01', 'MH-BLR-01'];
  coldHubs.forEach((hubId, idx) => {
    const excDate = dates[20 + idx * 15];
    temperatureLogs.push({
      Log_ID: `TMP-EXC-${100 + idx}`,
      Timestamp: `${excDate} 02:15:00`,
      Hub_ID: hubId,
      Zone_ID: 'Zone-C Chilled Room',
      Sensor_ID: `SENS-${hubId}-C1`,
      Recorded_Temp_C: 12.8,
      Min_Threshold_C: 2.0,
      Max_Threshold_C: 8.0,
      Excursion_Flag: true,
      Excursion_Duration_Mins: 85,
      Action_Taken: 'Secondary compressor activated; 140 Dairy units quarantined and inspected.',
    });
  });

  // Calculate Daily Reconciled KPI table for each Hub and Date
  dates.forEach((dateStr) => {
    hubs.forEach((hub) => {
      const hubEvts = lossEvents.filter((e) => e.Occurrence_Date === dateStr && e.Hub_ID === hub.Hub_ID);
      const gross = hubEvts.reduce((sum, e) => sum + e.Gross_Loss_Value, 0);
      const recovery = hubEvts.reduce((sum, e) => sum + e.Realized_Recovery, 0);
      const net = gross - recovery;

      const shrink = hubEvts.filter((e) => e.Loss_Type === 'Unexplained Inventory Shrinkage').reduce((sum, e) => sum + e.Gross_Loss_Value, 0);
      const dmg = hubEvts.filter((e) => e.Loss_Type === 'Physical Damage').reduce((sum, e) => sum + e.Gross_Loss_Value, 0);
      const exp = hubEvts.filter((e) => e.Loss_Type === 'Expiry' || e.Loss_Type === 'Temperature-Related Loss').reduce((sum, e) => sum + e.Gross_Loss_Value, 0);
      const inShort = hubEvts.filter((e) => e.Loss_Type === 'Inbound Shortage').reduce((sum, e) => sum + e.Gross_Loss_Value, 0);
      const trf = hubEvts.filter((e) => e.Loss_Type === 'Dispatch / Transfer Shortage').reduce((sum, e) => sum + e.Gross_Loss_Value, 0);

      const dailyThroughput = rng.range(3800000, 6200000);
      const lossRate = parseFloat(((net / dailyThroughput) * 100).toFixed(3));
      const accuracy = parseFloat((99.1 - lossRate * 0.4).toFixed(2));

      kpiDaily.push({
        Date: dateStr,
        Hub_ID: hub.Hub_ID,
        Gross_Loss: gross,
        Realized_Recovery: recovery,
        Net_Loss: net,
        Handled_Throughput_Value: dailyThroughput,
        Loss_Rate_Pct: lossRate,
        Shrinkage_Loss: shrink,
        Damage_Loss: dmg,
        Expiry_Loss: exp,
        Inbound_Shortage_Loss: inShort,
        Transfer_Loss: trf,
        Inventory_Accuracy_Pct: accuracy,
        Open_Investigations_Count: hubEvts.filter((e) => e.Status === 'Investigating').length,
      });
    });
  });

  // Alerts & Investigation Cases
  const alertTypesList = [
    { type: 'High-Value Inventory Variance', stage: 'Storage', sev: 'Critical' as const, reason: 'Negative cycle count variance exceeded ₹10,000 threshold on premium SKU.' },
    { type: 'High Damage Rate', stage: 'Picking', sev: 'High' as const, reason: 'Handling drop damage breached 0.6% rate in Evening Shift.' },
    { type: 'Temperature Excursion', stage: 'Storage', sev: 'Critical' as const, reason: 'Zone-C chilled anteroom temperature reached 12.8°C for 85 mins.' },
    { type: 'Vendor Claim SLA Breach', stage: 'Inbound', sev: 'Medium' as const, reason: 'Vendor Claim for Inbound Shortage pending response past 14 days SLA.' },
    { type: 'Transfer Reconciliation Delay', stage: 'Transfer', sev: 'High' as const, reason: 'Dark Store DS-DEL-04 unacknowledged transfer discrepancy of ₹4,800.' },
    { type: 'Repeated SKU Shortage', stage: 'Inbound', sev: 'High' as const, reason: 'Vendor FarmFresh Agro repeated 3 consecutive short deliveries on Tomato.' },
    { type: 'Expiry Risk', stage: 'Storage', sev: 'Medium' as const, reason: '68 units of Greek Yogurt approaching expiry within 48 hours.' },
    { type: 'Unusual Shift-Level Loss Rate', stage: 'Picking', sev: 'High' as const, reason: 'Night shift (Shift 3) loss rate spiked to 0.78% vs hub average 0.42%.' },
  ];

  alertTypesList.forEach((aItem, idx) => {
    const hub = hubs[idx % hubs.length];
    const sku = skus[idx % skus.length];
    const alertDate = dates[dates.length - 1 - idx * 3];

    alerts.push({
      Alert_ID: `ALT-${alertCounter++}`,
      Timestamp: `${alertDate} 08:30:00`,
      Severity: aItem.sev,
      Alert_Type: aItem.type as any,
      Hub_ID: hub.Hub_ID,
      SKU_ID: sku.SKU_ID,
      SKU_Name: sku.SKU_Name,
      Process_Stage: aItem.stage as ProcessStage,
      Reason: aItem.reason,
      Financial_Exposure: rng.range(3500, 28000),
      Assigned_Owner: rng.pick(owners),
      Status: idx < 3 ? 'Investigating' : idx < 6 ? 'New' : 'Validated',
      Due_Date: dates[dates.length - 1],
      Investigation_Notes: 'Root cause analysis in progress with shift supervisor. Staging video logs requested.',
      Is_Read: idx > 2,
    });
  });

  // Action Tracker & Verified Savings (Interventions with quantified financial results)
  const sampleActions: ActionItem[] = [
    {
      Action_ID: 'ACT-001',
      Problem: 'Frequent carton puncture and crushing of Tetra pack milks during multi-SKU picking.',
      Root_Cause: 'Pickers stacking heavy oil cans and atta bags on top of dairy cartons in loose totes.',
      Proposed_Action: 'Enforce heavy-first pick path sequence logic in Picker RF Scanner app + tote dividers.',
      Action_Owner: 'Rajesh Verma (Loss Prevention Lead)',
      Hub_ID: 'MH-MUM-01',
      Priority: 'High',
      Start_Date: '2026-08-10',
      Due_Date: '2026-09-15',
      Status: 'Validated',
      Baseline_Loss_Rate: 0.62,
      Current_Loss_Rate: 0.28,
      Observed_Reduction: 54.8,
      Validated_Avoided_Loss: 384500,
      Intervention_Cost: 35000,
      Verified_Net_Benefit: 349500,
      Evidence_Validation_Notes: 'Audited 45 picking shifts post-deployment. Crushed packaging write-offs reduced from ₹12.8k/day to ₹3.8k/day.',
    },
    {
      Action_ID: 'ACT-002',
      Problem: 'Recurring FEFO expiry loss in short shelf-life fresh paneer and bakery loaves.',
      Root_Cause: 'Putaway staff pushing fresh stock to the front of racks, trapping older batches behind.',
      Proposed_Action: 'Implement physical gravity flow racking for dairy bins + strict barcode expiry sequence check.',
      Action_Owner: 'Anjali Sharma (Inventory Ops Lead)',
      Hub_ID: 'MH-BLR-01',
      Priority: 'Critical',
      Start_Date: '2026-08-15',
      Due_Date: '2026-09-30',
      Status: 'Validated',
      Baseline_Loss_Rate: 0.58,
      Current_Loss_Rate: 0.22,
      Observed_Reduction: 62.0,
      Validated_Avoided_Loss: 492000,
      Intervention_Cost: 80000,
      Verified_Net_Benefit: 412000,
      Evidence_Validation_Notes: 'Physical audit of 120 rack bays showed 100% adherence to FEFO pick order. Expiry disposal dropped by 62%.',
    },
    {
      Action_ID: 'ACT-003',
      Problem: 'Dark Store transfer shortages caused by loose tote tampering during van transit.',
      Root_Cause: 'Unsealed plastic crates transported without tamper-evident serialized zip tags.',
      Proposed_Action: 'Mandatory serialized barcoded security zip-ties on all high-value outbound crates.',
      Action_Owner: 'Kiran Reddy (Hub Ops Specialist)',
      Hub_ID: 'MH-DEL-01',
      Priority: 'High',
      Start_Date: '2026-08-25',
      Due_Date: '2026-10-05',
      Status: 'Completed',
      Baseline_Loss_Rate: 0.44,
      Current_Loss_Rate: 0.16,
      Observed_Reduction: 63.6,
      Validated_Avoided_Loss: 295000,
      Intervention_Cost: 22000,
      Verified_Net_Benefit: 273000,
      Evidence_Validation_Notes: 'Transit pilferage and transit claims dropped by 78% across 15 Kundli dark store feeder routes.',
    },
    {
      Action_ID: 'ACT-004',
      Problem: 'Chilled anteroom temperature fluctuations exceeding 8°C during night shift replenishment.',
      Root_Cause: 'High speed roller door open sensor bypass by night shift dock operators.',
      Proposed_Action: 'Install automated audible alarm strobe when cold room door remains open > 45 seconds.',
      Action_Owner: 'Sameer Joshi (Senior Manager - Loss Control)',
      Hub_ID: 'MH-DEL-01',
      Priority: 'Critical',
      Start_Date: '2026-09-01',
      Due_Date: '2026-09-20',
      Status: 'Validated',
      Baseline_Loss_Rate: 0.51,
      Current_Loss_Rate: 0.19,
      Observed_Reduction: 62.7,
      Validated_Avoided_Loss: 310000,
      Intervention_Cost: 18000,
      Verified_Net_Benefit: 292000,
      Evidence_Validation_Notes: 'Zero cold chain temperature excursion incidents logged in September 2026 post alarm installation.',
    },
    {
      Action_ID: 'ACT-005',
      Problem: 'Vendor inbound short delivery slippage unflagged at physical unloading dock.',
      Root_Cause: 'GRN operators doing sample counts rather than 100% piece counts on high value cartons.',
      Proposed_Action: 'Implement mandatory dock weight scale check against ASN gross weight before GRN signoff.',
      Action_Owner: 'Vikram Malhotra (Supply Chain Auditor)',
      Hub_ID: 'MH-HYD-01',
      Priority: 'Medium',
      Start_Date: '2026-09-10',
      Due_Date: '2026-10-15',
      Status: 'In Progress',
      Baseline_Loss_Rate: 0.39,
      Current_Loss_Rate: 0.24,
      Observed_Reduction: 38.5,
      Validated_Avoided_Loss: 145000,
      Intervention_Cost: 15000,
      Verified_Net_Benefit: 130000,
      Evidence_Validation_Notes: 'Pilot active on Dock 2 & 3. Recovered ₹42,000 in short deliveries in first 2 weeks.',
    },
    {
      Action_ID: 'ACT-006',
      Problem: 'Shrinkage in imported chocolates and personal care blade packs in open bin mezzanine.',
      Root_Cause: 'High-value items stored in open accessible bins without RFID or caged access control.',
      Proposed_Action: 'Construct High-Value Secure Cage (HVC) with biometric access and dual-custody sign-in.',
      Action_Owner: 'Rajesh Verma (Loss Prevention Lead)',
      Hub_ID: 'MH-BLR-02',
      Priority: 'High',
      Start_Date: '2026-09-15',
      Due_Date: '2026-10-25',
      Status: 'In Progress',
      Baseline_Loss_Rate: 0.42,
      Current_Loss_Rate: 0.25,
      Observed_Reduction: 40.5,
      Validated_Avoided_Loss: 180000,
      Intervention_Cost: 65000,
      Verified_Net_Benefit: 115000,
      Evidence_Validation_Notes: 'Physical enclosure completed. Lock system operational, training underway.',
    },
  ];

  // Inventory Snapshots (end of current period)
  skus.forEach((sku) => {
    hubs.forEach((hub) => {
      const bookQty = rng.range(80, 1200);
      const isAudited = rng.boolean(0.2);
      const physQty = isAudited ? bookQty - rng.range(0, 4) : bookQty;
      inventorySnapshots.push({
        Snapshot_Date: dates[dates.length - 1],
        Hub_ID: hub.Hub_ID,
        SKU_ID: sku.SKU_ID,
        SKU_Name: sku.SKU_Name,
        Category: sku.Category,
        Closing_Book_Qty: bookQty,
        Closing_Physical_Qty: physQty,
        Unit_Cost: sku.Cost_Price,
        Total_Inventory_Value: bookQty * sku.Cost_Price,
        Inventory_Status: 'Normal',
      });
    });
  });

  const totalRecords =
    hubs.length +
    skus.length +
    vendors.length +
    lossEvents.length +
    cycleCounts.length +
    grnRecords.length +
    transfers.length +
    damageExpiry.length +
    rcaRecords.length +
    vendorClaims.length +
    recoveries.length +
    shifts.length +
    alerts.length +
    sampleActions.length +
    kpiDaily.length +
    temperatureLogs.length +
    inventoryMovements.length +
    inventorySnapshots.length;

  return {
    hubs,
    skus,
    vendors,
    lossEvents,
    cycleCounts,
    grnRecords,
    transfers,
    damageExpiry,
    rcaRecords,
    vendorClaims,
    recoveries,
    shifts,
    alerts,
    actions: sampleActions,
    kpiDaily,
    temperatureLogs,
    inventoryMovements,
    inventorySnapshots,
    meta: {
      startDate: dates[0],
      endDate: dates[dates.length - 1],
      generatedAt: new Date().toISOString(),
      seed,
      totalRecords,
    },
  };
}
