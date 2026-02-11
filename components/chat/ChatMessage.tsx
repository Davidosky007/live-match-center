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
      <div className="flex justify-center py-1 px-4 animate-fadeIn">
        <p className="text-xs text-muted text-center italic">
          ⋯ {msg.message} ⋯
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} px-4 py-2 animate-slideInUp`}
    >
      <div className={`max-w-[75%] flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {!isOwnMessage && (
          <p className="text-xs font-semibold text-accent mb-1">
            {msg.username}
          </p>
        )}
        <div
          className={`
            rounded-2xl px-4 py-2.5 text-sm break-words shadow-sm transition-all
            ${
              isOwnMessage
                ? 'chat-bubble-own'
                : 'chat-bubble-other'
            }
          `}
        >
          {msg.message}
        </div>
        <p className="text-xs text-muted mt-1 px-2">
          {formatRelativeTime(msg.timestamp)}
        </p>
      </div>
    </div>
  );
}
