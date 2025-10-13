import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/sessionStore'
import { sessionService } from '../services/session.service'
import { CreativeBriefForm } from '../components/forms/CreativeBriefForm'
import { CreateCreativeBriefRequest } from '../types/session.types'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'

export default function NewSession() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { addSession } = useSessionStore()

  const handleSubmit = async (data: CreateCreativeBriefRequest) => {
    try {
      setIsLoading(true)
      const session = await sessionService.create({
        creativeBrief: data
      })
      
      addSession(session)
      toast.success('تم إنشاء الجلسة بنجاح')
      navigate(`/sessions/${session.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء الجلسة')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              جلسة جديدة
            </h1>
            <p className="text-muted-foreground mt-1">
              ابدأ رحلتك الإبداعية مع Jules
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <CreativeBriefForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-foreground">جاري إنشاء الجلسة...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

