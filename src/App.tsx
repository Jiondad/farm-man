import React, { useState, useEffect } from 'react';
import { ForestryRecord, ForestryArea, ClimateData } from './types';
import {
  DEFAULT_AREAS,
  DEFAULT_RECORDS,
  CLIMATE_DATA_YEARLY,
  DEFAULT_ADDRESS,
  WEATHER_OPTIONS
} from './data';
import ClimateChart from './components/ClimateChart';
import AreaPanel from './components/AreaPanel';
import RecordTable from './components/RecordTable';
import RecordModal from './components/RecordModal';
import AreaModal from './components/AreaModal';

// Icons
import {
  Trees,
  MapPin,
  Calendar,
  Plus,
  TrendingUp,
  Clock,
  Users,
  Layers,
  Edit3,
  Check,
  X,
  FileSpreadsheet,
  Download,
  Database
} from 'lucide-react';

const API_URL = "https://script.google.com/macros/s/AKfycbyyDFiQuDCrAVpVZeHuNJHaDfHZ9K94hMCMhyxgTd2iSsp1mXTLgoQC0C83MT_CpkroiQ/exec";

export default function App() {
  // --- States ---
  const [areas, setAreas] = useState<ForestryArea[]>([]);
  const [records, setRecords] = useState<ForestryRecord[]>([]);
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(DEFAULT_ADDRESS);

  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('7월');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  
  // Toggle: Filter table by selected month, or view all records
  const [filterByMonth, setFilterByMonth] = useState(true);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ForestryRecord | null>(null);

  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ForestryArea | null>(null);

  // Global Loading State
  const [isLoading, setIsLoading] = useState(true);

  // --- Initial Mount: Load from Google Sheets API with fallback to DEFAULTs ---
  useEffect(() => {
    // Address load from localStorage (local preference)
    const savedAddress = localStorage.getItem('forestry_address');
    if (savedAddress) {
      setAddress(savedAddress);
      setTempAddress(savedAddress);
    } else {
      setAddress(DEFAULT_ADDRESS);
      setTempAddress(DEFAULT_ADDRESS);
      localStorage.setItem('forestry_address', DEFAULT_ADDRESS);
    }

    // Load from GAS API
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resData = await response.json();
        
        if (resData && Array.isArray(resData.areas) && Array.isArray(resData.records)) {
          setAreas(resData.areas);
          setRecords(resData.records);
          if (resData.areas.length > 0) {
            setSelectedAreaId(resData.areas[0].id);
          }
        } else {
          // If response is valid but empty/null structures, load default mock forest data
          console.warn('API returned unexpected data structure, falling back to defaults:', resData);
          setAreas(DEFAULT_AREAS);
          setRecords(DEFAULT_RECORDS);
          if (DEFAULT_AREAS.length > 0) {
            setSelectedAreaId(DEFAULT_AREAS[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch from Google Apps Script, falling back to defaults:', err);
        setAreas(DEFAULT_AREAS);
        setRecords(DEFAULT_RECORDS);
        if (DEFAULT_AREAS.length > 0) {
          setSelectedAreaId(DEFAULT_AREAS[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  // --- Helpers for date translation ---
  const getMonthNumber = (m: string) => {
    const num = parseInt(m);
    return num < 10 ? `0${num}` : `${num}`;
  };

  // --- Async Post Request Helper (Optimistic Back-end Sync) ---
  const postToGAS = async (payload: any) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // Crucial to avoid preflight (OPTIONS) CORS errors
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Sync error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('GAS sync success:', data);
    } catch (err) {
      console.error('GAS sync failed in background:', err, payload);
    }
  };

  // --- Filtering Logic ---
  const filteredRecords = records.filter((rec) => {
    // Year filter
    if (!rec.date.startsWith(selectedYear)) return false;

    // Optional Month filter
    if (filterByMonth) {
      const monthNum = getMonthNumber(selectedMonth);
      return rec.date.substring(5, 7) === monthNum;
    }
    return true;
  });

  // Sort records by date descending
  const sortedRecords = [...filteredRecords].sort((a, b) => b.date.localeCompare(a.date));

  // --- Stats Calculations ---
  const totalExpenses = sortedRecords.reduce((sum, r) => sum + r.expense, 0);
  const totalWorkHours = sortedRecords.reduce((sum, r) => sum + r.workHours, 0);
  const totalWorkers = sortedRecords.reduce((sum, r) => sum + r.workersCount, 0);

  // --- Handlers ---
  const handleSaveAddress = () => {
    if (tempAddress.trim()) {
      setAddress(tempAddress);
      localStorage.setItem('forestry_address', tempAddress);
      setIsEditingAddress(false);
    }
  };

  const handleCancelAddress = () => {
    setTempAddress(address);
    setIsEditingAddress(false);
  };

  // Record Save/Edit (Optimistic Updates)
  const handleSaveRecord = (recordData: Omit<ForestryRecord, 'id' | 'expense'> & { id?: string }) => {
    const expense = recordData.price * recordData.quantity;
    const isEditing = !!recordData.id;
    const recordId = recordData.id || `REC-${Date.now().toString(36).toUpperCase()}`;

    const finalRecord: ForestryRecord = {
      ...recordData,
      id: recordId,
      expense,
    };

    // 1. Optimistic local update
    setRecords((prev) => {
      if (isEditing) {
        return prev.map((r) => (r.id === recordId ? finalRecord : r));
      } else {
        return [finalRecord, ...prev];
      }
    });

    // 2. Background post
    const payload = {
      action: isEditing ? 'UPDATE' : 'CREATE',
      table: 'record',
      ...(isEditing ? { id: recordId } : {}),
      data: finalRecord,
    };
    postToGAS(payload);

    setEditingRecord(null);
  };

  // Record Delete (Optimistic Updates)
  const handleDeleteRecord = (id: string) => {
    if (window.confirm('선택하신 대장 행을 삭제하시겠습니까? 구글시트 연동 데이터에서 영구 제외됩니다.')) {
      // 1. Optimistic update
      setRecords((prev) => prev.filter((r) => r.id !== id));

      // 2. Background post
      postToGAS({
        action: 'DELETE',
        table: 'record',
        id,
      });
    }
  };

  // Area Save/Edit (Optimistic Updates)
  const handleSaveArea = (areaData: ForestryArea) => {
    const exists = areas.some((a) => a.id === areaData.id);

    // 1. Optimistic local update
    setAreas((prev) => {
      if (exists) {
        return prev.map((a) => (a.id === areaData.id ? areaData : a));
      } else {
        return [...prev, areaData];
      }
    });
    setSelectedAreaId(areaData.id);

    // 2. Background post
    const payload = {
      action: exists ? 'UPDATE' : 'CREATE',
      table: 'area',
      ...(exists ? { id: areaData.id } : {}),
      data: areaData,
    };
    postToGAS(payload);

    setEditingArea(null);
  };

  // Area Delete (Optimistic Updates with safety check)
  const handleDeleteArea = (areaId: string) => {
    const targetArea = areas.find(a => a.id === areaId);
    const targetName = targetArea ? targetArea.name : '해당';
    if (window.confirm(`'${targetName}' 구역을 정말 삭제하시겠습니까? 관련 경영기록의 작업구역 참조는 유지되지만 세부 조회시 영향이 갈 수 있습니다.`)) {
      // 1. Optimistic local update
      setAreas((prev) => {
        const updated = prev.filter((a) => a.id !== areaId);
        if (selectedAreaId === areaId && updated.length > 0) {
          setSelectedAreaId(updated[0].id);
        }
        return updated;
      });

      // 2. Background post
      postToGAS({
        action: 'DELETE',
        table: 'area',
        id: areaId,
      });
    }
  };

  // --- Export to CSV (Simulated Sheets Download) ---
  const handleExportCSV = () => {
    const headers = ['작업일', '날씨', '온도', '작업구역', '참여인원', '작업시간', '작업내용', '투입자재', '단가', '수량', '비용'];
    const rows = records.map((r) => {
      const area = areas.find((a) => a.id === r.areaId);
      return [
        r.date,
        r.weather,
        `${r.temperature}°C`,
        area ? area.name : '알수없음',
        `${r.workersCount}명`,
        `${r.workHours}시간`,
        r.content,
        r.materials || '없음',
        r.price,
        r.quantity,
        r.expense,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `임업경영기록대장_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-slate-100 text-slate-800 flex flex-col justify-between lg:overflow-hidden p-3 gap-2.5 font-sans">
      {/* 1. Header (상단 영역) */}
      <header className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 lg:py-2 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-2.5 shadow-2xs h-auto lg:h-[54px] shrink-0">
        {/* Left: App Title & Icon */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <div className="p-1.5 bg-emerald-700 rounded-lg text-white shadow-sm flex items-center justify-center shrink-0">
            <Trees className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none flex flex-wrap items-center gap-1.5">
              임업경영관리 통합 대시보드
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 rounded-md">V2.4</span>
              {isLoading && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-black border border-amber-200 rounded-md animate-pulse shrink-0">
                  <Database className="w-3 h-3 text-amber-600 animate-bounce" />
                  구글 시트 연동 중...
                </span>
              )}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">임산물 및 조경수 실시간 경영 전산 시트</p>
          </div>
        </div>

        {/* Center: Editable Management Address */}
        <div className="w-full lg:flex-1 lg:max-w-xl lg:mx-6 flex items-center justify-center">
          {isEditingAddress ? (
            <div className="flex items-center gap-1.5 w-full bg-slate-50 p-1 rounded-lg border border-emerald-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
              <input
                type="text"
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveAddress();
                  if (e.key === 'Escape') handleCancelAddress();
                }}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none placeholder-slate-400"
                placeholder="대상지 주소 정보를 기입해 주세요"
                autoFocus
              />
              <button
                onClick={handleSaveAddress}
                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors cursor-pointer"
                title="저장"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={handleCancelAddress}
                className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-md transition-colors cursor-pointer"
                title="취소"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingAddress(true)}
              className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 rounded-lg cursor-pointer transition-all w-full max-w-full text-center group"
              title="클릭하여 주소지 수정"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 animate-bounce" />
              <span className="text-xs font-bold text-slate-700 truncate max-w-[280px] sm:max-w-[420px]">
                {address}
              </span>
              <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          )}
        </div>

        {/* Right: Controls & "기록 추가" Button */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end shrink-0">
          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="2026">2026년</option>
            <option value="2025">2025년</option>
          </select>

          {/* Month Selector */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 flex-1 sm:flex-initial justify-center">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2 py-1 bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer w-full text-center"
            >
              {Array.from({ length: 12 }, (_, i) => `${i + 1}월`).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-800 text-xs font-bold rounded-lg transition-all shadow-2xs cursor-pointer flex-1 sm:flex-initial"
            title="CSV 구글시트 다운로드"
          >
            <Download className="w-3.5 h-3.5" />
            내보내기
          </button>

          <button
            onClick={() => {
              setEditingRecord(null);
              setIsRecordModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-extrabold rounded-lg transition-all shadow-xs cursor-pointer flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            기록 추가 +
          </button>
        </div>
      </header>

      {/* 2. Key Indicator Metrics (요약 카드 영역) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 h-auto lg:h-[74px] shrink-0">
        {/* Card 1: Expenses */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center justify-between shadow-2xs h-auto lg:h-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold leading-none mb-1">
                {selectedMonth} 지출 총계
              </p>
              <h3 className="text-sm font-black text-slate-800 leading-none">
                {totalExpenses.toLocaleString()} 원
              </h3>
            </div>
          </div>
          <span className="text-[9px] font-extrabold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-sm shrink-0">
            경영지 투입액
          </span>
        </div>

        {/* Card 2: Work Hours */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center justify-between shadow-2xs h-auto lg:h-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold leading-none mb-1">
                {selectedMonth} 총 작업 시간
              </p>
              <h3 className="text-sm font-black text-slate-800 leading-none">
                {totalWorkHours.toLocaleString()} 시간
              </h3>
            </div>
          </div>
          <span className="text-[9px] font-extrabold text-sky-500 bg-sky-50 px-1.5 py-0.5 rounded-sm shrink-0">
            누적 작업공수
          </span>
        </div>

        {/* Card 3: Workers count */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center justify-between shadow-2xs h-auto lg:h-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold leading-none mb-1">
                {selectedMonth} 총 투입 인원
              </p>
              <h3 className="text-sm font-black text-slate-800 leading-none">
                {totalWorkers.toLocaleString()} 명
              </h3>
            </div>
          </div>
          <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm shrink-0">
            실가동 인적자원
          </span>
        </div>

        {/* Card 4: Areas Registered */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center justify-between shadow-2xs h-auto lg:h-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold leading-none mb-1">
                총 등록 경영 대상구역
              </p>
              <h3 className="text-sm font-black text-slate-800 leading-none">
                {areas.length} 구역
              </h3>
            </div>
          </div>
          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm shrink-0">
            경영 필지 수
          </span>
        </div>
      </section>

      {/* 3. Middle Area (중간 영역 - 기후 차트 & 대상구역 패널) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-auto lg:h-[280px] shrink-0">
        {/* Left: Climate Trend Chart */}
        <div className="min-h-[300px] lg:h-full">
          <ClimateChart
            data={CLIMATE_DATA_YEARLY[selectedYear] || CLIMATE_DATA_YEARLY['2026']}
            selectedMonth={selectedMonth}
            onMonthSelect={(m) => setSelectedMonth(m)}
          />
        </div>

        {/* Right: Area Panel */}
        <div className="min-h-[280px] lg:h-full">
          <AreaPanel
            areas={areas}
            selectedAreaId={selectedAreaId}
            onSelectArea={(id) => setSelectedAreaId(id)}
            onAddAreaClick={() => {
              setEditingArea(null);
              setIsAreaModalOpen(true);
            }}
            onEditAreaClick={(area) => {
              setEditingArea(area);
              setIsAreaModalOpen(true);
            }}
            onDeleteAreaClick={handleDeleteArea}
          />
        </div>
      </section>

      {/* 4. Bottom Area (하단 영역 - 상세 임업경영 기록 대장 테이블) */}
      <section className="flex-1 min-h-0 flex flex-col justify-between">
        {/* Table Filter Topbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2 shrink-0 px-1">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
            <h2 className="text-xs font-extrabold text-slate-800">
              {selectedYear}년 {filterByMonth ? `${selectedMonth} 대장` : '전체 대장'} 상세 데이터 내역
            </h2>
          </div>
        </div>

        {/* The Detailed Table Component */}
        <div className="flex-1 min-h-0">
          <RecordTable
            records={sortedRecords}
            areas={areas}
            onEditRecordClick={(rec) => {
              setEditingRecord(rec);
              setIsRecordModalOpen(true);
            }}
            onDeleteRecordClick={handleDeleteRecord}
            filterByMonth={filterByMonth}
            setFilterByMonth={setFilterByMonth}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
      </section>

      {/* --- Modals --- */}
      {/* 1. Record Add/Edit Modal */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        record={editingRecord}
        areas={areas}
      />

      {/* 2. Area Add/Edit Modal */}
      <AreaModal
        isOpen={isAreaModalOpen}
        onClose={() => {
          setIsAreaModalOpen(false);
          setEditingArea(null);
        }}
        onSave={handleSaveArea}
        onDelete={handleDeleteArea}
        area={editingArea}
      />
    </div>
  );
}
