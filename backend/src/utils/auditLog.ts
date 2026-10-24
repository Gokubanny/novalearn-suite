import AuditLog, { AuditSeverity } from '../modules/audit/audit.model';

interface LogAuditParams {
  action: string;
  actorId?: string | null;
  actorLabel: string;
  target: string;
  severity?: AuditSeverity;
  ip?: string;
}

export const logAudit = async ({
  action, actorId = null, actorLabel, target, severity = 'info', ip = 'system',
}: LogAuditParams): Promise<void> => {
  try {
    await AuditLog.create({ action, actor: actorId, actorLabel, target, severity, ip });
  } catch (err) {
    // Audit logging failure should never block the action it's logging
    console.error('Failed to write audit log:', err);
  }
};