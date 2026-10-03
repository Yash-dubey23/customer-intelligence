export interface User {
  id?: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
}

export interface PredictionSummary {
  id: number;
  probability: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}

export interface Customer {
  id: number;
  customerCode: string;
  gender: string;
  seniorCitizen: number;
  partner: string;
  dependents: string;
  tenure: number;
  phoneService: string;
  multipleLines: string;
  internetService: string;
  onlineSecurity: string;
  onlineBackup: string;
  deviceProtection: string;
  techSupport: string;
  streamingTv: string;
  streamingMovies: string;
  contract: string;
  paperlessBilling: string;
  paymentMethod: string;
  monthlyCharges: number;
  totalCharges: number;
  actualChurn: string | null;
  createdAt: string;
  updatedAt: string;
  latestPrediction: PredictionSummary | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type CustomerListResponse = PaginatedResponse<Customer>;

export interface Prediction {
  id: number;
  customerId: number;
  customerCode: string;
  probability: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  modelName: string;
  status: 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export type PredictionListResponse = PaginatedResponse<Prediction>;

export interface RetentionAction {
  id: number;
  customerId: number;
  status: 'REVIEWED' | 'CONTACTED' | 'OFFER_SENT' | 'MONITORING' | 'RESOLVED';
  notes: string | null;
  actedBy: number | null;
  actedAt: string;
}

export interface Event {
  id: number;
  type: 'PREDICTION_COMPLETED' | 'CUSTOMER_ADDED' | 'CUSTOMER_UPDATED' | 'MOVED_TO_HIGH_RISK' | 'SERVICE_UNAVAILABLE' | 'RETENTION_ACTION';
  customerId: number | null;
  predictionId: number | null;
  message: string;
  createdAt: string;
}

export interface OverviewData {
  totalCustomers: number;
  atRiskCustomers: number;
  highRiskCustomers: number;
  churnRate: number;
  predictionsThisMonth: number;
  avgChurnProbability: number;
}

export interface SearchResult {
  type: string;
  id: number;
  label: string;
  subLabel: string;
}

export interface ChurnTrendPoint {
  date: string;
  total: number;
  high: number;
  medium: number;
  low: number;
}

export interface RiskDistribution {
  level: string;
  count: number;
}

export interface SegmentData {
  label: string;
  total: number;
  churned: number;
  churnRate: number;
}

export interface MlHealth {
  status: string;
  model: string;
  trainedAt: string;
}

export interface ModelMetrics {
  trainedAt: string;
  bestModel: string;
  testSize: number;
  models: Record<string, {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    roc_auc: number;
    confusion_matrix: number[][];
    roc_curve: { fpr: number[]; tpr: number[] };
  }>;
  featureImportance: { feature: string; importance: number }[];
  dataQuality: DataQualityInfo;
  categoricalOptions: Record<string, string[]>;
}

export interface DataQualityInfo {
  rows: number;
  columns: number;
  featureCount: number;
  numericalFeatures: string[];
  categoricalFeatures: string[];
  missingValues: Record<string, number>;
  duplicateRows: number;
  churnRate: number;
  status: string;
  lastTrained: string;
}
