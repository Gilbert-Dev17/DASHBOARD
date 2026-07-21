"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import { HelpCircle } from "lucide-react"
import type { CategorySummary } from "@/types/expenses"
import { formatCurrency } from "@/utils/currency"

import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '@/lib/constants/categories'

const parseCategoryTotal = (total: string | number) => {
  if (typeof total === "number") {
    return total
  }

  return Number(String(total).replace(/[^0-9.-]/g, "")) || 0
}

interface ChartPieDonutTextProps {
  categories: CategorySummary[];
}

export function ChartPieDonutText({ categories }: ChartPieDonutTextProps) {
  const chartData = React.useMemo(
    () =>
      categories.map((category, index) => ({
        category: category.name,
        amount: parseCategoryTotal(category.total || 0),
        fill: category.color || AVAILABLE_COLORS[index % AVAILABLE_COLORS.length],
        icon: category.icon,
      })),
    [categories]
  )

  const chartConfig = React.useMemo(
    () =>
      categories.reduce<Record<string, { label: string; color: string; icon: React.ComponentType<any> }>>(
        (acc, category, index) => {
          const iconObj = category.icon ? AVAILABLE_ICONS.find(i => i.name === category.icon) : null;
          acc[category.name] = {
            label: category.name,
            color: category.color || AVAILABLE_COLORS[index % AVAILABLE_COLORS.length],
            icon: (iconObj?.icon || HelpCircle) as React.ComponentType<any>,
          }
          return acc
        },
        {} as Record<string, { label: string; color: string; icon: React.ComponentType<any> }>
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
            <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                innerRadius={60}
                strokeWidth={5}
                cornerRadius={8}
                paddingAngle={4}
            >
            </Pie>
            <ChartTooltip
                content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const iconObj = data.icon ? AVAILABLE_ICONS.find((i: any) => i.name === data.icon) : null;
                        const Icon = iconObj?.icon || HelpCircle;
                        return (
                        <div className="bg-background/95 border border-border/50 p-3 rounded-lg shadow-xl backdrop-blur-sm flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-secondary/30 flex items-center justify-center">
                                    <Icon size={12} className="text-muted-foreground" />
                                </div>
                                <span className="text-xs font-medium text-foreground">{data.category}</span>
                            </div>
                            <span className="text-sm font-mono font-bold text-foreground">
                                {formatCurrency(data.amount || 0, 'PHP')}
                            </span>
                        </div>
                        )
                    }
                    return null
                }}
            />
          </PieChart>
        </ChartContainer>
      </div>
    </section>
  )
}
