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
    <div className="flex items-center gap-2 px-4 py-1 animate-slideInLeft">
      <div className="flex gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0s' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.2s' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
      <p className="text-xs text-muted italic">
        {userList}
        {rest} {typingUsers.length === 1 ? 'is' : 'are'} typing…
      </p>
    </div>
  );
}
