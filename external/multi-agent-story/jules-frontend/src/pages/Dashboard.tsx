import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { sessionService } from '../services/session.service'
import { Plus, BookOpen, Clock, CheckCircle, Users, Zap } from 'lucide-react'
import { Session } from '../types/session.types'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    completedSessions: 0
  })

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const data = await sessionService.getAll()
      setSessions(data)
      
      // Calculate stats
      setStats({
        totalSessions: data.length,
        activeSessions: data.filter(s => s.status === 'active').length,
        completedSessions: data.filter(s => s.status === 'completed').length
      })
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط'
      case 'completed':
        return 'مكتمل'
      case 'paused':
        return 'متوقف'
      default:
        return 'غير معروف'
    }
  }

  const getPhaseText = (phase: string) => {
    switch (phase) {
      case 'brief':
        return 'الموجز الإبداعي'
      case 'idea_generation':
        return 'توليد الأفكار'
      case 'review':
        return 'المراجعة المستقلة'
      case 'tournament':
        return 'البطولة التفاعلية'
      case 'decision':
        return 'القرار النهائي'
      default:
        return 'غير معروف'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                مرحباً، {user?.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                استكشف لوحة التحكم وأبدأ رحلتك الإبداعية
              </p>
            </div>
            <Link
              to="/sessions/new"
              className="btn btn-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              جلسة جديدة
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-muted-foreground">إجمالي الجلسات</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-muted-foreground">الجلسات النشطة</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-muted-foreground">الجلسات المكتملة</p>
                <p className="text-2xl font-bold text-foreground">{stats.completedSessions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">إجراءات سريعة</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/sessions/new"
              className="flex items-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <Plus className="h-5 w-5 text-primary mr-3" />
              <span className="text-foreground">جلسة جديدة</span>
            </Link>
            
            <Link
              to="/agents"
              className="flex items-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <Users className="h-5 w-5 text-primary mr-3" />
              <span className="text-foreground">إدارة الوكلاء</span>
            </Link>
            
            <Link
              to="/history"
              className="flex items-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <BookOpen className="h-5 w-5 text-primary mr-3" />
              <span className="text-foreground">سجل الجلسات</span>
            </Link>
            
            <Link
              to="/settings"
              className="flex items-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <Zap className="h-5 w-5 text-primary mr-3" />
              <span className="text-foreground">الإعدادات</span>
            </Link>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">الجلسات الأخيرة</h2>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">جاري التحميل...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  لا توجد جلسات بعد
                </h3>
                <p className="text-muted-foreground mb-4">
                  ابدأ بإنشاء جلسة جديدة لتطوير قصتك
                </p>
                <Link
                  to="/sessions/new"
                  className="btn btn-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  إنشاء جلسة جديدة
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.slice(0, 5).map((session) => (
                  <Link
                    key={session.id}
                    to={`/sessions/${session.id}`}
                    className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-1">
                          {session.title || 'جلسة بدون عنوان'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {session.creativeBrief?.coreIdea?.substring(0, 100)}
                          {session.creativeBrief?.coreIdea && session.creativeBrief.coreIdea.length > 100 && '...'}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>النوع: {session.creativeBrief?.genre}</span>
                          <span>المرحلة: {getPhaseText(session.currentPhase)}</span>
                          <span>أنشئت: {new Date(session.createdAt).toLocaleDateString('ar')}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {getStatusText(session.status)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {sessions.length > 5 && (
                  <div className="text-center pt-4">
                    <Link
                      to="/history"
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      عرض جميع الجلسات
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

