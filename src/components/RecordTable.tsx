import React, { useState } from 'react';
import { ForestryRecord, ForestryArea } from '../types';
import { Edit2, Trash2, Image as ImageIcon, Map, Calendar, AlertCircle } from 'lucide-react';

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
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  
  const totalWorkers = records.reduce((sum, r) => sum + Number(r.workersCount || 0), 0);
  const totalHours = records.reduce((sum, r) => sum + Number(r.workHours || 0), 0);
  const totalExpense = records.reduce((sum, r) => sum + Number(r.expense || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-full overflow-hidden relative">
      <div className="flex items-center justify-between p-2.5 border-b border-slate-200/80 bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">대장 필터 구분:</span>
          <div className="flex bg-slate-200/50 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setFilterByMonth(true)}
              className={`px-3 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                filterByMonth ? 'bg-white text-emerald-700 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {selectedMonth} 데이터만 보기
            </button>
            <button
              onClick={() => setFilterByMonth(false)}
              className={`px-3 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                !filterByMonth ? 'bg-white text-emerald-700 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {selectedYear}년 전체 내역 보기
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mr-1">
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-block">
            마우스 호버 시 현장 작업 사진이 팝업됩니다.
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold border border-slate-200">
            대장 내 역대 기록 건수: <strong className="text-slate-700">{records.length}</strong>건
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-2xs z-10">
            <tr>
              <th className="px-3 py-2.5 text-[11px] font-black text-slate-500 border-b border-slate-200/80">작업일</th>
              <th className="px-3 py-2.5 text-[11px] font-black text-slate-500 border-b border-slate-200/80">날씨</th>
              <th className="px-3 py-2.5 text-[11px] font-black text-slate-500 border-b border-slate-200/80">온도 (°C)</th>
              <th className="px-3 py-2.5 text-[11px] font-black text-slate-500 border-b border-slate-200/80">습도 (%)</th>
              {/* 추가된 강수량 헤더 */}
              <th className="px-3 py-2.5 text-[11px] font-black text-emerald-600 border-b border-emerald-200 bg-emerald-50/30">강수량 (mm)</th>
              <th className="px-3 py-2.5 text-[11px] font-black text-slate-500 border-b border-slate-200/80">작업구역</th>
              <th className="px-3 py-2.5 text-[11px] font-black text-slate-500 border-b border-slate-200/80 text-center">참여인원/시간</th>
              <th className="px-3 py-2.5 text-[11px] font-black text-slate-500 border-b border-slate-200/80 w-48">작업내용</th>
              <th className="px-3 py-2.5 text-[11px] font-black text-slate-500 border-b border-slate-200/80">투입자재</th>
              <th className="px-3 py-2.5 text-[11px] font-black text-slate-500 border-b border-slate-200/80 text-right">단가 (원)</th>
              <th className="px-3 py-2.5 text-[11px] font-black text-slate-500 border-b border-slate-200/80 text-right">수량</th>
              <th className="px-3 py-2.5 text-[11px] font-black text-slate-500 border-b border-slate-200/80 text-right">비용 (원)</th>
              <th className="px-3 py-2.5 text-[11px] font-black text-slate-500 border-b border-slate-200/80 text-center">사진</th>
              <th className="px-3 py-2.5 text-[11px] font-black text-slate-500 border-b border-slate-200/80 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {records.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mb-2 text-slate-300" />
                    <p className="text-xs font-bold text-slate-500">해당 기간의 경영 기록이 없습니다.</p>
                    <p className="text-[10px] mt-1">상단의 '기록 추가' 버튼을 눌러 새 기록을 작성해주세요.</p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record) => {
                const area = areas.find((a) => a.id === record.areaId);
                return (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {record.date}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">{record.weather}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">{record.temperature}°C</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">{record.humidity}%</td>
                    {/* 추가된 강수량 데이터 */}
                    <td className="px-3 py-2 whitespace-nowrap text-xs font-bold text-emerald-700 bg-emerald-50/20">
                      {record.precipitation ? `${record.precipitation} mm` : '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Map className="w-3 h-3 text-emerald-500" />
                        {area ? area.name : <span className="text-rose-400 italic font-normal">알 수 없음</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600 text-center">
                      <span className="font-bold text-slate-700">{record.workersCount}명</span>
                      <span className="mx-1 text-slate-300">/</span>
                      <span className="font-bold text-emerald-700">{record.workHours}시간</span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 max-w-xs truncate" title={record.content}>
                      {record.content}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 truncate max-w-[120px]" title={record.materials}>
                      {record.materials || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600 text-right">
                      {Number(record.price || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600 text-right">
                      {Number(record.quantity || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs font-black text-rose-600 text-right bg-rose-50/30">
                      {Number(record.expense || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center relative">
                      {record.photoUrl ? (
                        <div 
                          className="inline-flex p-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 hover:text-sky-700 rounded-md transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredImage(record.photoUrl || null)}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditRecordClick(record)}
                          className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 rounded-md transition-colors cursor-pointer"
                          title="수정"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteRecordClick(record.id)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-emerald-800 text-white p-2.5 shrink-0 border-t border-emerald-900 flex flex-wrap items-center justify-between text-xs font-bold rounded-b-xl">
        <div className="flex items-center gap-4">
          <span className="bg-emerald-900/50 px-2 py-1 rounded border border-emerald-700/50">
            총 인력 투입: <span className="text-emerald-300 text-sm ml-1">{totalWorkers.toLocaleString()}</span> 명
          </span>
          <span className="bg-emerald-900/50 px-2 py-1 rounded border border-emerald-700/50">
            총 누적 시간: <span className="text-emerald-300 text-sm ml-1">{totalHours.toLocaleString()}</span> 시간
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <span className="text-emerald-200/80 font-medium text-[10px] hidden md:inline-block">
            * 실시간 수식 반영 (날씨 및 조건별 필터 집계 완료)
          </span>
          <span className="bg-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-600 shadow-inner">
            총 경영사업 지출액: <span className="text-white font-black text-sm ml-1">{totalExpense.toLocaleString()}</span> 원
          </span>
        </div>
      </div>

      {hoveredImage && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-2 bg-white rounded-xl shadow-2xl border border-slate-200 pointer-events-none animate-in fade-in zoom-in duration-200">
          <div className="relative">
            <img 
              src={hoveredImage} 
              alt="현장 사진" 
              className="max-w-[300px] max-h-[300px] object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Load+Failed';
              }}
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-6 rounded-b-lg">
              <span className="text-white text-[10px] font-bold flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> 현장 촬영 기록
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}