// Zepto Mother Hub - Google Apps Script & Sheets API Service Layer
// Connects React Frontend to Google Sheets database with caching and fallback

import { ExecutiveKPISummary } from '../types';

export const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbwD1GlaDptr-y7Js42wLAF-t3ZOxgif_OPBrCV4SA_P-vEVFfHFSVo-E7xI9RGzpLPrlw/exec';
export const SPREADSHEET_ID = '1IYy3751gYVVxmqI5J_1EAVV3ym1hqxd9T3EFpXOaU9Q';

export interface ApiStatus {
  mode: 'google_sheets' | 'synthetic_engine';
  isOnline: boolean;
  isTesting: boolean;
  endpointUrl: string;
  spreadsheetId: string;
  lastChecked: string;
  errorMessage?: string;
  serverMessage?: string;
  availableSheetsCount?: number;
}

class GoogleSheetsApiService {
  private endpoint: string;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private cacheTTL: number = 30000; // 30s cache

  constructor() {
    this.endpoint = localStorage.getItem('zepto_gas_url') || DEFAULT_GAS_URL;
  }

  public getEndpoint(): string {
    return this.endpoint;
  }

  public setEndpoint(url: string): void {
    this.endpoint = url;
    localStorage.setItem('zepto_gas_url', url);
    this.cache.clear();
  }

  /**
   * Test API connectivity to Google Apps Script endpoint
   */
  public async testConnection(customUrl?: string): Promise<{
    success: boolean;
    message: string;
    sheets?: { name: string; rows: number; cols: number }[];
  }> {
    const targetUrl = customUrl || this.endpoint;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(`${targetUrl}?action=ping&t=${Date.now()}`, {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return {
          success: false,
          message:
            'Received HTML response from Google Apps Script. This happens when the Web App requires Google Account Sign-In or is not deployed with "Access: Anyone". Using local high-fidelity synthetic engine.',
        };
      }

      const json = await res.json();
      if (json && json.success) {
        return {
          success: true,
          message: json.message || 'Connected to Google Sheets Database successfully',
          sheets: json.availableSheets || [],
        };
      } else {
        return {
          success: false,
          message: json.error || 'Endpoint returned unsuccessful status',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message:
          err.name === 'AbortError'
            ? 'Connection timed out (7s). Using local synthetic intelligence engine.'
            : `Unable to reach Google Apps Script: ${err.message}. Defaulting to local synthetic engine.`,
      };
    }
  }

  /**
   * Fetch pre-aggregated KPI metrics from Google Sheets
   */
  public async fetchKPISummary(): Promise<ExecutiveKPISummary | null> {
    const cacheKey = 'kpi_summary';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${this.endpoint}?action=getKPISummary&t=${Date.now()}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;

      const data = await res.json();
      if (data && data.success && data.summary) {
        this.setCached(cacheKey, data.summary);
        return data.summary;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Query sheet data with pagination, search, and filtering
   */
  public async fetchSheetData(
    sheetName: string,
    params: {
      hub?: string;
      category?: string;
      page?: number;
      limit?: number;
      search?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{
    headers: string[];
    data: any[];
    totalCount: number;
    page: number;
    totalPages: number;
  } | null> {
    const qParams = new URLSearchParams({
      action: 'getData',
      sheet: sheetName,
      page: String(params.page || 1),
      limit: String(params.limit || 50),
      ...(params.hub && params.hub !== 'ALL' ? { hub: params.hub } : {}),
      ...(params.category && params.category !== 'ALL' ? { category: params.category } : {}),
      ...(params.search ? { search: params.search } : {}),
      ...(params.startDate ? { startDate: params.startDate } : {}),
      ...(params.endDate ? { endDate: params.endDate } : {}),
    });

    const cacheKey = `data_${sheetName}_${qParams.toString()}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${this.endpoint}?${qParams.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;

      const result = await res.json();
      if (result && result.success) {
        const payload = {
          headers: result.headers || [],
          data: result.data || [],
          totalCount: result.totalCount || 0,
          page: result.page || 1,
          totalPages: result.totalPages || 1,
        };
        this.setCached(cacheKey, payload);
        return payload;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Update a record row in Google Sheets
   */
  public async updateRecord(
    sheetName: string,
    idColumn: string,
    idValue: string,
    data: Record<string, any>
  ): Promise<boolean> {
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateRecord',
          sheet: sheetName,
          idColumn,
          idValue,
          data,
        }),
      });
      const json = await res.json();
      this.cache.clear(); // invalidate cache on mutation
      return json && json.success === true;
    } catch {
      return false;
    }
  }

  /**
   * Create a record in Google Sheets
   */
  public async createRecord(sheetName: string, data: Record<string, any>): Promise<boolean> {
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createRecord',
          sheet: sheetName,
          data,
        }),
      });
      const json = await res.json();
      this.cache.clear();
      return json && json.success === true;
    } catch {
      return false;
    }
  }

  private getCached(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  private setCached(key: string, data: any): void {
    this.cache.set(key, { data, expiry: Date.now() + this.cacheTTL });
  }
}

export const googleSheetsApi = new GoogleSheetsApiService();
