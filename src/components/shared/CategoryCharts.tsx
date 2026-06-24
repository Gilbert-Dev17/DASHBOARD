"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { type LucideIcon } from "lucide-react"

type CategoryChartItem = {
  name: string
  total: string | number
  icon?: LucideIcon
}

interface ChartPieDonutTextProps {
  categories: CategoryChartItem[]
}

const CHART_COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#22d3ee",
  "#ef4444",
  "#8b5cf6",
]

const parseCategoryTotal = (total: string | number) => {
  if (typeof total === "number") {
    return total
  }

  return Number(String(total).replace(/[^0-9.-]/g, "")) || 0
}

export function ChartPieDonutText({ categories }: ChartPieDonutTextProps) {
  const chartData = React.useMemo(
    () =>
      categories.map((category, index) => ({
        category: category.name,
        amount: parseCategoryTotal(category.total),
        fill: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [categories]
  )

  const chartConfig = React.useMemo(
    () =>
      categories.reduce<Record<string, { label: string; color: string; icon?: LucideIcon }>>(
        (acc, category, index) => {
          acc[category.name] = {
            label: category.name,
            color: CHART_COLORS[index % CHART_COLORS.length],
            icon: category.icon,
          }
          return acc
        },
        {} as Record<string, { label: string; color: string; icon?: LucideIcon }>
      ) satisfies ChartConfig,
    [categories]
  )

  const totalAmount = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.amount, 0),
    [chartData]
  )

  return (
    <section className="flex flex-col border-0">
      <div className="flex-1 pb-0 border-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-62.5"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => {
                        if (typeof name !== "string") return null

                        const config = chartConfig[name]
                        const Icon = config?.icon
                        return (
                        <div className="flex items-center gap-2">
                            {Icon && <Icon size={14} />} :
                            <span className="tabular-nums">${Number(value).toLocaleString()}</span>
                        </div>
                        )
                    }}
                    />
                }
            />
            <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                innerRadius={60}
                strokeWidth={5}
                cornerRadius={8}
                paddingAngle={4}
                >
                <Label
                    content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                        <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 12}
                            className="fill-muted-foreground text-sm tracking-widest uppercase"
                            >
                            Total
                            </tspan>
                            <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 16}
                            className="fill-foreground text-3xl font-bold"
                            >
                            ${totalAmount.toLocaleString()}
                            </tspan>
                        </text>
                        )
                    }
                    }}
                />
                </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    </section>
  )
}
