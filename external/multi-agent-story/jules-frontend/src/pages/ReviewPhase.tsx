import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { useIdeas } from '../hooks/useIdeas'
import { useAgents } from '../hooks/useAgents'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { ArrowLeft, Eye, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ReviewPhase() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session } = useSession(id!)
  const { ideas } = useIdeas(id!)
  const { agents } = useAgents(id!)
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (id) {
      loadReviews()
    }
  }, [id])

  const loadReviews = async () => {
    try {
      setIsLoading(true)
      // Implementation for loading reviews
      setReviews([])
    } catch (error: any) {
      toast.error('حدث خطأ أثناء تحميل المراجعات')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartReviews = async () => {
    try {
      setIsLoading(true)
      // Implementation for starting reviews
      toast.success('تم بدء المراجعات بنجاح')
    } catch (error: any) {
      toast.error('حدث خطأ أثناء بدء المراجعات')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewReview = (reviewId: string) => {
    // Implementation for viewing review details
    console.log('View review:', reviewId)
  }

  const handleNextPhase = () => {
    navigate(`/sessions/${id}/tournament`)
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

  const totalReviews = agents.length * ideas.length
  const completedReviews = reviews.filter(r => r.status === 'completed').length
  const progress = totalReviews > 0 ? (completedReviews / totalReviews) * 100 : 0

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
                المراجعة المستقلة
              </h1>
              <p className="text-muted-foreground mt-1">
                مراجعة الأفكار من قبل جميع الوكلاء المتخصصين
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleStartReviews}
              disabled={isLoading || reviews.length > 0}
            >
              <Eye className="h-4 w-4 mr-2" />
              {reviews.length > 0 ? 'جاري المراجعة...' : 'بدء المراجعات'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>تقدم المراجعات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>المراجعات المكتملة</span>
                    <span className="font-medium">{completedReviews}/{totalReviews}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    {completedReviews === 0 && 'لم تبدأ المراجعات بعد'}
                    {completedReviews > 0 && completedReviews < totalReviews && 'جاري المراجعة...'}
                    {completedReviews === totalReviews && 'تم إكمال جميع المراجعات'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Grid */}
            {reviews.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">المراجعات</h2>
                <div className="grid gap-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {review.agentName} - {review.ideaTitle}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {review.agentType}
                            </Badge>
                            <Badge variant={review.status === 'completed' ? 'default' : 'secondary'}>
                              {review.status === 'completed' ? 'مكتمل' : 'جاري المراجعة'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {review.status === 'completed' ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-foreground">
                                  {review.scores.quality}
                                </div>
                                <div className="text-sm text-muted-foreground">الجودة</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-foreground">
                                  {review.scores.novelty}
                                </div>
                                <div className="text-sm text-muted-foreground">الأصالة</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-foreground">
                                  {review.scores.impact}
                                </div>
                                <div className="text-sm text-muted-foreground">التأثير</div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground mb-2">التقييم</h4>
                              <p className="text-sm text-muted-foreground">
                                {review.assessment}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground mb-2">التوصيات</h4>
                              <p className="text-sm text-muted-foreground">
                                {review.recommendations}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReview(review.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              عرض التفاصيل
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Clock className="h-4 w-4 animate-spin" />
                            <span>جاري المراجعة...</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    لم تبدأ المراجعات بعد
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    انقر على "بدء المراجعات" لبدء عملية المراجعة المستقلة
                  </p>
                  <Button onClick={handleStartReviews} disabled={isLoading}>
                    <Eye className="h-4 w-4 mr-2" />
                    {isLoading ? 'جاري البدء...' : 'بدء المراجعات'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            {completedReviews === totalReviews && totalReviews > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      تم إكمال جميع المراجعات
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      يمكنك الآن الانتقال إلى مرحلة البطولة التفاعلية
                    </p>
                    <Button onClick={handleNextPhase}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      بدء البطولة التفاعلية
                    </Button>
                  </div>
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

            {/* Agents Status */}
            <Card>
              <CardHeader>
                <CardTitle>حالة الوكلاء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{agent.agentName}</span>
                      <Badge variant={agent.isActive ? 'default' : 'secondary'}>
                        {agent.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ideas Summary */}
            <Card>
              <CardHeader>
                <CardTitle>ملخص الأفكار</CardTitle>
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
          </div>
        </div>
      </div>
    </div>
  )
}

