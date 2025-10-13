import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Agent } from '../../types/agent.types'
import { formatAgentType, getStatusColor } from '../../utils/formatters'
import { Activity, Settings, TestTube, BarChart3 } from 'lucide-react'

interface AgentCardProps {
  agent: Agent
  onSelect?: (agent: Agent) => void
  onConfigure?: (agent: Agent) => void
  onTest?: (agent: Agent) => void
  onViewStats?: (agent: Agent) => void
  showActions?: boolean
}

export function AgentCard({
  agent,
  onSelect,
  onConfigure,
  onTest,
  onViewStats,
  showActions = true
}: AgentCardProps) {
  const handleSelect = () => {
    onSelect?.(agent)
  }

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    onConfigure?.(agent)
  }

  const handleTest = (e: React.MouseEvent) => {
    e.stopPropagation()
    onTest?.(agent)
  }

  const handleViewStats = (e: React.MouseEvent) => {
    e.stopPropagation()
    onViewStats?.(agent)
  }

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        agent.isActive ? 'ring-2 ring-primary' : ''
      }`}
      onClick={handleSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{agent.agentName}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={agent.isActive ? 'default' : 'secondary'}>
              {agent.isActive ? 'نشط' : 'غير نشط'}
            </Badge>
            <Badge variant="outline" className={getStatusColor(agent.status)}>
              {agent.status}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatAgentType(agent.agentType)}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Agent Configuration */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">درجة الحرارة:</span>
            <span className="font-medium">{agent.temperature}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">الحد الأقصى للرموز:</span>
            <span className="font-medium">{agent.maxTokens.toLocaleString()}</span>
          </div>
        </div>

        {/* Agent Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">إجمالي الطلبات:</span>
            <span className="font-medium">{agent.stats.totalRequests}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">معدل النجاح:</span>
            <span className="font-medium">
              {(agent.stats.successRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">متوسط وقت الاستجابة:</span>
            <span className="font-medium">
              {agent.stats.averageResponseTime.toFixed(0)}ms
            </span>
          </div>
        </div>

        {/* Last Used */}
        {agent.stats.lastUsedAt && (
          <div className="text-xs text-muted-foreground">
            آخر استخدام: {new Date(agent.stats.lastUsedAt).toLocaleDateString('ar')}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfigure}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-1" />
              إعدادات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              className="flex-1"
            >
              <TestTube className="h-4 w-4 mr-1" />
              اختبار
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewStats}
              className="flex-1"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              إحصائيات
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

