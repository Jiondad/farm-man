import React, { useState, useMemo } from 'react';
import { ClimateData } from '../types';
import { Thermometer, Eye, EyeOff, CalendarDays, Droplets, CloudRain } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ClimateChartProps {
  data: ClimateData[];
  dailyData?: any[];
  selectedMonth: string;
  onMonthSelect: (month: string) => void;
}

export default function ClimateChart({ data = [], dailyData = [], selectedMonth, onMonthSelect }: ClimateChartProps) {
  const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('monthly');
  const [showTemperature, setShowTemperature] = useState<boolean>(true);
  const [showAvgTemperature, setShowAvgTemperature] = useState<boolean>(true);
  const [showPrecipitation, setShowPrecipitation] = useState<boolean>(true);
  const [showHumidity, setShowHumidity] = useState<boolean>(true);

  const fallbackDailyData = useMemo(() => {
    const list = [];
    for (let d = 1; d <= 30; d++) {
      list.push({ name: `${d}일`, label: `${d}일`, temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0, originalKey: `${d}일` });
    }
    return list;
  }, []);

  const chartData = useMemo(() => {
    const fallbackData = Array.isArray(data) ? data : [];
    if (viewMode === 'monthly') {
      return fallbackData.map(d => ({
        name: d?.month || '',
        label: d?.month || '',
        temperature: typeof d?.temperature === 'number' ? d.temperature : 0,
        avgTemperature: typeof d?.avgTemperature === 'number' ? d.avgTemperature : 0,
        precipitation: typeof d?.precipitation === 'number' ? d.precipitation : 0,
        humidity: typeof d?.humidity === 'number' ? d.humidity : 0,
        originalKey: d?.month || '',
      }));
    } else {
      if (Array.isArray(dailyData) && dailyData.length > 0) { return dailyData; }
      return fallbackDailyData;
    }
  }, [viewMode, data, dailyData, fallbackDailyData]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col h-full justify-center items-center min-h-[250px]">
        <CalendarDays className="w-8 h-8 text-slate-300 mb-2" />
        <span className="text-xs text-slate-400 font-medium">데이터가 없습니다.</span>
      </div>
    );
  }

  const formatXAxis = (value: string, index: number) => {
    if (viewMode === 'monthly') return value;
    const dayNum = index + 1;
    if (dayNum === 1 || dayNum % 5 === 0) { return value; }
    return '';
  };

  const handleChartClick = (state: any) => {
    if (viewMode === 'monthly' && state && state.activeLabel) {
      onMonthSelect(state.activeLabel); // Ex: "7월"
      setViewMode('daily'); // 클릭 시 해당 월의 상세 일별 보기로 자동 전환 (UX 개선)
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 text-white text-[11px] p-2.5 rounded-lg shadow-md border border-slate-700/60 flex flex-col gap-1 min-w-[150px] backdrop-blur-xs">
          <div className="font-bold border-b border-slate-700/50 pb-1 mb-1 text-slate-300">
            {viewMode === 'monthly' ? label : `${selectedMonth}월 ${label}`}
          </div>
          {payload.map((p: any) => {
            let unit = '';
            if (p.dataKey === 'temperature' || p.dataKey === 'avgTemperature') { unit = '°C'; }
            else if (p.dataKey === 'precipitation') { unit = 'mm'; }
            else if (p.dataKey === 'humidity') { unit = '%'; }
            return (
              <div key={p.dataKey} className="flex items-center justify-between gap-4">
                <span className="text-slate-400 font-medium">{p.name}:</span>
                <span className="font-extrabold" style={{ color: p.stroke || p.fill || p.color }}>
                  {p.value}{unit}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col h-full justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><CalendarDays className="w-4 h-4" /></div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">임업 기후 복합 통계 및 모니터링</h3>
            <p className="text-[10px] text-slate-500">{viewMode === 'monthly' ? '월별 기상 데이터' : `${selectedMonth}월 세부 일별 기상 지표 종합 변동`}</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0 self-start sm:self-center">
          <button type="button" onClick={() => setViewMode('monthly')} className={`px-3 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${viewMode === 'monthly' ? 'bg-white text-emerald-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}>월간 분석</button>
          <button type="button" onClick={() => setViewMode('daily')} className={`px-3 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${viewMode === 'daily' ? 'bg-white text-emerald-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}>일간 정밀분석</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3 shrink-0">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">모니터링 지표:</span>
        <button type="button" onClick={() => setShowTemperature(prev => !prev)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${showTemperature ? 'bg-rose-50 border-rose-200 text-rose-700 font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          {showTemperature ? <><Eye className="w-3 h-3" /><Thermometer className="w-3 h-3 text-rose-500" /></> : <><EyeOff className="w-3 h-3" /><Thermometer className="w-3 h-3 text-slate-300" /></>}
          <span>기온 (°C)</span>
        </button>
        <button type="button" onClick={() => setShowAvgTemperature(prev => !prev)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${showAvgTemperature ? 'bg-amber-50 border-amber-200 text-amber-700 font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          {showAvgTemperature ? <><Eye className="w-3 h-3" /><Thermometer className="w-3 h-3 text-amber-500" /></> : <><EyeOff className="w-3 h-3" /><Thermometer className="w-3 h-3 text-slate-300" /></>}
          <span>평균 기온 (°C)</span>
        </button>
        <button type="button" onClick={() => setShowPrecipitation(prev => !prev)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${showPrecipitation ? 'bg-cyan-50 border-cyan-200 text-cyan-700 font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          {showPrecipitation ? <><Eye className="w-3 h-3" /><CloudRain className="w-3 h-3 text-cyan-500" /></> : <><EyeOff className="w-3 h-3" /><CloudRain className="w-3 h-3 text-slate-300" /></>}
          <span>강수량 (mm)</span>
        </button>
        <button type="button" onClick={() => setShowHumidity(prev => !prev)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${showHumidity ? 'bg-sky-50 border-sky-200 text-sky-700 font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          {showHumidity ? <><Eye className="w-3 h-3" /><Droplets className="w-3 h-3 text-sky-500" /></> : <><EyeOff className="w-3 h-3" /><Droplets className="w-3 h-3 text-slate-300" /></>}
          <span>습도 (%)</span>
        </button>
      </div>

      <div className="flex-1 min-h-[160px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} onClick={handleChartClick} margin={{ top: 10, right: 10, left: -15, bottom: 5 }} className="cursor-pointer">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} tickFormatter={formatXAxis} interval={0} />
            <YAxis yAxisId="left" domain={[-10, 40]} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 9, fontWeight: 'bold' }} unit="°C" />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 9, fontWeight: 'bold' }} unit={viewMode === 'monthly' ? 'mm' : '%'} />
            <Tooltip content={<CustomTooltip />} />
            {showPrecipitation && <Bar yAxisId="right" dataKey="precipitation" name="강수량" fill="#22d3ee" fillOpacity={0.6} stroke="#0891b2" strokeWidth={1} barSize={viewMode === 'monthly' ? 24 : 6} />}
            {showTemperature && <Line yAxisId="left" type="monotone" dataKey="temperature" name="최고 기온" stroke="#ef4444" strokeWidth={2.5} dot={{ r: viewMode === 'monthly' ? 3.5 : 1.5, stroke: '#ef4444', strokeWidth: 1.5, fill: '#fff' }} activeDot={{ r: 5 }} />}
            {showAvgTemperature && <Line yAxisId="left" type="monotone" dataKey="avgTemperature" name="평균 기온" stroke="#f59e0b" strokeWidth={2} dot={{ r: viewMode === 'monthly' ? 3 : 1, stroke: '#f59e0b', strokeWidth: 1.5, fill: '#fff' }} activeDot={{ r: 4 }} />}
            {showHumidity && <Line yAxisId="right" type="monotone" dataKey="humidity" name="습도" stroke="#0ea5e9" strokeWidth={2} dot={{ r: viewMode === 'monthly' ? 3.5 : 1.5, stroke: '#0ea5e9', strokeWidth: 1.5, fill: '#fff' }} activeDot={{ r: 5 }} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}