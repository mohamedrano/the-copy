import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Idea } from '../../types/idea.types'
import { formatNumber, truncateText } from '../../utils/formatters'
import { BookOpen, Users, Globe, Star, RefreshCw, Eye } from 'lucide-react'

interface IdeaDisplayProps {
  idea: Idea
  onView?: (idea: Idea) => void
  onRegenerate?: (idea: Idea) => void
  onSelect?: (idea: Idea) => void
  isSelected?: boolean
  showActions?: boolean
  compact?: boolean
}

export function IdeaDisplay({
  idea,
  onView,
  onRegenerate,
  onSelect,
  isSelected = false,
  showActions = true,
  compact = false
}: IdeaDisplayProps) {
  const handleView = () => {
    onView?.(idea)
  }

  const handleRegenerate = () => {
    onRegenerate?.(idea)
  }

  const handleSelect = () => {
    onSelect?.(idea)
  }

  return (
    <Card 
      className={`transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${compact ? 'h-full' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{idea.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{idea.genre}</Badge>
            <Badge variant={idea.status === 'completed' ? 'default' : 'secondary'}>
              {idea.status}
            </Badge>
          </div>
        </div>
        {!compact && (
          <p className="text-sm text-muted-foreground">
            {truncateText(idea.content, 150)}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Idea Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              <span className="text-muted-foreground">التعقيد:</span>
              <span className="font-medium mr-1">{idea.complexity}/10</span>
            </div>
            <div className="flex items-center text-sm">
              <BookOpen className="h-4 w-4 mr-1 text-blue-500" />
              <span className="text-muted-foreground">الأصالة:</span>
              <span className="font-medium mr-1">{idea.originality}/10</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-muted-foreground">القابلية للتسويق:</span>
              <span className="font-medium mr-1">{idea.marketability}/10</span>
            </div>
            <div className="flex items-center text-sm">
              <Globe className="h-4 w-4 mr-1 text-purple-500" />
              <span className="text-muted-foreground">الطول المتوقع:</span>
              <span className="font-medium mr-1">{formatNumber(idea.estimatedLength)} كلمة</span>
            </div>
          </div>
        </div>

        {/* Characters */}
        {idea.characters && idea.characters.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">الشخصيات الرئيسية:</h4>
            <div className="flex flex-wrap gap-1">
              {idea.characters.slice(0, 3).map((character) => (
                <Badge key={character.id} variant="outline" className="text-xs">
                  {character.name}
                </Badge>
              ))}
              {idea.characters.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{idea.characters.length - 3} أخرى
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Themes */}
        {idea.themes && idea.themes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">المواضيع:</h4>
            <div className="flex flex-wrap gap-1">
              {idea.themes.slice(0, 3).map((theme, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {theme}
                </Badge>
              ))}
              {idea.themes.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{idea.themes.length - 3} أخرى
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* World Building */}
        {idea.world && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">العالم:</h4>
            <p className="text-sm text-muted-foreground">
              {idea.world.setting?.place} - {idea.world.setting?.time}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              عرض التفاصيل
            </Button>
            {idea.status === 'completed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                إعادة توليد
              </Button>
            )}
            {onSelect && (
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={handleSelect}
                className="flex-1"
              >
                {isSelected ? 'محدد' : 'اختيار'}
              </Button>
            )}
          </div>
        )}

        {/* Status Indicator */}
        {idea.status === 'generating' && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>جاري التوليد...</span>
          </div>
        )}

        {idea.status === 'error' && (
          <div className="text-sm text-destructive">
            حدث خطأ أثناء توليد الفكرة
          </div>
        )}
      </CardContent>
    </Card>
  )
}

