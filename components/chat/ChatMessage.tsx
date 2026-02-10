'use client';

import { ChatMessage } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';

interface ChatMessageComponentProps {
  msg: ChatMessage;
}

export function ChatMessageComponent({ msg }: ChatMessageComponentProps) {
  const { user } = useAppStore();
  const isOwnMessage = msg.userId === user?.userId;
  const isSystemMessage = msg.userId === 'system';

  if (isSystemMessage) {
    return (
      <div className="flex justify-center py-2">
        <p className="text-xs text-muted text-center">
          — {msg.message} —
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} px-4 py-2`}
    >
      <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {!isOwnMessage && (
          <p className="text-xs font-semibold text-muted mb-0.5">
            {msg.username}
          </p>
        )}
        <div
          className={`
            rounded-2xl px-4 py-2 text-sm break-words
            ${
              isOwnMessage
                ? 'bg-chat-own text-accent-fg rounded-br-sm'
                : 'bg-chat-other text-text-primary rounded-bl-sm'
            }
          `}
        >
          {msg.message}
        </div>
        <p className="text-xs text-muted mt-1">
          {formatRelativeTime(msg.timestamp)}
        </p>
      </div>
    </div>
  );
}
