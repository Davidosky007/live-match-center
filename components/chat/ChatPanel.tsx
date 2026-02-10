'use client';

import { useEffect, useRef, useState } from 'react';
import { useMatchChat } from '@/hooks/useMatchChat';
import { ChatMessageComponent } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

interface ChatPanelProps {
  matchId: string;
}

const MAX_MESSAGE_LENGTH = 500;

export function ChatPanel({ matchId }: ChatPanelProps) {
  const [messageText, setMessageText] = useState('');
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    typingUsers,
    isSending,
    rateLimited,
    chatError,
    sendMessage,
    emitTyping,
  } = useMatchChat(matchId);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 50;

      if (isAtBottom) {
        scrollToBottom();
        setHasNewMessages(false);
      } else if (messages.length > 0) {
        setHasNewMessages(true);
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || isSending || rateLimited) return;

    const success = await sendMessage(messageText);
    if (success) {
      setMessageText('');
    }
  };

  const handleInputChange = (value: string) => {
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessageText(value);
      emitTyping();
    }
  };

  const charCount = messageText.length;
  const isOverLimit = charCount > 480;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-2 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted text-center">
              No messages yet. Be the first to message!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageComponent key={msg.timestamp} msg={msg} />
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator typingUsers={typingUsers} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* New messages indicator */}
      {hasNewMessages && (
        <button
          onClick={scrollToBottom}
          className="mx-4 mb-2 px-3 py-1.5 bg-accent rounded-full text-xs font-semibold text-accent-fg"
        >
          ↓ New messages
        </button>
      )}

      {/* Input */}
      <div className="border-t border-border bg-surface p-3">
        {chatError && (
          <div className="text-xs text-error mb-2 shake">{chatError}</div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={isSending || rateLimited}
            className="flex-1 bg-bg border border-border rounded-full px-4 py-2 text-sm text-text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
            aria-label="Type a message"
          />

          {/* Character count */}
          <span
            className={`text-xs whitespace-nowrap ${
              isOverLimit ? 'text-error font-semibold' : 'text-muted'
            }`}
            aria-live="polite"
            aria-atomic="true"
          >
            {charCount}/{MAX_MESSAGE_LENGTH}
          </span>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={
              !messageText.trim() || isSending || rateLimited || isOverLimit
            }
            className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-semibold text-accent-fg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
