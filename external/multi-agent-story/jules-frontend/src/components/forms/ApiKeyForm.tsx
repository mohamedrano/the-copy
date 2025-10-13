import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import { CreateApiKeyRequest, UpdateApiKeyRequest } from '../../types/api.types'
import { createApiKeySchema, updateApiKeySchema } from '../../utils/validators'

interface ApiKeyFormProps {
  onSubmit: (data: CreateApiKeyRequest | UpdateApiKeyRequest) => void
  onCancel?: () => void
  onTest?: (apiKey: string) => void
  isLoading?: boolean
  isTesting?: boolean
  testResult?: { isValid: boolean; message: string }
  initialData?: Partial<CreateApiKeyRequest>
  isEdit?: boolean
}

export function ApiKeyForm({
  onSubmit,
  onCancel,
  onTest,
  isLoading = false,
  isTesting = false,
  testResult,
  initialData,
  isEdit = false
}: ApiKeyFormProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState(initialData?.apiKey || '')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<CreateApiKeyRequest | UpdateApiKeyRequest>({
    resolver: zodResolver(isEdit ? updateApiKeySchema : createApiKeySchema),
    defaultValues: {
      keyName: initialData?.keyName || '',
      apiKey: initialData?.apiKey || ''
    }
  })

  const watchedApiKey = watch('apiKey')

  const handleTest = () => {
    if (watchedApiKey && onTest) {
      onTest(watchedApiKey)
    }
  }

  const onFormSubmit = (data: CreateApiKeyRequest | UpdateApiKeyRequest) => {
    onSubmit(data)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {isEdit ? 'تعديل مفتاح API' : 'إضافة مفتاح API جديد'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isEdit 
            ? 'قم بتعديل تفاصيل مفتاح API'
            : 'أدخل مفتاح Gemini API الخاص بك'
          }
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Key Name */}
          <div>
            <label htmlFor="keyName" className="block text-sm font-medium text-foreground mb-2">
              اسم المفتاح *
            </label>
            <Input
              id="keyName"
              {...register('keyName')}
              placeholder="مثال: مفتاح الإنتاج، مفتاح التطوير..."
            />
            {errors.keyName && (
              <p className="text-sm text-destructive mt-1">{errors.keyName.message}</p>
            )}
          </div>

          {/* API Key */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-foreground mb-2">
              مفتاح API *
            </label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                {...register('apiKey')}
                placeholder="AIzaSy..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.apiKey && (
              <p className="text-sm text-destructive mt-1">{errors.apiKey.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              يجب أن يبدأ مفتاح API بـ "AIza" ويحتوي على 39 حرف
            </p>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-3 rounded-lg border ${
              testResult.isValid 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                {testResult.isValid ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {testResult.isValid ? 'مفتاح API صحيح' : 'مفتاح API غير صحيح'}
                </span>
              </div>
              <p className="text-sm mt-1">{testResult.message}</p>
            </div>
          )}

          {/* Test Button */}
          {watchedApiKey && watchedApiKey.length > 0 && (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={isTesting || isLoading}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الاختبار...
                  </>
                ) : (
                  'اختبار المفتاح'
                )}
              </Button>
            </div>
          )}

          {/* API Key Format Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">
              كيفية الحصول على مفتاح API:
            </h4>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>اذهب إلى <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></li>
              <li>سجل الدخول بحساب Google الخاص بك</li>
              <li>انقر على "Create API Key"</li>
              <li>انسخ المفتاح المولد</li>
              <li>الصق المفتاح في الحقل أعلاه</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                إلغاء
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'جاري التحديث...' : 'جاري الحفظ...'}
                </>
              ) : (
                isEdit ? 'تحديث المفتاح' : 'حفظ المفتاح'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

