import { beforeEach, describe, expect, it } from 'vitest';
import { useSessionStore } from '../useStore';

const resetStore = () => {
  useSessionStore.setState((state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    token: null,
    currentSession: null,
    sessions: [],
    agents: [],
    isLoading: false,
    error: null,
    activePhase: 1,
  }));
};

describe('session store', () => {
  beforeEach(() => {
    resetStore();
  });

  it('updates an existing agent', () => {
    const agent = { id: '1', name: 'Agent 1', role: 'narrator', status: 'idle' as const };

    useSessionStore.getState().setAgents([agent]);
    useSessionStore.getState().updateAgent('1', { name: 'Updated Agent' });

    const storedAgent = useSessionStore.getState().agents.find((item) => item.id === '1');
    expect(storedAgent?.name).toBe('Updated Agent');
  });

  it('merges updates into the current session and synchronises the sessions list', () => {
    const session = {
      id: 's1',
      title: 'Initial Session',
      brief: 'A creative prompt',
      phase: 1,
      status: 'active' as const,
      ideas: [],
      startTime: new Date(),
    };

    useSessionStore.getState().setCurrentSession(session);
    useSessionStore.getState().setSessions([session]);

    useSessionStore.getState().updateSession({ title: 'Updated Session', phase: 2 });

    const { currentSession, sessions } = useSessionStore.getState();
    expect(currentSession?.title).toBe('Updated Session');
    expect(currentSession?.phase).toBe(2);
    expect(sessions[0].title).toBe('Updated Session');
    expect(sessions[0].phase).toBe(2);
  });
});
