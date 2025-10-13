import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIdeas } from '../hooks/useIdeas'
import { useSession } from '../hooks/useSession'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { IdeaDisplay } from '../components/features/IdeaDisplay'
import { ArrowLeft, RefreshCw, Eye, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function IdeaGeneration() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session } = useSession(id!)
  const { ideas, generateIdeas, isLoading, error } = useIdeas(id!)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateIdeas = async () => {
    if (!id) return

    try {
      setIsGenerating(true)
      await generateIdeas(id, {
        count: 2,
        focus: session?.creativeBrief?.coreIdea
      })
      toast.success('تم توليد الأفكار بنجاح')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء توليد الأفكار')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerateIdea = async (ideaId: string) => {
    try {
      // Implementation for regenerating a specific idea
      toast.success('تم إعادة توليد الفكرة')
    } catch (error: any) {
      toast.error('حدث خطأ أثناء إعادة توليد الفكرة')
    }
  }

  const handleViewIdea = (ideaId: string) => {
    // Implementation for viewing idea details
    console.log('View idea:', ideaId)
  }

  const handleNextPhase = () => {
    navigate(`/sessions/${id}/review`)
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
                توليد الأفكار
              </h1>
              <p className="text-muted-foreground mt-1">
                توليد فكرتين متكاملتين بناءً على الموجز الإبداعي
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleGenerateIdeas}
              disabled={isGenerating || ideas.length > 0}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'جاري التوليد...' : 'توليد الأفكار'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>تقدم توليد الأفكار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>الأفكار المولدة</span>
                    <span className="font-medium">{ideas.length}/2</span>
                  </div>
                  <Progress value={(ideas.length / 2) * 100} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    {ideas.length === 0 && 'لم يتم توليد أي أفكار بعد'}
                    {ideas.length === 1 && 'تم توليد فكرة واحدة، جاري توليد الفكرة الثانية...'}
                    {ideas.length === 2 && 'تم توليد جميع الأفكار بنجاح'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ideas */}
            {ideas.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">الأفكار المولدة</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {ideas.map((idea, index) => (
                    <IdeaDisplay
                      key={idea.id}
                      idea={idea}
                      onView={handleViewIdea}
                      onRegenerate={handleRegenerateIdea}
                      showActions={true}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    لم يتم توليد أي أفكار بعد
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    انقر على "توليد الأفكار" لبدء عملية توليد فكرتين متكاملتين
                  </p>
                  <Button onClick={handleGenerateIdeas} disabled={isGenerating}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'جاري التوليد...' : 'توليد الأفكار'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-destructive mb-2">
                      حدث خطأ أثناء توليد الأفكار
                    </h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={handleGenerateIdeas} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      المحاولة مرة أخرى
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
                {session.creativeBrief?.themes && session.creativeBrief.themes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">المواضيع</h4>
                    <div className="flex flex-wrap gap-1">
                      {session.creativeBrief.themes.map((theme, index) => (
                        <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            {ideas.length === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>الخطوة التالية</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    تم توليد جميع الأفكار بنجاح. يمكنك الآن الانتقال إلى مرحلة المراجعة المستقلة.
                  </p>
                  <Button onClick={handleNextPhase} className="w-full">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    بدء المراجعة المستقلة
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

