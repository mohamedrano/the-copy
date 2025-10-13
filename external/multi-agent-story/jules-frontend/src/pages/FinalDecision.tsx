import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { useIdeas } from '../hooks/useIdeas'
import { useTournament } from '../hooks/useTournament'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { ArrowLeft, Trophy, CheckCircle, BarChart3, Download, Share } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function FinalDecision() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session } = useSession(id!)
  const { ideas } = useIdeas(id!)
  const { tournament } = useTournament(id!)
  const [decision, setDecision] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMakingDecision, setIsMakingDecision] = useState(false)

  useEffect(() => {
    if (id) {
      loadDecision()
    }
  }, [id])

  const loadDecision = async () => {
    try {
      setIsLoading(true)
      // Implementation for loading decision
      setDecision(null)
    } catch (error: any) {
      toast.error('حدث خطأ أثناء تحميل القرار')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMakeDecision = async () => {
    if (!id) return

    try {
      setIsMakingDecision(true)
      // Implementation for making decision
      toast.success('تم اتخاذ القرار بنجاح')
    } catch (error: any) {
      toast.error('حدث خطأ أثناء اتخاذ القرار')
    } finally {
      setIsMakingDecision(false)
    }
  }

  const handleExportDecision = () => {
    // Implementation for exporting decision
    toast.success('تم تصدير القرار')
  }

  const handleShareDecision = () => {
    // Implementation for sharing decision
    toast.success('تم مشاركة القرار')
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
                القرار النهائي
              </h1>
              <p className="text-muted-foreground mt-1">
                تحليل شامل واتخاذ القرار النهائي بناءً على جميع المراحل
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!decision && (
              <Button
                onClick={handleMakeDecision}
                disabled={isMakingDecision}
              >
                <Trophy className="h-4 w-4 mr-2" />
                {isMakingDecision ? 'جاري اتخاذ القرار...' : 'اتخاذ القرار'}
              </Button>
            )}
            {decision && (
              <>
                <Button variant="outline" onClick={handleExportDecision}>
                  <Download className="h-4 w-4 mr-2" />
                  تصدير
                </Button>
                <Button variant="outline" onClick={handleShareDecision}>
                  <Share className="h-4 w-4 mr-2" />
                  مشاركة
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {decision ? (
              <>
                {/* Winning Idea */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span>الفكرة الفائزة</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {decision.winningIdea.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {decision.winningIdea.content}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {decision.winningIdea.score}
                          </div>
                          <div className="text-sm text-muted-foreground">النقاط الإجمالية</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {decision.winningIdea.confidence}%
                          </div>
                          <div className="text-sm text-muted-foreground">مستوى الثقة</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Decision Rationale */}
                <Card>
                  <CardHeader>
                    <CardTitle>مبرر القرار</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">الملخص</h4>
                        <p className="text-muted-foreground">
                          {decision.rationale.summary}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-2">العوامل الرئيسية</h4>
                        <div className="space-y-2">
                          {decision.rationale.keyFactors.map((factor: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <span className="text-sm font-medium">{factor.factor}</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={factor.weight * 100} className="w-20 h-2" />
                                <span className="text-sm text-muted-foreground">
                                  {factor.weight.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-2">التبرير النهائي</h4>
                        <p className="text-muted-foreground">
                          {decision.rationale.finalReasoning}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Voting Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>تفصيل التصويت</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {decision.rationale.votingBreakdown.totalVotes}
                          </div>
                          <div className="text-sm text-muted-foreground">إجمالي الأصوات</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {decision.rationale.votingBreakdown.idea1Votes}
                          </div>
                          <div className="text-sm text-muted-foreground">الفكرة الأولى</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {decision.rationale.votingBreakdown.idea2Votes}
                          </div>
                          <div className="text-sm text-muted-foreground">الفكرة الثانية</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-2">أصوات الوكلاء</h4>
                        <div className="space-y-2">
                          {decision.rationale.votingBreakdown.agentVotes.map((vote: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm font-medium">{vote.agentName}</span>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">الفكرة {vote.ideaId}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {vote.confidence}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>التوصيات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {decision.recommendations.map((recommendation: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">
                              {recommendation.title}
                            </h4>
                            <Badge variant={recommendation.priority === 'high' ? 'destructive' : 'secondary'}>
                              {recommendation.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {recommendation.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            <strong>التنفيذ:</strong> {recommendation.implementation.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    لم يتم اتخاذ القرار بعد
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    انقر على "اتخاذ القرار" لبدء عملية التحليل النهائي
                  </p>
                  <Button onClick={handleMakeDecision} disabled={isMakingDecision}>
                    <Trophy className="h-4 w-4 mr-2" />
                    {isMakingDecision ? 'جاري اتخاذ القرار...' : 'اتخاذ القرار'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الجلسة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">الفكرة الأساسية</h4>
                  <p className="text-sm text-muted-foreground">
                    {session.creativeBrief?.coreIdea}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">النوع الأدبي</h4>
                  <p className="text-sm text-muted-foreground">
                    {session.creativeBrief?.genre}
                  </p>
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
                  {ideas.map((idea, index) => (
                    <div key={idea.id} className="text-sm">
                      <div className="font-medium text-foreground">
                        الفكرة {index + 1}: {idea.title}
                      </div>
                      <div className="text-muted-foreground">
                        {idea.content.substring(0, 100)}...
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tournament Summary */}
            {tournament && (
              <Card>
                <CardHeader>
                  <CardTitle>ملخص البطولة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الأدوار المكتملة</span>
                      <span>{tournament.currentTurn}/{tournament.maxTurns}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">إجمالي الحجج</span>
                      <span>{tournament.stats.totalArguments}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">إجمالي الأصوات</span>
                      <span>{tournament.stats.totalVotes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Decision Stats */}
            {decision && (
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات القرار</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">مستوى الثقة</span>
                      <span>{decision.winningIdea.confidence}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">النقاط الإجمالية</span>
                      <span>{decision.winningIdea.score}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">مستوى الجودة</span>
                      <span>{decision.winningIdea.strengths.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

