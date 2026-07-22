export type UserRole = 'Asesor' | 'Asesor Senior' | 'Administrador de Centro' | 'Superadministrador';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sede: string;
}

export type DocumentStatus = 'Pendiente' | 'Recibido' | 'En revisión' | 'Validado' | 'Rechazado' | 'Requiere actualización';

export interface Document {
  id: string;
  name: string;
  status: DocumentStatus;
  uploadDate?: string;
  responsible?: string;
  remarks?: string;
}

export type BuroAuthStatus = 'Autorización pendiente' | 'Autorización firmada' | 'Autorización vencida' | 'Autorización rechazada';

export interface BuroInfo {
  score?: number;
  activeAccounts?: number;
  paymentPunctuality?: string; // e.g. "Excelente (98%)"
  riskAlerts?: string[];
  lastChecked?: string;
  authStatus: BuroAuthStatus;
  authDate?: string;
}

export interface SimulatedOffer {
  id: string;
  bankName: string;
  productName: string;
  interestRate: number;
  rateUpdatedDate: string;
  cat: number;
  commission: number;
  appraisalCost: number;
  termYears: number;
  monthlyPayment: number;
  loanAmount: number;
  requiredIncome: number;
  debtToIncomeRatio: number;
  keyRequirements: string[];
  advantages: string[];
  risks: string[];
  trustLevel: string;
  verifiedStatus: 'Actualizado' | 'Pendiente de validar' | 'Desactualizado' | 'Requiere revisión' | 'Validado internamente';
  recommendation: string;
  isCustomized?: boolean;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

export type CRMStage = 'Prospecto' | 'En análisis' | 'Docs integrados' | 'Enviado a banco' | 'Rechazado' | 'Aprobado';

export interface MortgageFile {
  id: string;
  advisorId: string;
  name: string;
  email: string;
  phone: string;
  broker: string;
  sede: string;
  requestedAmount: number;
  propertyValue: number;
  termYears: number;
  creditType: string; // e.g. "Adquisición", "Liquidez", "Construcción", "Sustitución de Hipoteca"
  monthlyIncome: number;
  monthlyExpenses: number;
  otherDebts: number;
  age: number;
  economicActivity: string; // "Asalariado" | "Independiente / Persona Física con Actividad Empresarial" | "Empresario"
  jobTenureMonths: number;
  observations: string;
  stage: CRMStage;
  priority: 'Alta' | 'Media' | 'Baja';
  nextAction: string;
  lastAnalysisDate: string;
  documents: Document[];
  buro: BuroInfo;
  simulatedOffers: SimulatedOffer[];
  logs: ActivityLog[];
}

export interface BankRate {
  id: string;
  bankName: string;
  productName: string;
  interestRate: number;
  cat: number;
  commission: number;
  appraisalCost: number; // e.g. Percentage of value, or absolute value
  lastUpdated: string;
  source: string;
  verifiedBy: string;
  status: 'Actualizado' | 'Pendiente de validar' | 'Desactualizado' | 'Requiere revisión' | 'Validado internamente';
  trustLevel: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  requirements: string[];
  advantages: string[];
  risks: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'sofia';
  text: string;
  timestamp: string;
  sources?: string[];
}

export interface GuidedFlowState {
  isActive: boolean;
  fileId: string;
  currentStep: number; // 1 to 4
}
