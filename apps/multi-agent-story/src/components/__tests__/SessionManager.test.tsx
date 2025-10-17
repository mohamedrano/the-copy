import React, { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionManager } from '../SessionManager';
import { useStore } from '../../store/useStore';

vi.mock('../../services/api', () => {
  return {
    sessionService: {
      createSession: vi.fn(),
    },
    wsService: {
      connect: vi.fn(),
      disconnect: vi.fn(),
      send: vi.fn(),
      on: vi.fn(() => vi.fn()),
    },
  };
});

vi.mock('framer-motion', () => {
  const ReactModule = require('react');

  const createElement = (tag: string) =>
    ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => {
      const sanitizedProps = { ...props } as Record<string, unknown>;

      delete sanitizedProps.whileHover;
      delete sanitizedProps.whileTap;
      delete sanitizedProps.initial;
      delete sanitizedProps.animate;
      delete sanitizedProps.transition;

      return ReactModule.createElement(tag, sanitizedProps, children);
    };

  return {
    motion: {
      button: createElement('button'),
      div: createElement('div'),
    },
  };
});

const resetStore = () => {
  useStore.setState((state) => ({
    ...state,
    currentSession: null,
    sessions: [],
    agents: [],
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
    error: null,
    activePhase: 1,
  }));
};

describe('SessionManager', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders the main container without crashing', () => {
    render(<SessionManager />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('shows the brief textarea for creating a session', () => {
    render(<SessionManager />);
    expect(screen.getByPlaceholderText(/اكتب هنا الفكرة الأساسية/i)).toBeInTheDocument();
  });
});
