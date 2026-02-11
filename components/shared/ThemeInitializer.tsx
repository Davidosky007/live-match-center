'use client';

import { useEffect } from 'react';
import { initializeTheme, initializeUser } from '@/store/appStore';
import { useSocketConnection } from '@/hooks/useSocketConnection';

export function ThemeInitializer() {
  // Initialize socket connection (returns void, side effects only)
  useSocketConnection();

  useEffect(() => {
    // Initialize theme
    initializeTheme();

    // Initialize user (creates if doesn't exist)
    initializeUser();
  }, []);

  return null;
}
