import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

interface DonutDatum {
  label: string
  value: number
  pct: number
  color: string
}

interface DonutSummaryProps {
  data: DonutDatum[]
  centerValue: string
  centerLabel: string
  valueSuffix?: string
}

export function DonutSummary({ data, centerValue, centerLabel, valueSuffix = '' }: DonutSummaryProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative size-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={38}
              outerRadius={58}
              paddingAngle={2}
              stroke="var(--color-card)"
              strokeWidth={2}
            >
              {data.map((item) => (
                <Cell key={item.label} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-semibold tracking-tight">{centerValue}</span>
          <span className="text-[10px] text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className="text-muted-foreground">
              {item.value.toLocaleString('id-ID')}
              {valueSuffix} · {item.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
