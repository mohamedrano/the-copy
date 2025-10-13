import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'الآن'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `منذ ${diffInMinutes} دقيقة`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `منذ ${diffInHours} ساعة`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `منذ ${diffInDays} يوم`
  }

  return formatDate(d)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'INITIALIZED': 'bg-blue-100 text-blue-800',
    'BRIEF_SUBMITTED': 'bg-yellow-100 text-yellow-800',
    'IDEAS_GENERATED': 'bg-green-100 text-green-800',
    'REVIEWS_COMPLETED': 'bg-purple-100 text-purple-800',
    'TOURNAMENT_STARTED': 'bg-orange-100 text-orange-800',
    'TOURNAMENT_COMPLETED': 'bg-indigo-100 text-indigo-800',
    'DECISION_MADE': 'bg-emerald-100 text-emerald-800',
    'COMPLETED': 'bg-gray-100 text-gray-800',
    'CANCELLED': 'bg-red-100 text-red-800',
  }
  
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

export function getPhaseColor(phase: string): string {
  const phaseColors: Record<string, string> = {
    'BRIEF': 'bg-blue-100 text-blue-800',
    'IDEA_GENERATION': 'bg-green-100 text-green-800',
    'REVIEW': 'bg-purple-100 text-purple-800',
    'TOURNAMENT': 'bg-orange-100 text-orange-800',
    'DECISION': 'bg-emerald-100 text-emerald-800',
  }
  
  return phaseColors[phase] || 'bg-gray-100 text-gray-800'
}

export function getAgentTypeName(agentType: string): string {
  const agentNames: Record<string, string> = {
    'STORY_ARCHITECT': 'مهندس القصة',
    'REALISM_CRITIC': 'ناقد الواقعية',
    'STRATEGIC_ANALYST': 'المحلل الاستراتيجي',
    'CHARACTER_DEVELOPMENT': 'مطور الشخصيات',
    'CHARACTER_EXPANSION': 'موسع الشخصيات',
    'WORLD_BUILDING': 'باني العالم',
    'DIALOGUE_VOICE': 'صوت الحوار',
    'THEME_AGENT': 'وكيل الموضوع',
    'GENRE_TONE': 'وكيل النوع والنبرة',
    'PACING_AGENT': 'وكيل الإيقاع',
    'CONFLICT_TENSION': 'وكيل الصراع والتوتر',
  }
  
  return agentNames[agentType] || agentType
}

export function getAgentTypeColor(agentType: string): string {
  const agentColors: Record<string, string> = {
    'STORY_ARCHITECT': 'bg-blue-100 text-blue-800',
    'REALISM_CRITIC': 'bg-red-100 text-red-800',
    'STRATEGIC_ANALYST': 'bg-green-100 text-green-800',
    'CHARACTER_DEVELOPMENT': 'bg-purple-100 text-purple-800',
    'CHARACTER_EXPANSION': 'bg-pink-100 text-pink-800',
    'WORLD_BUILDING': 'bg-yellow-100 text-yellow-800',
    'DIALOGUE_VOICE': 'bg-indigo-100 text-indigo-800',
    'THEME_AGENT': 'bg-orange-100 text-orange-800',
    'GENRE_TONE': 'bg-teal-100 text-teal-800',
    'PACING_AGENT': 'bg-cyan-100 text-cyan-800',
    'CONFLICT_TENSION': 'bg-rose-100 text-rose-800',
  }
  
  return agentColors[agentType] || 'bg-gray-100 text-gray-800'
}

