'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { markAsResolved } from '@/lib/actions/conversations';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

interface MarkResolvedButtonProps {
  conversationId: string;
}

export default function MarkResolvedButton({ conversationId }: MarkResolvedButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleClick() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setError('');
    startTransition(async () => {
      const result = await markAsResolved(conversationId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || 'Failed to mark as resolved');
        setConfirmed(false);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={confirmed ? 'default' : 'outline'}
        size="sm"
        onClick={handleClick}
        disabled={isPending}
        className="gap-1.5"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4" />
        )}
        {confirmed ? 'Confirm — Mark as Resolved' : 'Mark as Resolved'}
      </Button>
      {confirmed && !isPending && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirmed(false)}
        >
          Cancel
        </Button>
      )}
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
