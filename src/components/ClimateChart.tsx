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

  useEffect(() => {
    // Trigger entrance animations
    setIsLoaded(true);
  }, []);

  // Dimensions
  const width = 580;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 40;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Scales
  const maxPrecip = 350; // max precipitation scale
  const minTemp = -10;
  const maxTemp = 40;
  const tempRange = maxTemp - minTemp;

  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  const getYPrecip = (val: number) => {
    return height - paddingBottom - (val / maxPrecip) * chartHeight;
  };

  const getYTemp = (val: number) => {
    const ratio = (val - minTemp) / tempRange;
    return height - paddingBottom - ratio * chartHeight;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs relative flex flex-col h-full justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">기후 변화 및 기상 분석</h3>
            <p className="text-xxs text-slate-500">평균 기온 (라인) 및 누적 강수량 (막대) 트렌드</p>
          </div>
        </div>
        
        {/* Legends */}
        <div className="flex items-center gap-3 text-xxs font-medium">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-200/90 border border-sky-400/30 inline-block"></span>
            <span className="text-slate-600">강수량 (mm)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-rose-500 inline-block relative after:content-[''] after:absolute after:w-1.5 after:h-1.5 after:bg-rose-500 after:rounded-full after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2"></span>
            <span className="text-slate-600">평균기온 (°C)</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
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
          {data.map((item, idx) => {
            const x = getX(idx);
            const yPrecip = getYPrecip(item.precipitation);
            const barWidth = 14;
            const isSelected = item.month === selectedMonth;

            return (
              <g key={`bar-${idx}`} className="cursor-pointer" onClick={() => onMonthSelect(item.month)}>
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
                  rx="2"
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
                  transition={{ duration: 0.8, delay: idx * 0.03, ease: 'easeOut' }}
                />
              </g>
            );
          })}

          {/* Line Chart for Temperature */}
          {/* We generate the SVG Path string */}
          <g>
            {data.map((item, idx) => {
              if (idx === 0) return null;
              const prevItem = data[idx - 1];
              const x1 = getX(idx - 1);
              const y1 = getYTemp(prevItem.temperature);
              const x2 = getX(idx);
              const y2 = getYTemp(item.temperature);

              return (
                <motion.line
                  key={`line-segment-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#F43F5E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={isLoaded ? { pathLength: 1 } : {}}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                />
              );
            })}

            {/* Dots on Temperature Line */}
            {data.map((item, idx) => {
              const x = getX(idx);
              const y = getYTemp(item.temperature);
              const isSelected = item.month === selectedMonth;

              return (
                <g key={`dot-${idx}`} className="cursor-pointer" onClick={() => onMonthSelect(item.month)}>
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 5.5 : hoveredIndex === idx ? 4.5 : 3.5}
                    className={`transition-all duration-200 ${
                      isSelected 
                        ? 'fill-rose-600 stroke-white stroke-2 shadow-sm' 
                        : hoveredIndex === idx 
                          ? 'fill-rose-500 stroke-rose-100 stroke-1' 
                          : 'fill-white stroke-rose-500 stroke-2'
                    }`}
                    initial={{ scale: 0 }}
                    animate={isLoaded ? { scale: 1 } : {}}
                    transition={{ delay: 0.5 + idx * 0.02 }}
                  />
                </g>
              );
            })}
          </g>

          {/* X Axis Months Labels */}
          {data.map((item, idx) => {
            const x = getX(idx);
            const isSelected = item.month === selectedMonth;

            return (
              <text
                key={`label-${idx}`}
                x={x}
                y={height - 8}
                textAnchor="middle"
                onClick={() => onMonthSelect(item.month)}
                className={`text-[9.5px] font-semibold cursor-pointer transition-colors duration-200 ${
                  isSelected ? 'fill-emerald-700 font-bold' : 'fill-slate-500 hover:fill-slate-800'
                }`}
              >
                {item.month}
              </text>
            );
          })}

          {/* Mouse interactive areas */}
          {data.map((item, idx) => {
            const x = getX(idx);
            return (
              <rect
                key={`trigger-${idx}`}
                x={x - (chartWidth / (data.length - 1)) / 2}
                y={paddingTop}
                width={chartWidth / (data.length - 1)}
                height={chartHeight}
                className="fill-transparent cursor-pointer opacity-0"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onMonthSelect(item.month)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay inside container */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="absolute z-10 bg-slate-800/95 text-white text-[11px] p-2.5 rounded-lg shadow-md border border-slate-700/80 pointer-events-none flex flex-col gap-1 min-w-[120px]"
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
                <span>{data[hoveredIndex].month}</span>
                {data[hoveredIndex].month === selectedMonth && (
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-400 px-1 rounded-sm">선택됨</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-rose-300">
                <Thermometer className="w-3.5 h-3.5" />
                <span>평균기온: <strong>{data[hoveredIndex].temperature}°C</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-300">
                <CloudRain className="w-3.5 h-3.5" />
                <span>강수량: <strong>{data[hoveredIndex].precipitation}mm</strong></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Month Indicator/Banner */}
      <div className="text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 flex items-center justify-between">
        <span className="font-medium">현재 필터: <strong className="text-emerald-700">{selectedMonth}</strong> 데이터 분석 중</span>
        <span className="text-xxs">월별 차트 컬럼을 클릭하여 해당 월로 즉시 전환</span>
      </div>
    </div>
  );
}
