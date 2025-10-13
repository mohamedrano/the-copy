import { X, Home, Plus, History, Settings, BookOpen, Users, Trophy, CheckCircle } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'الرئيسية', href: '/dashboard', icon: Home },
  { name: 'جلسة جديدة', href: '/sessions/new', icon: Plus },
  { name: 'التاريخ', href: '/history', icon: History },
]

const phases = [
  { name: 'الموجز الإبداعي', href: '/sessions/:id', icon: BookOpen, phase: 'brief' },
  { name: 'توليد الأفكار', href: '/sessions/:id/ideas', icon: Users, phase: 'ideas' },
  { name: 'المراجعة', href: '/sessions/:id/reviews', icon: CheckCircle, phase: 'reviews' },
  { name: 'البطولة', href: '/sessions/:id/tournament', icon: Trophy, phase: 'tournament' },
  { name: 'القرار النهائي', href: '/sessions/:id/decision', icon: CheckCircle, phase: 'decision' },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">القائمة</h2>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-6">
            {/* Main Navigation */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">الرئيسية</h3>
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Process Phases */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">مراحل التطوير</h3>
              <ul className="space-y-1">
                {phases.map((item, index) => (
                  <li key={item.name}>
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-muted-foreground">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </div>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Settings className="h-4 w-4" />
              <span>الإعدادات</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

