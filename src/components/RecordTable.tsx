import React, { useState } from 'react';
import { ForestryRecord, ForestryArea } from '../types';
import { Calendar, Cloud, Sun, Eye, Edit2, Trash2, CloudRain, Snowflake, Wind, ChevronDown, Image as ImageIcon } from 'lucide-react';

interface RecordTableProps {
  records: ForestryRecord[];
  areas: ForestryArea[];
  onEditRecordClick: (record: ForestryRecord) => void;
  onDeleteRecordClick: (id: string) => void;
  filterByMonth: boolean;
  setFilterByMonth: (val: boolean) => void;
  selectedMonth: string;
  selectedYear: string;
}

export default function RecordTable({
  records,
  areas,
  onEditRecordClick,
  onDeleteRecordClick,
  filterByMonth,
  setFilterByMonth,
  selectedMonth,
  selectedYear,
}: RecordTableProps) {
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const safeRecordsList = Array.isArray(records) ? records : [];
  const safeAreasList = Array.isArray(areas) ? areas : [];

  const getAreaName = (areaId: string) => {
    const area = safeAreasList.find((a) => a?.id === areaId);
    return area ? (area.name || '미지정 구역') : '알 수 없음';
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case '맑음':
        return <Sun className="w-4 h-4 text-amber-500 fill-amber-100" />;
      case '흐림':
        return <Cloud className="w-4 h-4 text-slate-400 fill-slate-50" />;
      case '비':
        return <CloudRain className="w-4 h-4 text-sky-500" />;
      case '눈':
        return <Snowflake className="w-4 h-4 text-sky-300" />;
      case '안개':
        return <Wind className="w-4 h-4 text-teal-400" />;
      default:
        return <Sun className="w-4 h-4 text-amber-500" />;
    }
  };

  // Calculate totals
  const totalWorkers = safeRecordsList.reduce((sum, r) => sum + (r?.workersCount || 0), 0);
  const totalHours = safeRecordsList.reduce((sum, r) => sum + (r?.workHours || 0), 0);
  const totalExpense = safeRecordsList.reduce((sum, r) => sum + (r?.expense || 0), 0);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Offset the preview popup slightly from the mouse cursor
    setHoverPos({
      x: e.clientX + 15,
      y: e.clientY - 80,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-full overflow-hidden relative">
      {/* Table Header Action Bar */}
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
          <h4 className="text-xs font-bold text-slate-700 truncate">임업경영기록 상세대장</h4>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          {/* Toggle filter */}
          <div className="flex items-center gap-2 text-[9px] font-bold">
            <span className="text-slate-500 shrink-0">대장 필터 구분:</span>
            <div className="flex bg-slate-200 p-0.5 rounded-lg border border-slate-300">
              <button
                onClick={() => setFilterByMonth(true)}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  filterByMonth
                    ? 'bg-white text-emerald-800 shadow-3xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {selectedMonth} 데이터만 보기
              </button>
              <button
                onClick={() => setFilterByMonth(false)}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  !filterByMonth
                    ? 'bg-white text-emerald-800 shadow-3xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {selectedYear}년 전체 내역 보기
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2 font-medium">
            <span>대장 내 역대 기록 건수: <strong className="text-slate-700 font-bold">{safeRecordsList.length}건</strong></span>
            <span>|</span>
            <span className="text-emerald-700">마우스 호버 시 현장 작업 사진이 팝업됩니다.</span>
          </div>
        </div>
      </div>

      {/* Scrollable Table Wrapper */}
      <div className="flex-1 overflow-auto max-h-[300px] w-full">
        <table className="w-full text-left border-collapse table-fixed min-w-[1200px]">
          {/* Header */}
          <thead className="bg-slate-100/90 sticky top-0 z-10 border-b border-slate-200 shadow-2xs backdrop-blur-xs">
            <tr className="text-slate-600 text-[11px] font-bold">
              <th className="p-2.5 w-[100px] pl-4">작업일</th>
              <th className="p-2.5 w-[70px] text-center">날씨</th>
              <th className="p-2.5 w-[70px] text-center">온도 (°C)</th>
              <th className="p-2.5 w-[70px] text-center">습도 (%)</th>
              <th className="p-2.5 w-[160px]">작업구역</th>
              <th className="p-2.5 w-[110px] text-center">참여인원/시간</th>
              <th className="p-2.5 w-[240px]">작업내용</th>
              <th className="p-2.5 w-[140px]">투입자재</th>
              <th className="p-2.5 w-[100px] text-right">단가 (원)</th>
              <th className="p-2.5 w-[70px] text-center">수량</th>
              <th className="p-2.5 w-[110px] text-right">비용 (원)</th>
              <th className="p-2.5 w-[80px] text-center">사진</th>
              <th className="p-2.5 w-[100px] text-center pr-4">관리</th>
            </tr>
          </thead>

          {/* Rows */}
          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {safeRecordsList.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-10 text-slate-400 font-semibold bg-white">
                  등록된 임업경영기록이 없습니다. '기록 추가 +'를 통해 첫 대장을 기록해 보세요.
                </td>
              </tr>
            ) : (
              safeRecordsList.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Date */}
                  <td className="p-2 pl-4 font-semibold text-slate-800">{record.date}</td>
                  
                  {/* Weather */}
                  <td className="p-2">
                    <div className="flex items-center justify-center gap-1">
                      {getWeatherIcon(record.weather)}
                      <span className="text-[10px] font-bold text-slate-600">{record.weather}</span>
                    </div>
                  </td>

                  {/* Temp */}
                  <td className="p-2 text-center font-medium text-slate-600">{record.temperature}°C</td>

                  {/* Humidity */}
                  <td className="p-2 text-center font-medium text-slate-600">
                    {record.humidity !== undefined ? `${record.humidity}%` : '-'}
                  </td>

                  {/* Area */}
                  <td className="p-2 font-medium text-slate-800 truncate" title={getAreaName(record.areaId)}>
                    {getAreaName(record.areaId)}
                  </td>

                  {/* Workers / Hours */}
                  <td className="p-2 text-center font-medium">
                    <span className="text-slate-800 font-bold">{record.workersCount}명</span>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-emerald-700 font-bold">{record.workHours}시간</span>
                  </td>

                  {/* Work Content */}
                  <td className="p-2 font-medium truncate text-slate-700" title={record.content}>
                    {record.content}
                  </td>

                  {/* Materials */}
                  <td className="p-2 truncate text-slate-500 font-medium" title={record.materials || '없음'}>
                    {record.materials || <span className="text-slate-300">-</span>}
                  </td>

                  {/* Price */}
                  <td className="p-2 text-right font-medium text-slate-600">
                    {record.price > 0 ? `${record.price.toLocaleString()}` : '0'}
                  </td>

                  {/* Qty */}
                  <td className="p-2 text-center font-semibold text-slate-700">
                    {record.quantity > 0 ? record.quantity : '-'}
                  </td>

                  {/* Total Expense */}
                  <td className="p-2 text-right font-bold text-slate-900">
                    {record.expense.toLocaleString()}
                  </td>

                  {/* Photo Attachment hover point */}
                  <td className="p-2 text-center">
                    {record.photoUrl ? (
                      record.photoUrl.startsWith('http') ? (
                        <div
                          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all cursor-zoom-in relative"
                          onMouseEnter={() => setHoveredPhotoId(record.id)}
                          onMouseLeave={() => setHoveredPhotoId(null)}
                          onMouseMove={handleMouseMove}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span 
                          className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200"
                          title={record.photoUrl}
                        >
                          첨부 {record.photoUrl.split(',').map(s => s.trim()).filter(Boolean).length}개
                        </span>
                      )
                    ) : (
                      <span className="text-slate-300 text-[10px] font-medium">-</span>
                    )}
                  </td>

                  {/* Row actions */}
                  <td className="p-2 text-center pr-4">
                    <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditRecordClick(record)}
                        className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        title="기록 수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteRecordClick(record.id)}
                        className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="기록 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Sticky Totals Row */}
      <div className="bg-emerald-800 text-emerald-50 px-4 py-2.5 border-t border-emerald-900 grid grid-cols-12 items-center text-xs font-black z-10 select-none">
        <div className="col-span-3 flex items-center gap-1.5">
          <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-sm font-extrabold text-[10px]">TOTALS</span>
        </div>
        <div className="col-span-3 text-center flex items-center justify-center gap-4">
          <div>
            <span className="text-[10px] text-emerald-300 font-medium mr-1.5">총 인력 투입:</span>
            <span className="text-sm font-black text-white">{totalWorkers.toLocaleString()} 명</span>
          </div>
          <div className="w-px h-3 bg-emerald-700"></div>
          <div>
            <span className="text-[10px] text-emerald-300 font-medium mr-1.5">총 누적 시간:</span>
            <span className="text-sm font-black text-white">{totalHours.toLocaleString()} 시간</span>
          </div>
        </div>
        <div className="col-span-3 flex items-center justify-end pr-4 text-right">
          <span className="text-[10px] text-emerald-300 font-medium mr-2">총 경영사업 지출액:</span>
          <span className="text-sm font-black text-white">{totalExpense.toLocaleString()} 원</span>
        </div>
        <div className="col-span-3 text-right text-[10px] text-emerald-200/80 font-medium italic">
          * 실시간 수식 반영 (날씨 및 조건별 필터 집계 완료)
        </div>
      </div>

      {/* Floating Hover Image Preview */}
      {hoveredPhotoId && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl bg-slate-900 border border-slate-700 shadow-xl overflow-hidden p-1 flex flex-col gap-1.5 w-[260px]"
          style={{
            left: `${hoverPos.x}px`,
            top: `${hoverPos.y}px`,
          }}
        >
          {(() => {
            const r = records.find((rec) => rec.id === hoveredPhotoId);
            return r ? (
              <>
                <img
                  src={r.photoUrl}
                  alt={r.content}
                  referrerPolicy="no-referrer"
                  className="w-full h-[150px] object-cover rounded-lg"
                />
                <div className="px-1.5 py-1 text-white">
                  <p className="text-[11px] font-extrabold truncate">{r.content}</p>
                  <p className="text-[9px] text-emerald-300 font-medium">{r.date} | {getAreaName(r.areaId)}</p>
                </div>
              </>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}
