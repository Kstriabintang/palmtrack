import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkline } from '@/components/sparkline'

export interface StatCardProps {
  label: string
  value: string
  hint?: string
  delta?: string
  icon: LucideIcon
  tone?: string
  trend?: number[]
  trendColor?: string
}

export function StatCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  tone = 'bg-primary/10 text-primary',
  trend,
  trendColor = 'var(--color-primary)',
}: StatCardProps) {
  const isDown = delta?.startsWith('-')

  return (
    <Card>
      <CardContent className="flex items-start gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="size-5" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            {delta && (
              <Badge
                variant="outline"
                className={
                  isDown
                    ? 'border-transparent bg-destructive/10 text-destructive'
                    : 'border-transparent bg-primary/10 text-primary'
                }
              >
                {isDown ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />}
                {delta}
              </Badge>
            )}
          </div>
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
          <div className="flex items-end justify-between gap-2">
            {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : <span />}
            {trend && <Sparkline data={trend} color={trendColor} className="h-6 w-16 shrink-0" />}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
