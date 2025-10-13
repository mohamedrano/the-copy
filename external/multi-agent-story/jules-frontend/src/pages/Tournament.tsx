import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { useTournament } from '../hooks/useTournament'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { ArrowLeft, Play, Pause, RotateCcw, ArrowRight, Users, Clock, Trophy } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function Tournament() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session } = useSession(id!)
  const { tournament, turns, startTournament, isLoading, error } = useTournament(id!)
  const [currentTurn, setCurrentTurn] = useState(1)
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    if (id) {
      loadTournament()
    }
  }, [id])

  const loadTournament = async () => {
    try {
      // Implementation for loading tournament
    } catch (error: any) {
      toast.error('حدث خطأ أثناء تحميل البطولة')
    }
  }

  const handleStartTournament = async () => {
    if (!id) return

    try {
      setIsStarting(true)
      await startTournament(id, {
        maxTurns: 8,
        turnDuration: 15,
        votingDuration: 30
      })
      toast.success('تم بدء البطولة بنجاح')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء بدء البطولة')
    } finally {
      setIsStarting(false)
    }
  }

  const handlePauseTournament = async () => {
    if (!tournament) return

    try {
      // Implementation for pausing tournament
      toast.success('تم إيقاف البطولة')
    } catch (error: any) {
      toast.error('حدث خطأ أثناء إيقاف البطولة')
    }
  }

  const handleResumeTournament = async () => {
    if (!tournament) return

    try {
      // Implementation for resuming tournament
      toast.success('تم استئناف البطولة')
    } catch (error: any) {
      toast.error('حدث خطأ أثناء استئناف البطولة')
    }
  }

  const handleNextPhase = () => {
    navigate(`/sessions/${id}/decision`)
  }

  if (isLoading && !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الجلسة...</p>
        </div>
      </div>
    )
  }

  if (!session) {
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

  const progress = tournament ? (tournament.currentTurn / tournament.maxTurns) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/sessions/${id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              العودة
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                البطولة التفاعلية
              </h1>
              <p className="text-muted-foreground mt-1">
                منافسة تفاعلية بين الأفكار مع 8 أدوار من النقاش
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!tournament && (
              <Button
                onClick={handleStartTournament}
                disabled={isStarting}
              >
                <Play className="h-4 w-4 mr-2" />
                {isStarting ? 'جاري البدء...' : 'بدء البطولة'}
              </Button>
            )}
            {tournament && tournament.status === 'active' && (
              <Button
                variant="outline"
                onClick={handlePauseTournament}
              >
                <Pause className="h-4 w-4 mr-2" />
                إيقاف مؤقت
              </Button>
            )}
            {tournament && tournament.status === 'paused' && (
              <Button
                onClick={handleResumeTournament}
              >
                <Play className="h-4 w-4 mr-2" />
                استئناف
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tournament Progress */}
            <Card>
              <CardHeader>
                <CardTitle>تقدم البطولة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>الدور الحالي</span>
                    <span className="font-medium">
                      {tournament ? `${tournament.currentTurn}/${tournament.maxTurns}` : '0/8'}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    {!tournament && 'لم تبدأ البطولة بعد'}
                    {tournament && tournament.status === 'active' && 'جاري التنفيذ...'}
                    {tournament && tournament.status === 'paused' && 'متوقفة مؤقتاً'}
                    {tournament && tournament.status === 'completed' && 'مكتملة'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tournament Turns */}
            {tournament && turns.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">أدوار البطولة</h2>
                <div className="space-y-4">
                  {turns.map((turn) => (
                    <Card key={turn.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            الدور {turn.turnNumber}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {turn.status}
                            </Badge>
                            <Badge variant="secondary">
                              {turn.participants.length} مشارك
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {turn.status === 'completed' ? (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-foreground mb-2">الملخص</h4>
                              <p className="text-sm text-muted-foreground">
                                {turn.summary}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground mb-2">المشاركون</h4>
                              <div className="flex flex-wrap gap-2">
                                {turn.participants.map((participant) => (
                                  <Badge key={participant.agentId} variant="outline">
                                    {participant.agentName}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground mb-2">الحجج</h4>
                              <div className="space-y-2">
                                {turn.arguments.map((argument) => (
                                  <div key={argument.id} className="p-3 bg-muted rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-sm">
                                        {argument.agentName}
                                      </span>
                                      <Badge variant={argument.type === 'support' ? 'default' : 'destructive'}>
                                        {argument.type === 'support' ? 'دعم' : 'معارضة'}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {argument.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground mb-2">النتائج</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-foreground">
                                    {turn.votes.length}
                                  </div>
                                  <div className="text-sm text-muted-foreground">إجمالي الأصوات</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-foreground">
                                    {turn.duration}s
                                  </div>
                                  <div className="text-sm text-muted-foreground">مدة الدور</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Clock className="h-4 w-4 animate-spin" />
                            <span>جاري التنفيذ...</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : tournament ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    لم تبدأ الأدوار بعد
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    البطولة جاهزة للبدء. سيتم تنفيذ الأدوار تلقائياً
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    لم تبدأ البطولة بعد
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    انقر على "بدء البطولة" لبدء عملية المنافسة التفاعلية
                  </p>
                  <Button onClick={handleStartTournament} disabled={isStarting}>
                    <Play className="h-4 w-4 mr-2" />
                    {isStarting ? 'جاري البدء...' : 'بدء البطولة'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            {tournament && tournament.status === 'completed' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      تم إكمال البطولة
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      يمكنك الآن الانتقال إلى مرحلة اتخاذ القرار النهائي
                    </p>
                    <Button onClick={handleNextPhase}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      اتخاذ القرار النهائي
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tournament Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات البطولة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tournament ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الحالة</span>
                      <Badge variant="outline">{tournament.status}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الأدوار</span>
                      <span>{tournament.currentTurn}/{tournament.maxTurns}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">مدة الدور</span>
                      <span>{tournament.turnDuration}s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">مدة التصويت</span>
                      <span>{tournament.votingDuration}s</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    لم تبدأ البطولة بعد
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle>المشاركون</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tournament?.participants.map((participant) => (
                    <div key={participant.agentId} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{participant.agentName}</span>
                      <Badge variant={participant.isActive ? 'default' : 'secondary'}>
                        {participant.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ideas Summary */}
            <Card>
              <CardHeader>
                <CardTitle>الأفكار المتنافسة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tournament?.ideas.map((idea, index) => (
                    <div key={idea.id} className="text-sm">
                      <div className="font-medium text-foreground">
                        الفكرة {index + 1}: {idea.title}
                      </div>
                      <div className="text-muted-foreground">
                        {idea.votes} صوت
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

