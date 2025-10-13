import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Plus, X, Loader2 } from 'lucide-react'
import { CreateCreativeBriefRequest } from '../../types/session.types'
import { creativeBriefSchema } from '../../utils/validators'

interface CreativeBriefFormProps {
  onSubmit: (data: CreateCreativeBriefRequest) => void
  onCancel?: () => void
  isLoading?: boolean
  initialData?: Partial<CreateCreativeBriefRequest>
}

export function CreativeBriefForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData
}: CreativeBriefFormProps) {
  const [themes, setThemes] = useState<string[]>(initialData?.themes || [])
  const [newTheme, setNewTheme] = useState('')
  const [constraints, setConstraints] = useState<string[]>(initialData?.constraints || [])
  const [newConstraint, setNewConstraint] = useState('')
  const [inspirations, setInspirations] = useState<string[]>(initialData?.inspirations || [])
  const [newInspiration, setNewInspiration] = useState('')
  const [goals, setGoals] = useState<string[]>(initialData?.goals || [])
  const [newGoal, setNewGoal] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<CreateCreativeBriefRequest>({
    resolver: zodResolver(creativeBriefSchema),
    defaultValues: {
      coreIdea: initialData?.coreIdea || '',
      genre: initialData?.genre || '',
      targetAudience: initialData?.targetAudience || '',
      themes: initialData?.themes || [],
      constraints: initialData?.constraints || [],
      inspirations: initialData?.inspirations || [],
      goals: initialData?.goals || []
    }
  })

  const addTheme = () => {
    if (newTheme.trim() && !themes.includes(newTheme.trim())) {
      setThemes([...themes, newTheme.trim()])
      setNewTheme('')
    }
  }

  const removeTheme = (theme: string) => {
    setThemes(themes.filter(t => t !== theme))
  }

  const addConstraint = () => {
    if (newConstraint.trim() && !constraints.includes(newConstraint.trim())) {
      setConstraints([...constraints, newConstraint.trim()])
      setNewConstraint('')
    }
  }

  const removeConstraint = (constraint: string) => {
    setConstraints(constraints.filter(c => c !== constraint))
  }

  const addInspiration = () => {
    if (newInspiration.trim() && !inspirations.includes(newInspiration.trim())) {
      setInspirations([...inspirations, newInspiration.trim()])
      setNewInspiration('')
    }
  }

  const removeInspiration = (inspiration: string) => {
    setInspirations(inspirations.filter(i => i !== inspiration))
  }

  const addGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      setGoals([...goals, newGoal.trim()])
      setNewGoal('')
    }
  }

  const removeGoal = (goal: string) => {
    setGoals(goals.filter(g => g !== goal))
  }

  const onFormSubmit = (data: CreateCreativeBriefRequest) => {
    onSubmit({
      ...data,
      themes,
      constraints,
      inspirations,
      goals
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>الموجز الإبداعي</CardTitle>
        <p className="text-sm text-muted-foreground">
          املأ التفاصيل الأساسية لفكرتك الإبداعية
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Core Idea */}
          <div>
            <label htmlFor="coreIdea" className="block text-sm font-medium text-foreground mb-2">
              الفكرة الأساسية *
            </label>
            <textarea
              id="coreIdea"
              {...register('coreIdea')}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="اكتب فكرتك الأساسية هنا... (50 حرف على الأقل)"
            />
            {errors.coreIdea && (
              <p className="text-sm text-destructive mt-1">{errors.coreIdea.message}</p>
            )}
          </div>

          {/* Genre */}
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-foreground mb-2">
              النوع الأدبي *
            </label>
            <Input
              id="genre"
              {...register('genre')}
              placeholder="مثال: خيال علمي، رومانسية، إثارة..."
            />
            {errors.genre && (
              <p className="text-sm text-destructive mt-1">{errors.genre.message}</p>
            )}
          </div>

          {/* Target Audience */}
          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-foreground mb-2">
              الجمهور المستهدف
            </label>
            <Input
              id="targetAudience"
              {...register('targetAudience')}
              placeholder="مثال: البالغون 18-35، القراء الشباب..."
            />
            {errors.targetAudience && (
              <p className="text-sm text-destructive mt-1">{errors.targetAudience.message}</p>
            )}
          </div>

          {/* Themes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              المواضيع *
            </label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                placeholder="أضف موضوع جديد..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTheme())}
              />
              <Button type="button" onClick={addTheme} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {themes.map((theme, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{theme}</span>
                  <button
                    type="button"
                    onClick={() => removeTheme(theme)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {errors.themes && (
              <p className="text-sm text-destructive mt-1">{errors.themes.message}</p>
            )}
          </div>

          {/* Constraints */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              القيود
            </label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newConstraint}
                onChange={(e) => setNewConstraint(e.target.value)}
                placeholder="أضف قيد جديد..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConstraint())}
              />
              <Button type="button" onClick={addConstraint} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {constraints.map((constraint, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1">
                  <span>{constraint}</span>
                  <button
                    type="button"
                    onClick={() => removeConstraint(constraint)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Inspirations */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              المصادر الإلهامية
            </label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newInspiration}
                onChange={(e) => setNewInspiration(e.target.value)}
                placeholder="أضف مصدر إلهام جديد..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInspiration())}
              />
              <Button type="button" onClick={addInspiration} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {inspirations.map((inspiration, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1">
                  <span>{inspiration}</span>
                  <button
                    type="button"
                    onClick={() => removeInspiration(inspiration)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              الأهداف
            </label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="أضف هدف جديد..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
              />
              <Button type="button" onClick={addGoal} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {goals.map((goal, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1">
                  <span>{goal}</span>
                  <button
                    type="button"
                    onClick={() => removeGoal(goal)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
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
                  جاري الحفظ...
                </>
              ) : (
                'حفظ الموجز'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

