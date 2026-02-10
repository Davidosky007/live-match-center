'use client';

import { TypingUser } from '@/lib/types';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) {
    return null;
  }

  const userList = typingUsers.slice(0, 2).map((u) => u.username).join(' and ');
  const rest = typingUsers.length > 2 ? ` and ${typingUsers.length - 2} others` : '';

  return (
    <p className="text-xs text-muted px-4 py-2 italic">
      {userList}
      {rest} {typingUsers.length === 1 ? 'is' : 'are'} typing…
    </p>
  );
}
