"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm text-gray-900" style={{ color: entry.color }}>
          {entry.name === "ventes" ? "Ventes" : "Dépenses"}:{" "}
          {new Intl.NumberFormat("fr-FR").format(entry.value)} FCFA
        </p>
      ))}
    </div>
  );
}

function CustomPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) {
  if (!active || !payload || !payload[0]) return null;
  const data = payload[0];
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-gray-900" style={{ color: data.payload.color }}>
        {data.name}
      </p>
      <p className="text-xs text-gray-600">
        {new Intl.NumberFormat("fr-FR").format(data.value)} FCFA
      </p>
    </div>
  );
}

function CustomLegend({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>;
}) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-500">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

interface MonthlyDataPoint {
  mois: string;
  ventes: number;
  depenses: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

export function RevenueChart({ data }: { data: MonthlyDataPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Ventes vs Dépenses (6 derniers mois)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
              />
              <XAxis
                dataKey="mois"
                tick={{ fill: "#6B7280", fontSize: 12 }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  `${(value / 1000).toFixed(0)}k`
                }
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar
                dataKey="ventes"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="depenses"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-emerald-500" />
            <span className="text-xs text-gray-500">Ventes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-red-500" />
            <span className="text-xs text-gray-500">Dépenses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryChart({ data }: { data: CategoryDataPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Répartition par catégorie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
