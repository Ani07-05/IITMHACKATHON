"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"

export function ChartContainer({
  children,
  className,
  config,
  ...props
}: React.ComponentProps<typeof ResponsiveContainer> & {
  config: Record<string, { label: string; color: string }>
}) {
  return (
    <ResponsiveContainer {...props} className={cn("w-full h-[350px]", className)}>
      <div>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .recharts-tooltip-cursor {
                fill: hsl(var(--muted));
                opacity: 0.2;
              }
              .recharts-cartesian-axis-line,
              .recharts-cartesian-axis-tick-line {
                stroke: hsl(var(--border));
              }
              .recharts-cartesian-axis-tick-value {
                fill: hsl(var(--muted-foreground));
                font-size: 12px;
              }
              .recharts-legend-item-text {
                fill: hsl(var(--muted-foreground)) !important;
                font-size: 12px;
              }
              ${Object.entries(config)
                .map(
                  ([key, { color }]) => `
                .recharts-layer .${key} {
                  fill: ${color};
                  stroke: ${color};
                }
              `
                )
                .join("")}
            `,
          }}
        />
        {children}
      </div>
    </ResponsiveContainer>
  )
}

export function ChartTooltip({
  active,
  payload,
  label,
  content,
  ...props
}: React.ComponentProps<typeof ChartTooltipContent>) {
  if (!(active && payload && payload.length)) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-2 shadow-sm",
        props.className
      )}
      {...props}
    >
      {content ? (
        content({ active, payload, label: label ?? "" })
      ) : (
        <ChartTooltipContent payload={payload} label={label} />
      )}
    </div>
  )
}

export function ChartTooltipContent({
  payload,
  label,
  labelKey = "name",
  valueKey = "value",
  labelFormatter,
  valueFormatter,
}: {
  active?: boolean
  payload?: Array<{ [key: string]: any }>
  label?: string
  labelKey?: string
  valueKey?: string
  labelFormatter?: (label: string) => string
  valueFormatter?: (value: number) => string
  content?: (props: { active: boolean; payload: any[]; label: string }) => React.ReactNode
  className?: string
}) {
  return (
    <>
      {label && <p className="mb-2 font-medium">{label}</p>}
      {payload?.map((item, index) => (
        <div key={index} className="flex items-center">
          <span
            className="mr-2 h-3 w-3 rounded-full"
            style={{ backgroundColor: item.fill }}
          />
          <span className="mr-2">
            {labelFormatter
              ? labelFormatter(item[labelKey])
              : item[labelKey]}
            :
          </span>
          <span className="font-medium">
            {valueFormatter
              ? valueFormatter(item[valueKey])
              : item[valueKey]}
          </span>
        </div>
      ))}
    </>
  )
}