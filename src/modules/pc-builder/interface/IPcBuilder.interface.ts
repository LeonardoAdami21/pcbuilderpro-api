export interface CompatibilityIssue {
  severity: 'error' | 'warning';
  message: string;
  componentA?: string;
  componentB?: string;
}
