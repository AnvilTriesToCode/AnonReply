'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { approveConversation, denyConversation, bulkApprove, bulkDeny } from '@/lib/actions/admin';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Loader2, Clock, User as UserIcon, ExternalLink } from 'lucide-react';
import { DENIAL_REASONS } from '@/lib/utils';

interface ConversationItem {
  _id: string;
  title: string;
  body: string;
  author: { _id: string; username: string };
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface AdminQueueProps {
  conversations: ConversationItem[];
}

export default function AdminQueue({ conversations }: AdminQueueProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDenyReason, setBulkDenyReason] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [actionStates, setActionStates] = useState<Record<string, 'loading' | 'done' | 'error'>>({});
  const router = useRouter();

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === conversations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(conversations.map((c) => c._id)));
    }
  };

  const handleApprove = async (id: string) => {
    setActionStates((prev) => ({ ...prev, [id]: 'loading' }));
    const result = await approveConversation(id);
    setActionStates((prev) => ({ ...prev, [id]: result.success ? 'done' : 'error' }));
    if (result.success) {
      startTransition(() => router.refresh());
    }
  };

  const handleDeny = async (id: string, reason?: string) => {
    setActionStates((prev) => ({ ...prev, [id]: 'loading' }));
    const result = await denyConversation(id, reason);
    setActionStates((prev) => ({ ...prev, [id]: result.success ? 'done' : 'error' }));
    if (result.success) {
      startTransition(() => router.refresh());
    }
  };

  const handleBulkApprove = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    for (const id of ids) {
      setActionStates((prev) => ({ ...prev, [id]: 'loading' }));
    }

    const result = await bulkApprove(ids);
    if (result.success) {
      setSelectedIds(new Set());
      startTransition(() => router.refresh());
    }
  };

  const handleBulkDeny = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    for (const id of ids) {
      setActionStates((prev) => ({ ...prev, [id]: 'loading' }));
    }

    const result = await bulkDeny(ids, bulkDenyReason || undefined);
    if (result.success) {
      setSelectedIds(new Set());
      setBulkDenyReason('');
      startTransition(() => router.refresh());
    }
  };

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">🎉 No pending conversations! The queue is clear.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.size === conversations.length && conversations.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedIds.size > 0
                  ? `${selectedIds.size} selected`
                  : 'Select all'}
              </span>
            </div>

            {selectedIds.size > 0 && (
              <>
                <Button
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={isPending}
                  className="gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  Approve Selected
                </Button>

                <div className="flex items-center gap-2">
                  <Select value={bulkDenyReason} onValueChange={setBulkDenyReason}>
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue placeholder="Denial reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DENIAL_REASONS.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkDeny}
                    disabled={isPending}
                    className="gap-1.5"
                  >
                    <X className="h-4 w-4" />
                    Deny Selected
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Queue Items */}
      {conversations.map((conversation) => (
        <ConversationQueueItem
          key={conversation._id}
          conversation={conversation}
          isSelected={selectedIds.has(conversation._id)}
          onToggleSelect={() => toggleSelect(conversation._id)}
          onApprove={() => handleApprove(conversation._id)}
          onDeny={(reason) => handleDeny(conversation._id, reason)}
          actionState={actionStates[conversation._id]}
        />
      ))}
    </div>
  );
}

function ConversationQueueItem({
  conversation,
  isSelected,
  onToggleSelect,
  onApprove,
  onDeny,
  actionState,
}: {
  conversation: ConversationItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onApprove: () => void;
  onDeny: (reason?: string) => void;
  actionState?: 'loading' | 'done' | 'error';
}) {
  const [denyReason, setDenyReason] = useState<string>('');
  const createdAt = new Date(conversation.createdAt);
  const isLoading = actionState === 'loading';

  return (
    <Card className={isSelected ? 'ring-2 ring-primary' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">{conversation.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <UserIcon className="h-3 w-3" />
              <span>{conversation.author?.username || 'Unknown'}</span>
              <Clock className="h-3 w-3 ml-2" />
              <span>{createdAt.toLocaleString()}</span>
            </div>
          </div>
          <Badge variant="warning">Pending</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/80 mb-4 whitespace-pre-wrap line-clamp-4">
          {conversation.body}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isLoading}
            className="gap-1.5"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Approve
          </Button>

          <Select value={denyReason} onValueChange={setDenyReason}>
            <SelectTrigger className="w-[160px] h-8">
              <SelectValue placeholder="Reason..." />
            </SelectTrigger>
            <SelectContent>
              {DENIAL_REASONS.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDeny(denyReason || undefined)}
            disabled={isLoading}
            className="gap-1.5"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Deny
          </Button>

          <Link href={`/conversations/${conversation._id}`} className="ml-auto">
            <Button size="sm" variant="outline" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Open Thread
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
