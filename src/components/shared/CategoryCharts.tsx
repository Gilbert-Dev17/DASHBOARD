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

import {DrumstickIcon, ShoppingBag, Tv, Heart, ShoppingBasket, BusFront, School} from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  'foods-drinks': DrumstickIcon,
  'shopping': ShoppingBag,
  'entertainment': Tv,
  'date': Heart,
  'groceries': ShoppingBasket,
  'transport': BusFront,
  'school': School,
};

interface ChartPieDonutTextProps {
  categories: CategorySummary[];
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
        amount: parseCategoryTotal(category.total || 0),
        fill: CHART_COLORS[index % CHART_COLORS.length],
        icon: category.icon,
      })),
    [categories]
  )

  const chartConfig = React.useMemo(
    () =>
      categories.reduce<Record<string, { label: string; color: string; icon: React.ComponentType<any> }>>(
        (acc, category, index) => {
          acc[category.name] = {
            label: category.name,
            color: CHART_COLORS[index % CHART_COLORS.length],
            icon: (category.icon ? (ICON_MAP[category.icon] || HelpCircle) : HelpCircle) as React.ComponentType<any>,
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
                            className="fill-foreground text-lg font-mono"
                            >
                            {formatCurrency(totalAmount, 'PHP')}
                            </tspan>
                        </text>
                        )
                    }
                    }}
                />
            </Pie>
            <ChartTooltip
                content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const Icon = ICON_MAP[data.icon] || HelpCircle;
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
