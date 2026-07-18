import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClimateData } from '../types';
import { Thermometer, CloudRain, Sun, CalendarDays } from 'lucide-react';

interface ClimateChartProps {
  data: ClimateData[];
  selectedMonth: string;
  onMonthSelect: (month: string) => void;
}

export default function ClimateChart({ data, selectedMonth, onMonthSelect }: ClimateChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('monthly');

  useEffect(() => {
    // Trigger entrance animations
    setIsLoaded(true);
  }, []);

  // Reset hovered index on view mode or month change
  useEffect(() => {
    setHoveredIndex(null);
  }, [viewMode, selectedMonth]);

  // Find selected monthly baseline to feed daily mock data generator
  const activeMonthData = data.find(item => item.month === selectedMonth) || data[0] || { temperature: 15, precipitation: 100 };
  const baseTemp = activeMonthData.temperature;
  const basePrecip = activeMonthData.precipitation;

  // Generate 30 days of dynamic daily mock climate data based on selected monthly baseline
  const dailyData = React.useMemo(() => {
    const list = [];
    const monthNum = parseInt(selectedMonth) || 7; // Fallback to July-like baseline index

    for (let d = 1; d <= 30; d++) {
      // Create temperature curve: baseTemp + natural sine variation + micro fluctuation
      const tempVariation = Math.sin((d / 30) * Math.PI * 2) * 3.5 + Math.sin(d * 1.7 + monthNum) * 1.5;
      const temperature = Math.round((baseTemp + tempVariation) * 10) / 10;

      // Concentrated rainfall mock algorithm: distributes monthly baseline precipitation into 4-5 rainy days
      const rainScore = Math.sin(d * 0.9 + monthNum * 1.2);
      let precipitation = 0;
      if (rainScore > 0.6) {
        // Heavy precipitation days
        const rawPrecip = (basePrecip / 4) * (0.6 + Math.cos(d * 2.1) * 0.4);
        precipitation = Math.round(Math.max(0, rawPrecip) * 10) / 10;
      } else if (rainScore > 0.3) {
        // Light shower days
        const rawPrecip = (basePrecip / 12) * (0.4 + Math.sin(d * 1.4) * 0.3);
        precipitation = Math.round(Math.max(0, rawPrecip) * 10) / 10;
      }

      list.push({
        day: d,
        temperature,
        precipitation,
      });
    }
    return list;
  }, [selectedMonth, baseTemp, basePrecip]);

  // Define dynamic plotting points mapping
  interface PlotPoint {
    label: string;
    temperature: number;
    precipitation: number;
    originalKey: string;
  }

  const points: PlotPoint[] = React.useMemo(() => {
    if (viewMode === 'monthly') {
      return data.map(d => ({
        label: d.month,
        temperature: d.temperature,
        precipitation: d.precipitation,
        originalKey: d.month,
      }));
    } else {
      return dailyData.map(d => ({
        label: `${selectedMonth} ${d.day}일`,
        temperature: d.temperature,
        precipitation: d.precipitation,
        originalKey: `${d.day}일`,
      }));
    }
  }, [viewMode, data, dailyData, selectedMonth]);

  // Dimensions
  const width = 580;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 40;
  const paddingTop = 20;
  const paddingBottom = 45; // Increased to completely avoid X-axis text clipping

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Scales & Bounds
  const minTemp = -10;
  const maxTemp = 40;
  const tempRange = maxTemp - minTemp;

  // Adapt precipitation limit to view mode (monthly scale is up to 350mm, daily spikes scale around 80mm)
  const maxPrecip = React.useMemo(() => {
    if (viewMode === 'monthly') {
      return 350;
    } else {
      const maxDaily = Math.max(...dailyData.map(d => d.precipitation));
      return Math.max(40, Math.round(maxDaily * 1.2));
    }
  }, [viewMode, dailyData]);

  const getX = (index: number) => {
    if (points.length <= 1) return paddingLeft;
    return paddingLeft + (index / (points.length - 1)) * chartWidth;
  };

  const getYPrecip = (val: number) => {
    return height - paddingBottom - (val / maxPrecip) * chartHeight;
  };

  const getYTemp = (val: number) => {
    const ratio = (val - minTemp) / tempRange;
    return height - paddingBottom - ratio * chartHeight;
  };

  const handleItemSelect = (pt: PlotPoint) => {
    if (viewMode === 'monthly') {
      onMonthSelect(pt.originalKey);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs relative flex flex-col h-full justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">기후 변화 및 기상 분석</h3>
            <p className="text-xxs text-slate-500">
              {viewMode === 'monthly' ? '월간 평균 기온 (라인) 및 강수량' : `${selectedMonth} 세부 일간 기온 변화 및 강수량`}
            </p>
          </div>
        </div>
        
        {/* Toggle Mode & Legends */}
        <div className="flex items-center gap-4">
          {/* Monthly / Daily Segment Tab */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-white text-emerald-800 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              월간
            </button>
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-white text-emerald-800 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              일간
            </button>
          </div>

          {/* Legends */}
          <div className="hidden sm:flex items-center gap-3 text-xxs font-medium">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-sky-200/90 border border-sky-400/30 inline-block"></span>
              <span className="text-slate-600">강수량 (mm)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-rose-500 inline-block relative after:content-[''] after:absolute after:w-1.5 after:h-1.5 after:bg-rose-500 after:rounded-full after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2"></span>
              <span className="text-slate-600">기온 (°C)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative flex-1 min-h-[140px] select-none">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = height - paddingBottom - ratio * chartHeight;
            const precipVal = Math.round(ratio * maxPrecip);
            const tempVal = Math.round(minTemp + ratio * tempRange);

            return (
              <g key={i} className="opacity-60">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Temp Left Label */}
                <text x={paddingLeft - 8} y={y + 3} className="text-[9px] font-medium fill-slate-400 text-right" textAnchor="end">
                  {tempVal}°C
                </text>
                {/* Precip Right Label */}
                <text x={width - paddingRight + 8} y={y + 3} className="text-[9px] font-medium fill-slate-400 text-start" textAnchor="start">
                  {precipVal}
                </text>
              </g>
            );
          })}

          {/* Bar Charts for Precipitation */}
          {points.map((pt, idx) => {
            const x = getX(idx);
            const yPrecip = getYPrecip(pt.precipitation);
            const barWidth = viewMode === 'monthly' ? 14 : 5;
            const isSelected = viewMode === 'monthly' && pt.originalKey === selectedMonth;

            return (
              <g key={`bar-${idx}`} className="cursor-pointer" onClick={() => handleItemSelect(pt)}>
                {/* Highlight background column */}
                <rect
                  x={x - barWidth}
                  y={paddingTop}
                  width={barWidth * 2}
                  height={chartHeight}
                  className={`fill-transparent transition-colors duration-200 ${
                    isSelected ? 'fill-emerald-50/20' : hoveredIndex === idx ? 'fill-slate-50/40' : ''
                  }`}
                />

                {/* Actual Bar */}
                <motion.rect
                  x={x - barWidth / 2}
                  y={yPrecip}
                  width={barWidth}
                  height={Math.max(0, height - paddingBottom - yPrecip)}
                  rx={viewMode === 'monthly' ? '2' : '1'}
                  className={`transition-colors duration-300 ${
                    isSelected 
                      ? 'fill-sky-400/90 stroke-sky-500/50' 
                      : hoveredIndex === idx 
                        ? 'fill-sky-300/80 stroke-sky-400/40' 
                        : 'fill-sky-200/60 stroke-sky-300/30'
                  }`}
                  strokeWidth="1"
                  initial={{ height: 0, y: height - paddingBottom }}
                  animate={isLoaded ? { 
                    height: Math.max(0, height - paddingBottom - yPrecip),
                    y: yPrecip 
                  } : {}}
                  transition={{ duration: 0.8, delay: idx * (viewMode === 'monthly' ? 0.03 : 0.005), ease: 'easeOut' }}
                />
              </g>
            );
          })}

          {/* Line Chart for Temperature */}
          <g>
            {points.map((pt, idx) => {
              if (idx === 0) return null;
              const prevPt = points[idx - 1];
              const x1 = getX(idx - 1);
              const y1 = getYTemp(prevPt.temperature);
              const x2 = getX(idx);
              const y2 = getYTemp(pt.temperature);

              return (
                <motion.line
                  key={`line-segment-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#F43F5E"
                  strokeWidth={viewMode === 'monthly' ? '1.5' : '1.2'}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={isLoaded ? { pathLength: 1 } : {}}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                />
              );
            })}

            {/* Dots on Temperature Line */}
            {points.map((pt, idx) => {
              const x = getX(idx);
              const y = getYTemp(pt.temperature);
              const isSelected = viewMode === 'monthly' && pt.originalKey === selectedMonth;

              // Hide or shrink dots in daily view to avoid visual clutter
              const dotRadius = viewMode === 'monthly' 
                ? (isSelected ? 5.5 : hoveredIndex === idx ? 4.5 : 3.5)
                : (hoveredIndex === idx ? 4 : 1.5);

              return (
                <g key={`dot-${idx}`} className="cursor-pointer" onClick={() => handleItemSelect(pt)}>
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={dotRadius}
                    className={`transition-all duration-200 ${
                      isSelected 
                        ? 'fill-rose-600 stroke-white stroke-[1.5] shadow-sm' 
                        : hoveredIndex === idx 
                          ? 'fill-rose-500 stroke-rose-100 stroke-1' 
                          : viewMode === 'monthly' 
                            ? 'fill-white stroke-rose-500 stroke-[1.5]'
                            : 'fill-rose-500'
                    }`}
                    initial={{ scale: 0 }}
                    animate={isLoaded ? { scale: 1 } : {}}
                    transition={{ delay: 0.5 + idx * (viewMode === 'monthly' ? 0.02 : 0.003) }}
                  />
                </g>
              );
            })}
          </g>

          {/* X Axis Labels (Clipping fixed & conditional rendering to avoid clutter) */}
          {points.map((pt, idx) => {
            const x = getX(idx);
            const isSelected = viewMode === 'monthly' && pt.originalKey === selectedMonth;

            // Monthly: Render all. Daily: Render 1일, 5일, 10일, 15일, 20일, 25일, 30일 to prevent overlap.
            const shouldRenderLabel = viewMode === 'monthly' || ((idx + 1) === 1 || (idx + 1) % 5 === 0);
            if (!shouldRenderLabel) return null;

            return (
              <text
                key={`label-${idx}`}
                x={x}
                y={height - 15} // Safely aligned inside paddingBottom (45) bounds
                textAnchor="middle"
                onClick={() => handleItemSelect(pt)}
                className={`text-[9.5px] font-semibold cursor-pointer transition-colors duration-200 ${
                  isSelected ? 'fill-emerald-700 font-bold' : 'fill-slate-500 hover:fill-slate-800'
                }`}
              >
                {viewMode === 'monthly' ? pt.label : `${idx + 1}일`}
              </text>
            );
          })}

          {/* Mouse interactive areas */}
          {points.map((pt, idx) => {
            const x = getX(idx);
            const colWidth = chartWidth / (points.length - 1);
            return (
              <rect
                key={`trigger-${idx}`}
                x={x - colWidth / 2}
                y={paddingTop}
                width={colWidth}
                height={chartHeight}
                className="fill-transparent cursor-pointer opacity-0"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleItemSelect(pt)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        <AnimatePresence>
          {hoveredIndex !== null && points[hoveredIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="absolute z-10 bg-slate-800/95 text-white text-[11px] p-2.5 rounded-lg shadow-md border border-slate-700/80 pointer-events-none flex flex-col gap-1 min-w-[125px]"
              style={{
                left: `${Math.min(
                  85,
                  Math.max(15, (getX(hoveredIndex) / width) * 100)
                )}%`,
                top: '5px',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="font-bold border-b border-slate-700/60 pb-1 flex items-center justify-between gap-2">
                <span>{points[hoveredIndex].label}</span>
                {viewMode === 'monthly' && points[hoveredIndex].originalKey === selectedMonth && (
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-400 px-1 rounded-sm">선택됨</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-rose-300">
                <Thermometer className="w-3.5 h-3.5" />
                <span>평균기온: <strong>{points[hoveredIndex].temperature}°C</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-300">
                <CloudRain className="w-3.5 h-3.5" />
                <span>강수량: <strong>{points[hoveredIndex].precipitation}mm</strong></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Month Indicator/Banner */}
      <div className="text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 flex items-center justify-between mt-1 shrink-0">
        <span className="font-medium">
          {viewMode === 'monthly' ? (
            <>현재 분석 필터: <strong className="text-emerald-700">{selectedMonth}</strong> (클릭 시 월간 트렌드 동기화)</>
          ) : (
            <>조회 중: <strong className="text-emerald-700">{selectedMonth} 일별 모니터링</strong> (사인웨이브 시뮬레이션)</>
          )}
        </span>
        <span className="text-xxs hidden md:inline">
          {viewMode === 'monthly' ? '월별 막대를 클릭하여 필터를 변경할 수 있습니다.' : '월간 탭을 눌러 전체 보기로 전환할 수 있습니다.'}
        </span>
      </div>
    </div>
  );
}

