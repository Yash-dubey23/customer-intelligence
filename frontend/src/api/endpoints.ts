import client from './client';
import type * as Types from './types';

export const auth = {
  login: (data: any) => client.post<Types.AuthResponse>('/auth/login', data),
  register: (data: any) => client.post<Types.AuthResponse>('/auth/register', data),
};

export const customers = {
  list: (params?: any) => client.get<Types.CustomerListResponse>('/customers', { params }),
  getById: (id: string) => client.get<Types.Customer>(`/customers/${id}`),
  importCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post('/customers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const predictions = {
  create: (data: any) => client.post<Types.Prediction>('/predictions', data),
  list: (params?: any) => client.get<Types.PredictionListResponse>('/predictions', { params }),
  getById: (id: string) => client.get<Types.Prediction>(`/predictions/${id}`),
};

export const analytics = {
  overview: () => client.get<Types.OverviewData>('/analytics/overview'),
  churnTrend: (params?: any) => client.get<Types.ChurnTrendPoint[]>('/analytics/churn-trend', { params }),
  riskDistribution: () => client.get<Types.RiskDistribution[]>('/analytics/risk-distribution'),
  segments: () => client.get<Types.SegmentData[]>('/analytics/segments'),
};

export const retention = {
  create: (data: any) => client.post<Types.RetentionAction>('/retention', data),
  getByCustomer: (id: string) => client.get<Types.RetentionAction[]>(`/retention/customer/${id}`),
};

export const events = {
  list: (params?: any) => client.get<Types.PaginatedResponse<Types.Event>>('/events', { params }),
};

export const search = {
  search: (query: string) => client.get<Types.SearchResult[]>('/search', { params: { q: query } }),
};

export const exportApi = {
  exportCustomers: (params?: any) => client.get('/export/customers', { params, responseType: 'blob' }),
  exportPredictions: (params?: any) => client.get('/export/predictions', { params, responseType: 'blob' }),
};

export const ml = {
  health: () => client.get<Types.MlHealth>('/ml/health'),
  metrics: () => client.get<Types.ModelMetrics>('/ml/metrics'),
  dataQuality: () => client.get<Types.DataQualityInfo>('/ml/data-quality'),
};
