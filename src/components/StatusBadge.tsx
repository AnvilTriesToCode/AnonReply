import { Badge } from '@/components/ui/badge';

type Status = 'PENDING' | 'APPROVED' | 'DENIED' | 'RESOLVED';

const statusConfig: Record<Status, { label: string; variant: 'warning' | 'success' | 'destructive' | 'info' }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  APPROVED: { label: 'Active', variant: 'success' },
  DENIED: { label: 'Denied', variant: 'destructive' },
  RESOLVED: { label: 'Resolved', variant: 'info' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
