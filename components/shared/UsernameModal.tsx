'use client';

import { useEffect, useState } from 'react';
import { useAppStore, initializeUser } from '@/store/appStore';
import { validateUsername } from '@/lib/utils';

interface UsernameModalProps {
  onComplete?: () => void;
}

export function UsernameModal({ onComplete }: UsernameModalProps) {
  const { user, setUser } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize user on mount
    const currentUser = initializeUser();

    // Show modal if username is empty
    if (!currentUser.username) {
      setIsOpen(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateUsername(username);
    if (!validation.valid) {
      setError(validation.error || 'Invalid username');
      return;
    }

    // Update user with username
    if (user) {
      setUser({ ...user, username: username.trim() });
    }

    setError(null);
    setIsOpen(false);
    onComplete?.();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="username-modal-title"
    >
      <div className="bg-surface rounded-xl p-6 mx-4 shadow-xl max-w-sm w-full scale-100 animate-in fade-in zoom-in duration-200">
        <h2
          id="username-modal-title"
          className="text-xl font-bold mb-2 text-center"
        >
          Choose a username
        </h2>
        <p className="text-sm text-muted text-center mb-6">
          This will be your display name in match chats
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(null);
            }}
            placeholder="Enter your name..."
            className="w-full border border-border rounded-lg px-4 py-3 bg-bg text-text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            autoFocus
            maxLength={20}
            aria-label="Enter your username"
            aria-invalid={!!error}
            aria-describedby={error ? 'username-error' : undefined}
          />

          {error && (
            <p id="username-error" className="text-error text-xs mt-2" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-accent text-accent-fg rounded-lg py-3 font-semibold mt-4 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!username.trim()}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
