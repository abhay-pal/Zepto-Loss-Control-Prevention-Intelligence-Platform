# Google Apps Script Deployment Guide for Zepto Loss Control Platform

This guide explains how to connect the **Zepto Mother Hub – Loss Control & Prevention Intelligence Platform** directly to your Google Sheets database (`1IYy3751gYVVxmqI5J_1EAVV3ym1hqxd9T3EFpXOaU9Q`).

---

## 1. Why Update the Existing Apps Script?

When querying the current Web App URL (`AKfycbwD1GlaDptr-y7Js42wLAF-t3ZOxgif_OPBrCV4SA_P-vEVFfHFSVo-E7xI9RGzpLPrlw`), Google redirects unauthenticated cross-origin web requests to the Google Accounts sign-in screen (`accounts.google.com/v3/signin`). 

To allow the React Dashboard to query and update the spreadsheet via JSON API, the Apps Script must be deployed with:
- **Execute as**: `Me (your Google account)`
- **Who has access**: `Anyone` (or an authenticated backend proxy).

---

## 2. Step-by-Step Deployment

1. Open your Google Spreadsheet:
   `https://docs.google.com/spreadsheets/d/1IYy3751gYVVxmqI5J_1EAVV3ym1hqxd9T3EFpXOaU9Q/edit`
2. In the top menu, click **Extensions** > **Apps Script**.
3. Replace the contents of `Code.gs` with the updated code provided in `google_apps_script/Code.gs`.
4. In the left panel, click **Project Settings** (gear icon) and check **"Show 'appsscript.json' manifest file in editor"**.
5. Switch to `appsscript.json` and ensure `"access": "ANYONE"` is set.
6. Click **Deploy** > **Manage deployments** > **Edit** (pencil icon).
7. Select **Version: New version**, and confirm:
   - **Execute as:** Me
   - **Who has access:** Anyone
8. Click **Deploy**.
9. Copy the **Web app URL** (ending in `/exec`).
10. Open the dashboard's **Settings & Data Management** tab and paste your new Web App URL into the **Google Apps Script Web App URL** input. Click **"Test Connection"** and **"Save & Sync"**.

---

## 3. Supported API Endpoints

### `GET ?action=ping`
Health check and returns sheet metadata, row counts, and API version.

### `GET ?action=getKPISummary`
Computes executive aggregated KPIs server-side in Google Sheets:
- Total Gross Loss
- Realized Recovery
- Net Loss
- Loss Rate %
- Shrinkage, Damage, Expiry, Shortage, and Transfer breakdowns

### `GET ?action=getData&sheet={SheetName}&page={1}&limit={50}&hub={HubID}&category={Category}&search={Query}`
Returns paginated, filtered rows from any sheet (`Hub_Master`, `Loss_Events`, `Cycle_Count`, `Vendor_Claims`, etc.).

### `POST { action: "updateRecord", sheet: "Alert_Tracker", idColumn: "Alert_ID", idValue: "ALT-90001", data: { Status: "Closed" } }`
Updates rows in real-time in Google Sheets.

---

## 4. Automatic Fallback Architecture

If the Google Apps Script endpoint is temporarily offline, cold-starting, or awaiting deployment permissions, the platform automatically activates the **Deterministic Seeded Synthetic Data Engine**. 

This engine:
- Generates 3 full months of identical, reconciled operational data.
- Stores user edits (RCA statuses, Alert assignments, Action savings updates) in local browser storage.
- Ensures 100% zero downtime and full drill-down functionality at all times.
