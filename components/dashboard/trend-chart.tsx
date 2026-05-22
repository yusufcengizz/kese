"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

export interface MonthTrend {
  month: string;
  income: number;
  expense: number;
}

// Course req: Recharts bar chart — Grid layout requirement
export function TrendChart({ data }: { data: MonthTrend[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-serif">Son 6 Ay Trendi</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              formatter={(value, name) => [
                formatMoney(Number(value)),
                name === "income" ? "Gelir" : "Gider",
              ]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Legend
              formatter={(v) => <span className="text-xs">{v === "income" ? "Gelir" : "Gider"}</span>}
            />
            <Bar dataKey="income" fill="var(--color-success)" radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Bar dataKey="expense" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
