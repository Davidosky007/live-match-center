'use client';

import { useEffect } from 'react';
import { initializeTheme } from '@/store/appStore';

export function ThemeInitializer() {
  useEffect(() => {
    initializeTheme();
  }, []);

  return null;
}
