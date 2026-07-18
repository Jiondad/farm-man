import React, { useState, useEffect } from 'react';
import { ForestryRecord, ForestryArea } from './types';
import { DEFAULT_AREAS, DEFAULT_RECORDS, CLIMATE_DATA_YEARLY, DEFAULT_ADDRESS } from './data';
import ClimateChart from './components/ClimateChart';
import AreaPanel from './components/AreaPanel';
import RecordTable from './components/RecordTable';
import RecordModal from './components/RecordModal';
import AreaModal from './components/AreaModal';
import { Trees, MapPin, Plus, TrendingUp, Clock, Users, Layers, Edit3, Check, X, Download, Database } from 'lucide-react';

const API_URL = "https://script.google.com/macros/s/AKfycbyyDFiQuDCrAVpVZeHuNJHaDfHZ9K94hMCMhyxgTd2iSsp1mXTLgoQC0C83MT_CpkroiQ/exec";

export default function App() {
  const [areas, setAreas] = useState<ForestryArea[]>([]);
  const [records, setRecords] = useState<ForestryRecord[]>([]);
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(DEFAULT_ADDRESS);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('7');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [filterByMonth, setFilterByMonth] = useState(true);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ForestryRecord | null>(null);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ForestryArea | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedAddress = localStorage.getItem('forestry_address');
    if (savedAddress) { setAddress(savedAddress); setTempAddress(savedAddress); }
    async function fetchInitialData() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data && Array.isArray(data.areas)) {
          // 데이터 정규화 로직 적용
          setAreas(data.areas.map((a: any) => ({ ...a, treeSpecies: a.treeSpecies || a.tree_species, areaSize: Number(a.areaSize || a.area_size || 0), plantDate: a.plantDate || a.plant_date })));
          setRecords(Array.isArray(data.records) ? data.records.map((r: any) => ({ ...r, areaId: r.areaId || r.area_id, photoUrl: r.photoUrl || r.photo_url })) : []);
          if (data.areas.length > 0) setSelectedAreaId(data.areas[0].id);
        }
      } catch (err) { setAreas(DEFAULT_AREAS); setRecords(DEFAULT_RECORDS); }
      finally { setIsLoading(false); }
    }
    fetchInitialData();
  }, []);

  const postToGAS = async (payload: any) => {
    try { await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) }); } 
    catch (err) { console.error(err); }
  };

  const handleDeleteArea = (areaId: string) => {
    const targetArea = areas.find(a => a.id === areaId);
    const targetName = targetArea ? targetArea.name : '해당';
    if (window.confirm(`'${targetName}' 구역을 정말 삭제하시겠습니까? 관련 경영기록의 작업구역 참조는 유지되지만 세부 조회시 영향이 갈 수 있습니다.`)) {
      setAreas((prev) => {
        const updated = prev.filter((a) => a.id !== areaId);
        if (selectedAreaId === areaId && updated.length > 0) {
          setSelectedAreaId(updated[0].id);
        }
        return updated;
      });
      postToGAS({ action: 'DELETE', table: 'area', id: areaId });
    }
  };

  const handleSaveArea = (areaData: ForestryArea) => {
    const exists = areas.some((a) => a.id === areaData.id);
    setAreas(prev => exists ? prev.map(a => a.id === areaData.id ? areaData : a) : [...prev, areaData]);
    setSelectedAreaId(areaData.id);
    postToGAS({
      action: exists ? 'UPDATE' : 'CREATE',
      table: 'area',
      ...(exists ? { id: areaData.id } : {}),
      data: {
        id: areaData.id,
        name: areaData.name,
        tree_species: areaData.treeSpecies,
        area_size: areaData.areaSize,
        plant_date: areaData.plantDate,
        status: areaData.status,
        description: areaData.description
      }
    });
    setEditingArea(null);
    setIsAreaModalOpen(false);
  };

  const handleSaveRecord = (recordData: any) => {
    const expense = recordData.price * recordData.quantity;
    const isEditing = !!recordData.id;
    const recordId = recordData.id || `REC-${Date.now().toString(36).toUpperCase()}`;
    const finalRecord = { ...recordData, id: recordId, expense };

    setRecords(prev => isEditing ? prev.map(r => r.id === recordId ? finalRecord : r) : [finalRecord, ...prev]);

    postToGAS({
      action: isEditing ? 'UPDATE' : 'CREATE',
      table: 'record',
      ...(isEditing ? { id: recordId } : {}),
      data: {
        id: finalRecord.id,
        date: finalRecord.date,
        weather: finalRecord.weather,
        temperature: finalRecord.temperature,
        humidity: finalRecord.humidity,
        area_id: finalRecord.areaId,
        workers_count: finalRecord.workersCount,
        work_hours: finalRecord.workHours,
        content: finalRecord.content,
        materials: finalRecord.materials,
        price: finalRecord.price,
        quantity: finalRecord.quantity,
        expense: finalRecord.expense,
        photo_url: finalRecord.photoUrl
      }
    });
    setEditingRecord(null);
    setIsRecordModalOpen(false);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('선택하신 대장 행을 삭제하시겠습니까? 구글시트 연동 데이터에서 영구 제외됩니다.')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      postToGAS({
        action: 'DELETE',
        table: 'record',
        id,
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ['작업일', '날씨', '온도', '작업구역', '참여인원', '작업시간', '작업내용', '투입자재', '단가', '수량', '비용'];
    const rows = filteredRecords.map((r) => {
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
    link.setAttribute('download', `임업경영기록대장_${selectedYear}_${selectedMonth}월.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter(r => r.date.startsWith(selectedYear) && (!filterByMonth || r.date.substring(5, 7) === (parseInt(selectedMonth) < 10 ? `0${selectedMonth}` : selectedMonth)));
  const totalExpenses = filteredRecords.reduce((sum, r) => sum + Number(r.expense || 0), 0);
  const totalWorkHours = filteredRecords.reduce((sum, r) => sum + Number(r.workHours || 0), 0);
  const totalWorkers = filteredRecords.reduce((sum, r) => sum + Number(r.workersCount || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-md flex flex-col items-center max-w-sm w-full text-center animate-pulse">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700 mb-4">
            <Trees className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-black text-slate-800 tracking-tight mb-1">임업경영대장 로딩 중</h2>
          <p className="text-[10px] text-slate-400 font-medium mb-4">구글 스프레드시트 양식과 연동을 동기화하고 있습니다.</p>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200 rounded-lg">
            <Database className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            실시간 데이터 피드 연결 중...
          </div>
        </div>
      </div>
    );
  }

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
                  if (e.key === 'Enter') {
                    if (tempAddress.trim()) {
                      setAddress(tempAddress);
                      localStorage.setItem('forestry_address', tempAddress);
                      setIsEditingAddress(false);
                    }
                  }
                  if (e.key === 'Escape') {
                    setTempAddress(address);
                    setIsEditingAddress(false);
                  }
                }}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none placeholder-slate-400"
                placeholder="대상지 주소 정보를 기입해 주세요"
                autoFocus
              />
              <button
                onClick={() => {
                  if (tempAddress.trim()) {
                    setAddress(tempAddress);
                    localStorage.setItem('forestry_address', tempAddress);
                    setIsEditingAddress(false);
                  }
                }}
                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors cursor-pointer"
                title="저장"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setTempAddress(address);
                  setIsEditingAddress(false);
                }}
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

        {/* Right: Controls & Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end shrink-0">
          <input
            type="month"
            value={`${selectedYear}-${parseInt(selectedMonth) < 10 ? '0' + selectedMonth : selectedMonth}`}
            onChange={(e) => {
              if (e.target.value) {
                const [year, month] = e.target.value.split('-');
                setSelectedYear(year);
                setSelectedMonth(parseInt(month).toString());
              }
            }}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-emerald-600/50 cursor-pointer flex-1 sm:flex-initial transition-all"
          />

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
                {selectedMonth}월 지출 총계
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
                {selectedMonth}월 총 작업 시간
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
                {selectedMonth}월 총 투입 인원
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
      <section className="flex flex-col gap-1.5 shrink-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-center px-1 mb-0.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-emerald-700 rounded-full"></span>
            <span className="text-xs font-extrabold text-slate-600">임업 기후 복합 통계</span>
          </div>
          <div className="flex items-center gap-2 hidden lg:flex">
            <span className="w-1.5 h-3 bg-emerald-700 rounded-full"></span>
            <span className="text-xs font-extrabold text-slate-600">경영 대상 구역 정보</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-auto lg:h-[280px]">
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
        </div>
      </section>

      {/* 4. Bottom Area (하단 영역 - 상세 임업경영 기록 대장 테이블) */}
      <section className="flex-1 min-h-0 flex flex-col justify-between">
        <div className="flex items-center justify-between px-1 mb-1 shrink-0 mt-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-emerald-700 rounded-full"></span>
            <span className="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
              임업경영기록 상세 대장
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Google Sheets 양식 연동
              </span>
            </span>
          </div>
        </div>
        {/* The Detailed Table Component */}
        <div className="flex-1 min-h-0">
          <RecordTable
            records={filteredRecords}
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
        area={editingArea}
      />
    </div>
  );
}