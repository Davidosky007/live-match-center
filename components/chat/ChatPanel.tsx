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
      // Explicitly stop typing after send
      console.log("[ChatPanel] Message sent, emitting typing=false");
      emitTyping(false);
    }
  };

  const handleInputChange = (value: string) => {
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessageText(value);
      // Emit typing only when content is added (not empty)
      if (value.length > 0) {
        console.log('[ChatPanel] handleInputChange: typing=true, length=', value.length);
        emitTyping(true);
      } else {
        // Stop typing when input is cleared
        console.log('[ChatPanel] handleInputChange: typing=false (cleared)');
        emitTyping(false);
      }
    }
  };

  const charCount = messageText.length;
  const isOverLimit = charCount > 480;

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide space-y-2 py-3 px-1"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-muted">
                💬 No messages yet
              </p>
              <p className="text-xs text-muted mt-2">
                Be the first to join the chat!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageComponent key={msg.timestamp} msg={msg} />
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-1">
            <TypingIndicator typingUsers={typingUsers} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* New messages indicator */}
      {hasNewMessages && (
        <button
          onClick={scrollToBottom}
          className="mx-4 mb-3 px-4 py-2 bg-accent hover:opacity-90 rounded-full text-xs font-bold text-accent-fg transition-all duration-200 slide-in-up shadow-md"
          aria-label="Jump to new messages"
        >
          ↓ {messages.filter(m => m.userId !== 'system').length > 5 ? '5+' : ''} New messages
        </button>
      )}

      {/* Input Section */}
      <div className="border-t border-border bg-surface p-3 space-y-2">
        {/* Error Message */}
        {chatError && (
          <div className="text-xs text-error bg-error bg-opacity-10 rounded-lg px-3 py-2 font-medium shake">
            ⚠️ {chatError}
          </div>
        )}

        {/* Rate limit status */}
        {rateLimited && (
          <div className="text-xs text-warn bg-warn bg-opacity-10 rounded-lg px-3 py-2 font-medium">
            ⏱️ Please wait before sending another message...
          </div>
        )}

        {/* Input Field */}
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
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
              className="input-modern w-full text-sm pr-16 transition-smooth"
              aria-label="Type a message"
            />
            
            {/* Character Counter - Absolute positioned */}
            <span
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs whitespace-nowrap font-medium transition-colors ${
                isOverLimit ? 'text-error' : 'text-muted'
              }`}
              aria-live="polite"
              aria-atomic="true"
            >
              {charCount}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={
              !messageText.trim() || isSending || rateLimited || isOverLimit
            }
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 flex-shrink-0 ${
              !messageText.trim() || isSending || rateLimited || isOverLimit
                ? 'bg-border text-muted cursor-not-allowed'
                : 'bg-accent text-accent-fg hover:shadow-lg hover:scale-110 active:scale-95'
            }`}
            aria-label="Send message"
            title={isSending ? 'Sending...' : rateLimited ? 'Rate limited' : 'Send'}
          >
            {isSending ? '⋯' : '→'}
          </button>
        </div>

        {/* Helper text */}
        {isOverLimit && (
          <p className="text-xs text-error font-medium">
            Message too long. Maximum {MAX_MESSAGE_LENGTH} characters.
          </p>
        )}
      </div>
    </div>
  );
}
