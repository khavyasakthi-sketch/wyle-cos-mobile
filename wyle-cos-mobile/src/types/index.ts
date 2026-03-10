// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  onboardingComplete: boolean;
  onboardingStep: number;
  preferences: UserPreferences;
  autonomyTier: 0 | 1 | 2 | 3 | 4;
  insights: UserInsights;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  dietary: string[];
  cuisines: string[];
  mealBudget: number;
  householdSize: number;
  hasChildren: boolean;
  workSchedule: 'standard' | 'flexible' | 'shift';
  protectedTimeBlocks: string[];
}

export interface UserInsights {
  totalTimeSavedMinutes: number;
  totalDecisionsHandled: number;
  totalMoneySavedAED: number;
}

// ─── Obligation ───────────────────────────────────────────────────────────────
export type ObligationType =
  | 'visa'
  | 'emirates_id'
  | 'car_registration'
  | 'insurance'
  | 'school_fee'
  | 'mortgage_emi'
  | 'subscription'
  | 'medical'
  | 'document'
  | 'bill'
  | 'custom';

export type RiskLevel = 'high' | 'medium' | 'low';
export type ObligationStatus = 'active' | 'due_soon' | 'overdue' | 'completed' | 'snoozed';

export interface Obligation {
  _id: string;
  userId: string;
  type: ObligationType;
  title: string;
  description?: string;
  expiryDate?: string;
  dueDate?: string;
  reminderDays: number[];
  status: ObligationStatus;
  riskLevel: RiskLevel;
  executionPath?: string;
  partnerName?: string;
  amount?: number;
  currency: string;
  source: 'manual' | 'email_parsed' | 'document_scan' | 'system';
  daysUntil?: number;
  resolvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Food ─────────────────────────────────────────────────────────────────────
export interface FoodOption {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  priceRange: string;
  tags: string[];
  image: string;
  partner: string;
  deepLink: string;
  certaintyScore: number;
}

export interface FoodOrder {
  restaurantId: string;
  status: string;
  estimatedDelivery: string;
  confirmationCode: string;
  customisation?: string;
}

// ─── Buddy / Chat ─────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Brief ────────────────────────────────────────────────────────────────────
export interface MorningBrief {
  greeting: string;
  headline: string;
  lifeOptimizationScore: number;
  topPriorities: BriefPriority[];
  stats: {
    obligationsTracked: number;
    timeSavedThisWeek: string;
    decisionsHandled: number;
  };
  tip: string;
}

export interface BriefPriority {
  id: string;
  title: string;
  type: ObligationType;
  riskLevel: RiskLevel;
  emoji: string;
  daysUntil: number | null;
  executionPath?: string;
  action: string;
}

// ─── Insights ─────────────────────────────────────────────────────────────────
export interface InsightsData {
  lifeOptimizationScore: number;
  timeSaved: { totalMinutes: number; displayWeekly: string; displayLifetime: string };
  decisions: { total: number; display: string };
  moneySaved: { totalAED: number; display: string };
  obligations: {
    total: number; active: number; completed: number;
    overdue: number; highRisk: number; missRate: string;
  };
  reliability: { percentage: number; display: string };
  autonomyTier: number;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Obligations: undefined;
  Food: undefined;
  Buddy: undefined;
  Insights: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Preferences: undefined;
  ObligationScan: undefined;
  Ready: undefined;
};

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
