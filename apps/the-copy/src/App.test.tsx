import { render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

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
        expect(within(summary).getByText('جاهز')).toBeInTheDocument()
      })
    })

    expect(screen.getAllByTestId('pane-card')).toHaveLength(4)
    expect(screen.getAllByRole('link', { name: 'فتح في نافذة جديدة' })).toHaveLength(4)
    expect(globalThis.fetch).toHaveBeenCalledTimes(4)
  })
})
