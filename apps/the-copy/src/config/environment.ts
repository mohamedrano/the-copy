export type PaneId = 'editor' | 'drama-analyst' | 'stations' | 'multi-agent-story'

export interface PaneDefinition {
  id: PaneId
  title: string
  description: string
  mountPath: string
  url: string
  healthEndpoint: string
}

export interface EnvironmentConfig {
  geminiApiKey: string
  shellTitle: string
  panes: Record<PaneId, PaneDefinition>
}

const normaliseBaseUrl = (rawUrl: string): string => {
  if (rawUrl === '/') {
    return rawUrl
  }

  return rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl
}

const getGeminiApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
  if (!apiKey) {
    console.warn('VITE_GEMINI_API_KEY is not set; advanced AI features will remain disabled until it is provided.')
    return ''
  }
  return apiKey
}

const getShellTitle = (): string => {
  const title = import.meta.env.VITE_SHELL_TITLE as string | undefined
  return title?.trim() && title.trim().length > 0 ? title.trim() : 'The Copy — Unified Workspace'
}

const resolvePaneUrl = (envKey: string, fallback: string): string => {
  const value = import.meta.env[envKey] as string | undefined
  if (!value || value.trim().length === 0) {
    return fallback
  }
  return normaliseBaseUrl(value.trim())
}

const createPaneDefinition = (config: {
  id: PaneId
  envKey: string
  fallback: string
  title: string
  description: string
  mountPath: string
  healthEndpoint?: string
}): PaneDefinition => ({
  id: config.id,
  title: config.title,
  description: config.description,
  mountPath: config.mountPath,
  url: resolvePaneUrl(config.envKey, config.fallback),
  healthEndpoint: config.healthEndpoint ?? '/',
})

export const environment: EnvironmentConfig = {
  geminiApiKey: getGeminiApiKey(),
  shellTitle: getShellTitle(),
  panes: {
    editor: createPaneDefinition({
      id: 'editor',
      envKey: 'VITE_EDITOR_URL',
      fallback: '/basic-editor',
      title: 'المحرر الأساسي',
      description: 'تحرير النصوص السينمائية مع دعم اللغة العربية بالكامل.',
      mountPath: '/editor',
      healthEndpoint: '/',
    }),
    'drama-analyst': createPaneDefinition({
      id: 'drama-analyst',
      envKey: 'VITE_DRAMA_URL',
      fallback: '/drama-analyst',
      title: 'محلل الدراما',
      description: 'تحليلات درامية متقدمة تعمل عبر شبكة من الوكلاء.',
      mountPath: '/drama',
      healthEndpoint: '/',
    }),
    stations: createPaneDefinition({
      id: 'stations',
      envKey: 'VITE_STATIONS_URL',
      fallback: '/stations',
      title: 'المحطات التحليلية',
      description: 'سبع محطات لتحليل الشبكات الدرامية والصراع.',
      mountPath: '/stations',
      healthEndpoint: '/',
    }),
    'multi-agent-story': createPaneDefinition({
      id: 'multi-agent-story',
      envKey: 'VITE_AGENTS_URL',
      fallback: '/multi-agent-story',
      title: 'العصف الذهني متعدد الوكلاء',
      description: 'تجربة توليد القصص وإدارتها بالتعاون مع الوكلاء.',
      mountPath: '/agents',
      healthEndpoint: '/',
    }),
  },
}
