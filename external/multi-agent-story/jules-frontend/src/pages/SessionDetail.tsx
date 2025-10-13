import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/sessionStore'
import { sessionService } from '../services/session.service'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { formatSessionPhase, formatSessionStatus, getPhaseColor, getStatusColor } from '../utils/formatters'
import { ArrowLeft, Play, Pause, RotateCcw, Settings, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentSession, setCurrentSession } = useSessionStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (id) {
      loadSession(id)
    }
  }, [id])

  const loadSession = async (sessionId: string) => {
    try {
      setIsLoading(true)
      const session = await sessionService.getById(sessionId)
      setCurrentSession(session)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تحميل الجلسة')
      navigate('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStart = async () => {
    if (!currentSession) return
    
    try {
      setIsLoading(true)
      const updatedSession = await sessionService.start(currentSession.id)
      setCurrentSession(updatedSession)
      toast.success('تم بدء الجلسة بنجاح')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء بدء الجلسة')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePause = async () => {
    if (!currentSession) return
    
    try {
      setIsLoading(true)
      const updatedSession = await sessionService.pause(currentSession.id)
      setCurrentSession(updatedSession)
      toast.success('تم إيقاف الجلسة')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إيقاف الجلسة')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResume = async () => {
    if (!currentSession) return
    
    try {
      setIsLoading(true)
      const updatedSession = await sessionService.resume(currentSession.id)
      setCurrentSession(updatedSession)
      toast.success('تم استئناف الجلسة')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء استئناف الجلسة')
    } finally {
      setIsLoading(false)
    }
  }

  const getNextPhaseAction = () => {
    if (!currentSession) return null

    switch (currentSession.currentPhase) {
      case 'brief':
        return {
          label: 'بدء توليد الأفكار',
          action: () => navigate(`/sessions/${currentSession.id}/ideas`),
          icon: <Play className="h-4 w-4" />
        }
      case 'idea_generation':
        return {
          label: 'بدء المراجعة المستقلة',
          action: () => navigate(`/sessions/${currentSession.id}/review`),
          icon: <Eye className="h-4 w-4" />
        }
      case 'review':
        return {
          label: 'بدء البطولة التفاعلية',
          action: () => navigate(`/sessions/${currentSession.id}/tournament`),
          icon: <Play className="h-4 w-4" />
        }
      case 'tournament':
        return {
          label: 'اتخاذ القرار النهائي',
          action: () => navigate(`/sessions/${currentSession.id}/decision`),
          icon: <RotateCcw className="h-4 w-4" />
        }
      default:
        return null
    }
  }

  if (isLoading && !currentSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الجلسة...</p>
        </div>
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">الجلسة غير موجودة</h1>
          <Button onClick={() => navigate('/dashboard')}>
            العودة للوحة التحكم
          </Button>
        </div>
      </div>
    )
  }

  const nextAction = getNextPhaseAction()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              العودة
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {currentSession.title || 'جلسة بدون عنوان'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {currentSession.creativeBrief?.coreIdea}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getStatusColor(currentSession.status)}>
              {formatSessionStatus(currentSession.status)}
            </Badge>
            <Badge variant="outline" className={getPhaseColor(currentSession.currentPhase)}>
              {formatSessionPhase(currentSession.currentPhase)}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>تقدم الجلسة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>المرحلة الحالية</span>
                    <span className="font-medium">
                      {formatSessionPhase(currentSession.currentPhase)}
                    </span>
                  </div>
                  <Progress value={currentSession.progress.progress} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>الخطوة {currentSession.progress.currentStep} من {currentSession.progress.totalSteps}</span>
                    <span>{currentSession.progress.progress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creative Brief */}
            <Card>
              <CardHeader>
                <CardTitle>الموجز الإبداعي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">الفكرة الأساسية</h4>
                  <p className="text-muted-foreground">
                    {currentSession.creativeBrief?.coreIdea}
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">النوع الأدبي</h4>
                    <Badge variant="outline">{currentSession.creativeBrief?.genre}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">الجمهور المستهدف</h4>
                    <p className="text-muted-foreground">
                      {currentSession.creativeBrief?.targetAudience || 'غير محدد'}
                    </p>
                  </div>
                </div>
                {currentSession.creativeBrief?.themes && currentSession.creativeBrief.themes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">المواضيع</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentSession.creativeBrief.themes.map((theme, index) => (
                        <Badge key={index} variant="secondary">{theme}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>الإجراءات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {currentSession.status === 'draft' && (
                    <Button onClick={handleStart} disabled={isLoading}>
                      <Play className="h-4 w-4 mr-2" />
                      بدء الجلسة
                    </Button>
                  )}
                  
                  {currentSession.status === 'active' && (
                    <Button variant="outline" onClick={handlePause} disabled={isLoading}>
                      <Pause className="h-4 w-4 mr-2" />
                      إيقاف مؤقت
                    </Button>
                  )}
                  
                  {currentSession.status === 'paused' && (
                    <Button onClick={handleResume} disabled={isLoading}>
                      <Play className="h-4 w-4 mr-2" />
                      استئناف
                    </Button>
                  )}

                  {nextAction && (
                    <Button onClick={nextAction.action}>
                      {nextAction.icon}
                      <span className="mr-2">{nextAction.label}</span>
                    </Button>
                  )}

                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    إعدادات الجلسة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الجلسة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">تاريخ الإنشاء</span>
                    <span>{new Date(currentSession.createdAt).toLocaleDateString('ar')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">آخر تحديث</span>
                    <span>{new Date(currentSession.updatedAt).toLocaleDateString('ar')}</span>
                  </div>
                  {currentSession.completedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">تاريخ الإكمال</span>
                      <span>{new Date(currentSession.completedAt).toLocaleDateString('ar')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الوكلاء النشطون</span>
                    <span>11</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الأفكار المولدة</span>
                    <span>0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المراجعات المكتملة</span>
                    <span>0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">أدوار البطولة</span>
                    <span>0/8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

