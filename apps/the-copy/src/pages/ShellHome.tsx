import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { environment, type PaneDefinition, type PaneId } from '@/config/environment';

type PaneState = 'checking' | 'ready' | 'error';

interface PaneStatus {
  state: PaneState;
  lastChecked?: string;
  message?: string;
}

const statusLabels: Record<PaneState, string> = {
  checking: 'جاري التحقق',
  ready: 'جاهز',
  error: 'تعذر الوصول',
};

const statusStyles: Record<PaneState, string> = {
  checking: 'bg-blue-50 text-blue-700 border-blue-200',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
};

const statusIcons: Record<PaneState, typeof CheckCircle2> = {
  checking: Loader2,
  ready: CheckCircle2,
  error: AlertTriangle,
};

const buildHealthUrl = (pane: PaneDefinition): string => {
  const trimmedBase = pane.url.endsWith('/') && pane.url !== '/' ? pane.url.slice(0, -1) : pane.url;
  const endpoint = pane.healthEndpoint.startsWith('/') ? pane.healthEndpoint : `/${pane.healthEndpoint}`;
  if (endpoint === '/' || endpoint === '') {
    return `${trimmedBase}/`;
  }
  return `${trimmedBase}${endpoint}`;
};

const formatTime = (isoTimestamp: string | undefined): string => {
  if (!isoTimestamp) {
    return '';
  }

  const formatter = new Intl.DateTimeFormat('ar', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return formatter.format(new Date(isoTimestamp));
};

const PaneStatusBadge = ({ status }: { status: PaneStatus }): JSX.Element => {
  const Icon = statusIcons[status.state];
  const formattedTime = formatTime(status.lastChecked);
  const supportingText =
    status.state === 'ready'
      ? formattedTime
        ? `آخر تحقق ${formattedTime}`
        : 'تم التحقق'
      : status.message ?? 'يرجى المحاولة مجدداً';

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
  );
};

const PaneCard = ({ pane, status }: { pane: PaneDefinition; status: PaneStatus }): JSX.Element => (
  <section
    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    data-pane-id={pane.id}
    data-testid="pane-card"
  >
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{pane.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{pane.description}</p>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <Link
          to={pane.routePath}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <span>فتح التطبيق</span>
        </Link>
        <a
          href={pane.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <ExternalLink className="h-4 w-4" />
          فتح في نافذة جديدة
        </a>
      </div>
    </header>
    <div className="flex flex-1 flex-col gap-4 px-6 py-5" data-testid="pane-summary">
      <PaneStatusBadge status={status} />
      <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-wide text-slate-500">المسار داخل القشرة</dt>
          <dd className="font-semibold text-slate-900">{pane.routePath}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-wide text-slate-500">رابط التطبيق</dt>
          <dd className="font-semibold text-blue-600">{pane.url}</dd>
        </div>
      </dl>
    </div>
  </section>
);

export function ShellHome(): JSX.Element {
  const [refreshIndex, setRefreshIndex] = useState(0);

  const paneDefinitions = useMemo<PaneDefinition[]>(() => Object.values(environment.panes), []);

  const [paneStatuses, setPaneStatuses] = useState<Record<PaneId, PaneStatus>>(() =>
    paneDefinitions.reduce<Record<PaneId, PaneStatus>>((accumulator, pane) => {
      accumulator[pane.id] = { state: 'checking' };
      return accumulator;
    }, {} as Record<PaneId, PaneStatus>),
  );

  useEffect(() => {
    let isActive = true;
    const controllers: AbortController[] = [];

    paneDefinitions.forEach((pane) => {
      setPaneStatuses((previous) => ({
        ...previous,
        [pane.id]: { state: 'checking' },
      }));

      const controller = new AbortController();
      controllers.push(controller);
      const healthUrl = buildHealthUrl(pane);

      fetch(healthUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        signal: controller.signal,
      })
        .then((response) => {
          if (!isActive) {
            return;
          }

          if (!response.ok) {
            throw new Error(`استجابة غير متوقعة (${response.status})`);
          }

          setPaneStatuses((previous) => ({
            ...previous,
            [pane.id]: {
              state: 'ready',
              lastChecked: new Date().toISOString(),
            },
          }));
        })
        .catch((error: unknown) => {
          if (!isActive) {
            return;
          }

          console.error(`فشل التحقق من صحة ${pane.id}:`, error);
          setPaneStatuses((previous) => ({
            ...previous,
            [pane.id]: {
              state: 'error',
              message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
            },
          }));
        });
    });

    return () => {
      isActive = false;
      controllers.forEach((controller) => controller.abort());
    };
  }, [paneDefinitions, refreshIndex]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">بوابة التطبيقات الموحدة</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            اختر أحد التطبيقات المتخصصة أدناه ليتم تحميله داخل القشرة الرئيسية مع دعم التوجيه الموحد والتحميل الكسول.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshIndex((index) => index + 1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900"
        >
          <RefreshCw className="h-4 w-4" />
          إعادة التحقق من الحالة
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {paneDefinitions.map((pane) => (
          <PaneCard key={pane.id} pane={pane} status={paneStatuses[pane.id] ?? { state: 'checking' }} />
        ))}
      </div>
    </div>
  );
}
