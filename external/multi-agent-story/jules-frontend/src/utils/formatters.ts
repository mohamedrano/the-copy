// Date formatting utilities
export const formatDate = (date: string | Date, locale: string = 'ar-SA'): string => {
  const d = new Date(date)
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatDateTime = (date: string | Date, locale: string = 'ar-SA'): string => {
  const d = new Date(date)
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatRelativeTime = (date: string | Date, locale: string = 'ar-SA'): string => {
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

  return formatDate(d, locale)
}

// Text formatting utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

export const capitalizeFirst = (text: string): string => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const formatNumber = (num: number, locale: string = 'ar-SA'): string => {
  return num.toLocaleString(locale)
}

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

// Status formatting utilities
export const formatSessionStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: 'مسودة',
    active: 'نشط',
    paused: 'متوقف',
    completed: 'مكتمل',
    cancelled: 'ملغي'
  }
  return statusMap[status] || status
}

export const formatSessionPhase = (phase: string): string => {
  const phaseMap: Record<string, string> = {
    brief: 'الموجز الإبداعي',
    idea_generation: 'توليد الأفكار',
    review: 'المراجعة المستقلة',
    tournament: 'البطولة التفاعلية',
    decision: 'القرار النهائي'
  }
  return phaseMap[phase] || phase
}

export const formatAgentType = (type: string): string => {
  const typeMap: Record<string, string> = {
    story_architect: 'مهندس القصة',
    realism_critic: 'ناقد الواقعية',
    strategic_analyst: 'المحلل الاستراتيجي',
    character_development: 'مطور الشخصيات',
    character_expansion: 'موسع الشخصيات',
    world_building: 'باني العالم',
    dialogue_voice: 'خبير الحوار',
    theme_agent: 'وكيل الموضوعات',
    genre_tone: 'خبير النوع والأسلوب',
    pacing_agent: 'وكيل الإيقاع',
    conflict_tension: 'وكيل الصراع والتوتر'
  }
  return typeMap[type] || type
}

// Color utilities for status
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-blue-100 text-blue-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

export const getPhaseColor = (phase: string): string => {
  const colorMap: Record<string, string> = {
    brief: 'bg-purple-100 text-purple-800',
    idea_generation: 'bg-blue-100 text-blue-800',
    review: 'bg-orange-100 text-orange-800',
    tournament: 'bg-red-100 text-red-800',
    decision: 'bg-green-100 text-green-800'
  }
  return colorMap[phase] || 'bg-gray-100 text-gray-800'
}

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 بايت'
  
  const k = 1024
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Duration formatting
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} ثانية`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `${minutes} دقيقة و ${remainingSeconds} ثانية`
      : `${minutes} دقيقة`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  return remainingMinutes > 0
    ? `${hours} ساعة و ${remainingMinutes} دقيقة`
    : `${hours} ساعة`
}

