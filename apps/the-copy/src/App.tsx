import type { JSX } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import ExternalAppFrame from './components/common/ExternalAppFrame'
import { environment, type PaneDefinition, type PaneId } from './config/environment'

type PaneState = 'checking' | 'ready' | 'error'

interface PaneStatus {
  state: PaneState
  lastChecked?: string
  message?: string
}

const statusLabels: Record<PaneState, string> = {
  checking: 'جاري التحقق',
  ready: 'جاهز',
  error: 'تعذر الوصول',
}

const statusStyles: Record<PaneState, string> = {
  checking: 'bg-blue-50 text-blue-700 border-blue-200',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
}

const statusIcons: Record<PaneState, typeof CheckCircle2> = {
  checking: Loader2,
  ready: CheckCircle2,
  error: AlertTriangle,
}

const buildHealthUrl = (pane: PaneDefinition): string => {
  const trimmedBase = pane.url.endsWith('/') && pane.url !== '/' ? pane.url.slice(0, -1) : pane.url
  const endpoint = pane.healthEndpoint.startsWith('/') ? pane.healthEndpoint : `/${pane.healthEndpoint}`
  if (endpoint === '/' || endpoint === '') {
    return `${trimmedBase}/`
  }
  return `${trimmedBase}${endpoint}`
}

const formatTime = (isoTimestamp: string | undefined): string => {
  if (!isoTimestamp) {
    return ''
  }

  const formatter = new Intl.DateTimeFormat('ar', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return formatter.format(new Date(isoTimestamp))
}

const PaneStatusBadge = ({ status }: { status: PaneStatus }): JSX.Element => {
  const Icon = statusIcons[status.state]
  const formattedTime = formatTime(status.lastChecked)
  const supportingText =
    status.state === 'ready'
      ? formattedTime
        ? `آخر تحقق ${formattedTime}`
        : 'تم التحقق'
      : status.message ?? 'يرجى المحاولة مجدداً'

  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${statusStyles[status.state]}`}
    >
      <Icon className={status.state === 'checking' ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
      <span>{statusLabels[status.state]}</span>
      {supportingText && status.state !== 'checking' ? (
        <span className="text-xs text-slate-600">{supportingText}</span>
      ) : null}
    </div>
  )
}

const PaneCard = ({ pane, status }: { pane: PaneDefinition; status: PaneStatus }): JSX.Element => (
  <section
    className="flex h-[32rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    data-pane-id={pane.id}
    data-testid="pane-card"
  >
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-slate-900">{pane.title}</h2>
        <p className="text-sm text-slate-500">{pane.description}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <PaneStatusBadge status={status} />
        <a
          href={pane.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          فتح في نافذة جديدة
        </a>
      </div>
    </header>
    <div className="flex flex-1 flex-col">
      <ExternalAppFrame
        url={pane.url}
        title={pane.title}
        onError={(error) => {
          console.error(`فشل تحميل ${pane.id}:`, error)
        }}
      />
    </div>
  </section>
)

const App = (): JSX.Element => {
  const [refreshIndex, setRefreshIndex] = useState(0)

  const paneDefinitions = useMemo<PaneDefinition[]>(() => Object.values(environment.panes), [])

  const [paneStatuses, setPaneStatuses] = useState<Record<PaneId, PaneStatus>>(() =>
    paneDefinitions.reduce<Record<PaneId, PaneStatus>>((accumulator, pane) => {
      accumulator[pane.id] = { state: 'checking' }
      return accumulator
    }, {} as Record<PaneId, PaneStatus>)
  )

  useEffect(() => {
    let isActive = true
    const controllers: AbortController[] = []

    paneDefinitions.forEach((pane) => {
      setPaneStatuses((previous) => ({
        ...previous,
        [pane.id]: { state: 'checking' },
      }))

      const controller = new AbortController()
      controllers.push(controller)
      const healthUrl = buildHealthUrl(pane)

      fetch(healthUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        signal: controller.signal,
      })
        .then((response) => {
          if (!isActive) {
            return
          }

          if (!response.ok) {
            throw new Error(`استجابة غير متوقعة (${response.status})`)
          }

          setPaneStatuses((previous) => ({
            ...previous,
            [pane.id]: {
              state: 'ready',
              lastChecked: new Date().toISOString(),
            },
          }))
        })
        .catch((error: unknown) => {
          if (!isActive) {
            return
          }

          const detail = error instanceof Error ? error.message : 'خطأ غير معروف'
          setPaneStatuses((previous) => ({
            ...previous,
            [pane.id]: {
              state: 'error',
              message: `تفاصيل: ${detail}`,
            },
          }))
        })
    })

    return () => {
      isActive = false
      controllers.forEach((controller) => controller.abort())
    }
  }, [paneDefinitions, refreshIndex])

  const handleRefreshStatuses = () => {
    setRefreshIndex((index) => index + 1)
  }

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl" data-testid="the-copy-shell">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">the copy</p>
              <h1 className="text-2xl font-bold text-slate-900">{environment.shellTitle}</h1>
              <p className="text-sm text-slate-500">
                جميع التجارب الأربعة متاحة في لوحة واحدة مع مراقبة للحالة الصحية المباشرة.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefreshStatuses}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة فحص الحالة
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {paneDefinitions.map((pane) => {
              const status = paneStatuses[pane.id] ?? { state: 'checking' }
              return (
                <div
                  key={pane.id}
                  className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  data-pane-id={pane.id}
                  data-testid="pane-summary"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">{pane.title}</span>
                    <PaneStatusBadge status={status} />
                  </div>
                  <p className="text-xs text-slate-500">المسار: {pane.mountPath}</p>
                </div>
              )
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-2">
        {paneDefinitions.map((pane) => (
          <PaneCard key={pane.id} pane={pane} status={paneStatuses[pane.id] ?? { state: 'checking' }} />
        ))}
      </main>
    </div>
  )
}

export type { PaneState, PaneStatus }
export default App
