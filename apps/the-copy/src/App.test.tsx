import type { JSX } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const mockRemoteModule = (moduleId: string, testId: string) => {
  ;(vi.mock as unknown as (id: string, factory: () => { default: () => JSX.Element }, options?: { virtual?: boolean }) => void)(
    moduleId,
    () => ({ default: () => <div data-testid={testId} /> }),
    { virtual: true },
  )
}

mockRemoteModule('basicEditor/App', 'remote-basic-editor')
mockRemoteModule('dramaAnalyst/App', 'remote-drama-analyst')
mockRemoteModule('multiAgentStory/App', 'remote-multi-agent')
mockRemoteModule('stations/App', 'remote-stations')

describe('The Copy unified shell', () => {
  const mockResponse = {
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
  }

  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as never)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders four live panes with successful health checks', async () => {
    render(<App />)

    await waitFor(() => {
      const summaries = screen.getAllByTestId('pane-summary')
      expect(summaries).toHaveLength(4)
      summaries.forEach(summary => {
        expect(summary).toHaveTextContent('جاهز')
      })
    })

    expect(screen.getAllByTestId('pane-card')).toHaveLength(4)
    expect(screen.getAllByRole('link', { name: 'فتح التطبيق' })).toHaveLength(4)
    expect(screen.getAllByRole('link', { name: 'فتح في نافذة جديدة' })).toHaveLength(4)
    expect(globalThis.fetch).toHaveBeenCalledTimes(4)
  })
})
