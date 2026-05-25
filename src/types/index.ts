export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type UserRole = 'Coach' | 'Client' | 'Programmer' | 'Tester' | 'Tracker';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  metaphor?: string;
  teamName?: string;
  cadence: string;
  sustainablePaceHours: number;
  createdAt: string;
  memberCount: number;
}

export interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
}

export interface Iteration {
  id: string;
  projectId: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  velocity: number;
  capacity: number;
  status: 'Planning' | 'Active' | 'Completed';
}

export interface BurndownPoint {
  day: number;
  date: string;
  idealRemaining: number;
  actualRemaining: number;
}

export interface Story {
  id: string;
  projectId: string;
  iterationId?: string;
  title: string;
  businessValue: number;
  risk: 'Low' | 'Medium' | 'High';
  points: number;
  status: 'Backlog' | 'Current' | 'Done';
  assignedPair: string[];
  isTDD: boolean;
  acceptanceCriteria: string[];
  createdBy: 'Client' | 'Programmer';
  estimatedBy?: string;
  createdAt: string;
}

export interface PairSession {
  id: string;
  projectId: string;
  driver: string;
  navigator: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  storyId?: string;
  status: 'Active' | 'Completed';
}

export interface PairRotationSuggestion {
  pair: [string, string];
  reason: string;
  score: number;
}

export interface TestResult {
  id: string;
  projectId: string;
  storyId?: string;
  type: 'unit' | 'acceptance';
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  durationMs: number;
  runAt: string;
  failureMessage?: string;
}

export interface CoverageSnapshot {
  id: string;
  projectId: string;
  lines: number;
  branches: number;
  functions: number;
  statements: number;
  timestamp: string;
}

export interface RefactorLog {
  id: string;
  projectId: string;
  title: string;
  type: 'refactor' | 'debt';
  date: string;
  status: 'Open' | 'Resolved';
  relatedStory?: string;
  description?: string;
  participants: string[];
}

export interface DebtRegister {
  totalItems: number;
  openItems: number;
  healthScore: number;
  items: RefactorLog[];
}

export interface BuildEvent {
  id: string;
  projectId: string;
  branch: string;
  commitSha: string;
  commitMessage: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  triggeredBy: string;
}

export interface PipelineHistory {
  builds: BuildEvent[];
  integrationFrequency: number;
  successRate: number;
  averageDurationMs: number;
}

export interface StandupEntry {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  iterationId: string;
  whatIDid: string;
  whatIWillDo: string;
  blockers: string;
  createdAt: string;
}

export interface RetroEntry {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  iterationId: string;
  category: 'Keep' | 'Drop' | 'Try';
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: Record<string, boolean>;
}

export interface XPHealthMetrics {
  velocity: number;
  velocityTrend: number[];
  pairingCoverage: number;
  pairingTrend: number[];
  tddRate: number;
  tddTrend: number[];
  sustainablePace: number;
  paceTrend: number[];
  integrationFrequency: number;
  integrationTrend: number[];
  buildStability: number;
  buildTrend: number[];
  cycleTime: number;
  cycleTrend: number[];
  teamMorale: number;
  moraleTrend: number[];
  codeQuality: number;
  qualityTrend: number[];
}

export interface WsEvent {
  type: string;
  payload: Record<string, unknown>;
  projectId: string;
  timestamp: string;
}

export interface WsBuildEvent extends WsEvent {
  type: 'build:started' | 'build:success' | 'build:failed';
  payload: { buildId: string; status: string; projectId: string };
}

export interface WsTestEvent extends WsEvent {
  type: 'test:failed';
  payload: { testId: string; name: string; failureMessage: string };
}

export interface WsStoryEvent extends WsEvent {
  type: 'story:updated';
  payload: { storyId: string; status: string; title: string };
}

export interface WsVelocityEvent extends WsEvent {
  type: 'iteration:velocity:updated';
  payload: { iterationId: string; velocity: number };
}

export interface WsPairEvent extends WsEvent {
  type: 'pair:session:started' | 'pair:session:ended';
  payload: { sessionId: string; driver: string; navigator: string };
}

export interface WsNotificationEvent extends WsEvent {
  type: 'notification:new';
  payload: { notificationId: string; title: string; body: string };
}

export interface WsStandupEvent extends WsEvent {
  type: 'standup:submitted';
  payload: { entryId: string; userName: string };
}
