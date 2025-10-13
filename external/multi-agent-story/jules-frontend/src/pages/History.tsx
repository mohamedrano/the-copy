import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/sessionStore'
import { sessionService } from '../services/session.service'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { formatSessionStatus, formatSessionPhase, getStatusColor, getPhaseColor } from '../utils/formatters'
import { Search, Filter, Calendar, BookOpen, Eye, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function History() {
  const navigate = useNavigate()
  const { sessions, loadSessions, deleteSession } = useSessionStore()
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [phaseFilter, setPhaseFilter] = useState<string>('all')

  useEffect(() => {
    loadSessions()
  }, [])

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الجلسة؟')) return

    try {
      await deleteSession(sessionId)
      toast.success('تم حذف الجلسة بنجاح')
    } catch (error: any) {
      toast.error('حدث خطأ أثناء حذف الجلسة')
    }
  }

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.creativeBrief?.coreIdea.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter
    const matchesPhase = phaseFilter === 'all' || session.currentPhase === phaseFilter
    
    return matchesSearch && matchesStatus && matchesPhase
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              سجل الجلسات
            </h1>
            <p className="text-muted-foreground mt-1">
              عرض وإدارة جميع جلساتك السابقة
            </p>
          </div>
          <Button onClick={() => navigate('/sessions/new')}>
            <BookOpen className="h-4 w-4 mr-2" />
            جلسة جديدة
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث في الجلسات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="draft">مسودة</option>
                  <option value="active">نشط</option>
                  <option value="paused">متوقف</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغي</option>
                </select>
                <select
                  value={phaseFilter}
                  onChange={(e) => setPhaseFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="all">جميع المراحل</option>
                  <option value="brief">الموجز الإبداعي</option>
                  <option value="idea_generation">توليد الأفكار</option>
                  <option value="review">المراجعة المستقلة</option>
                  <option value="tournament">البطولة التفاعلية</option>
                  <option value="decision">القرار النهائي</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  لا توجد جلسات
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' || phaseFilter !== 'all'
                    ? 'لم يتم العثور على جلسات تطابق معايير البحث'
                    : 'ابدأ بإنشاء جلسة جديدة لتطوير قصتك'
                  }
                </p>
                <Button onClick={() => navigate('/sessions/new')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  إنشاء جلسة جديدة
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {session.title || 'جلسة بدون عنوان'}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getStatusColor(session.status)}>
                            {formatSessionStatus(session.status)}
                          </Badge>
                          <Badge variant="outline" className={getPhaseColor(session.currentPhase)}>
                            {formatSessionPhase(session.currentPhase)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {session.creativeBrief?.coreIdea}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>أنشئت: {new Date(session.createdAt).toLocaleDateString('ar')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>النوع: {session.creativeBrief?.genre}</span>
                        </div>
                        {session.completedAt && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>مكتملة: {new Date(session.completedAt).toLocaleDateString('ar')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/sessions/${session.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        عرض
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredSessions.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                السابق
              </Button>
              <Button variant="outline" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

