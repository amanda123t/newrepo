"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { INDICATOR_TYPE_LABELS } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function IndicatorsPage() {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndicators = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/indicators");
        if (res.ok) setIndicators(await res.json());
      } finally {
        setLoading(false);
      }
    };
    fetchIndicators();
  }, []);

  const getProgress = (ind: any) => {
    if (!ind.target || ind.current === null) return null;
    return Math.min(100, (ind.current / ind.target) * 100);
  };

  const getTrend = (measurements: any[]) => {
    if (measurements.length < 2) return null;
    const last = measurements[measurements.length - 1].value;
    const prev = measurements[measurements.length - 2].value;
    const diff = ((last - prev) / prev) * 100;
    return diff;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Indicadores de Processo</h2>
        <p className="text-slate-500 text-sm">{indicators.length} indicador(es) monitorado(s)</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : indicators.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500">Nenhum indicador cadastrado</p>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre indicadores dentro de cada processo
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {indicators.map((ind) => {
            const measurements = ind.measurements || [];
            const chartData = measurements.map((m: any) => ({
              date: format(new Date(m.measuredAt), "MMM/yy", { locale: ptBR }),
              value: parseFloat(m.value.toFixed(2)),
            }));
            const progress = getProgress(ind);
            const trend = getTrend(measurements);

            return (
              <Card key={ind.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">{ind.name}</CardTitle>
                      <p className="text-xs text-indigo-600 mt-0.5">{ind.process?.name}</p>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 text-xs">
                      {INDICATOR_TYPE_LABELS[ind.type]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-slate-900">
                        {ind.current !== null ? Number(ind.current).toFixed(1) : "—"}
                        {ind.unit && (
                          <span className="text-base font-normal text-slate-400 ml-1">{ind.unit}</span>
                        )}
                      </div>
                      {ind.target && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          Meta: {ind.target} {ind.unit}
                        </div>
                      )}
                    </div>
                    {trend !== null && (
                      <div className={`flex items-center gap-1 text-sm font-semibold ${
                        trend > 0 ? "text-red-500" : trend < 0 ? "text-emerald-500" : "text-slate-400"
                      }`}>
                        {trend > 0 ? <TrendingUp size={16} /> : trend < 0 ? <TrendingDown size={16} /> : <Minus size={16} />}
                        {Math.abs(trend).toFixed(1)}%
                      </div>
                    )}
                  </div>

                  {progress !== null && (
                    <div>
                      <Progress
                        value={progress}
                        indicatorClassName={
                          progress >= 100
                            ? "bg-emerald-500"
                            : progress >= 70
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }
                      />
                    </div>
                  )}

                  {chartData.length > 1 && (
                    <ResponsiveContainer width="100%" height={110}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 9, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 9, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{ fontSize: "11px", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={{ r: 3, fill: "#6366f1" }}
                          activeDot={{ r: 4 }}
                        />
                        {ind.target && (
                          <Line
                            type="monotone"
                            dataKey={() => ind.target}
                            stroke="#10b981"
                            strokeDasharray="4 2"
                            strokeWidth={1.5}
                            dot={false}
                            name="Meta"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  {chartData.length <= 1 && (
                    <div className="flex items-center justify-center h-20 bg-slate-50 rounded-lg text-xs text-slate-400">
                      Aguardando mais medições para exibir evolução
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
