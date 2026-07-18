import React, { useState, useEffect, forwardRef, useMemo } from 'react';
import { ForestryRecord, ForestryArea } from './types';
import { DEFAULT_AREAS, DEFAULT_RECORDS, CLIMATE_DATA_YEARLY, DEFAULT_ADDRESS } from './data';
import ClimateChart from './components/ClimateChart';
import AreaPanel from './components/AreaPanel';
import RecordTable from './components/RecordTable';
import RecordModal from './components/RecordModal';
import AreaModal from './components/AreaModal';
import { Trees, MapPin, Plus, TrendingUp, Clock, Users, Layers, Edit3, Check, X, Download, Database, Calendar, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale/ko';

const CustomMonthInput = forwardRef(({ value, onClick }: any, ref: any) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-700 rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer flex-1 sm:flex-initial"
  >
    <Calendar className="w-4 h-4 text-emerald-700" />
    <span>{value}</span>
  </button>
));
CustomMonthInput.displayName = 'CustomMonthInput';

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
  
  // 💡 삭제 확인 모달을 위한 새로운 상태 추가
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'area' | 'record' } | null>(null);

  useEffect(() => {
    const savedAddress = localStorage.getItem('forestry_address');
    if (savedAddress) { setAddress(savedAddress); setTempAddress(savedAddress); }
    
    async function fetchInitialData() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data && Array.isArray(data.areas)) {
          setAreas(data.areas.map((a: any) => ({ 
            ...a, 
            treeSpecies: a.treeSpecies || a.tree_species || '', 
            areaSize: Number(a.areaSize || a.area_size || 0), 
            plantDate: (a.plantDate || a.plant_date || '').toString().split('T')[0],
            status: a.status || '정상 생장 (안정)'
          })));
          
          setRecords(Array.isArray(data.records) ? data.records.map((r: any) => ({ 
            ...r,
            date: (r.date || '').toString().split('T')[0],
            weather: r.weather || '맑음',
            areaId: r.work_area || r.areaId || r.area_id || '',
            photoUrl: r.photo_record || r.photoUrl || r.photo_url || '',
            price: Number(r.unit_price) || Number(r.price) || 0,
            quantity: Number(r.quantity) || 0,
            expense: Number(r.total_cost) || Number(r.expense) || 0,
            temperature: Number(r.temperature) || 0,
            humidity: Number(r.humidity) || 0,
            precipitation: Number(r.precipitation) || 0,
            workersCount: Number(r.participants) || Number(r.workersCount || r.workers_count) || 0,
            workHours: Number(r.work_hours_num) || Number(r.workHours || r.work_hours) || 0,
            content: r.work_details || r.content || '',
            materials: r.item_name || r.materials || ''
          })) : []);
          
          if (data.areas.length > 0) setSelectedAreaId(data.areas[0].id);
        }
      } catch (err) { 
        setAreas(DEFAULT_AREAS); 
        setRecords(DEFAULT_RECORDS); 
      } finally { 
        setIsLoading(false); 
      }
    }
    
    fetchInitialData();
  }, []);

  const postToGAS = async (payload: any) => {
    try { await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) }); }
    catch (err) { console.error(err); }
  };

  // 💡 기존 window.confirm 대신 커스텀 팝업을 띄우도록 수정
  const handleDeleteArea = (areaId: string) => {
    setItemToDelete({ id: areaId, type: 'area' });
  };

  const handleDeleteRecord = (id: string) => {
    setItemToDelete({ id, type: 'record' });
  };

  // 💡 팝업에서 '삭제하기' 버튼을 눌렀을 때 실행되는 실제 삭제 로직
  const confirmDelete = () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;
    
    if (type === 'area') {
      setAreas((prev) => {
        const updated = prev.filter((a) => a.id !== id);
        if (selectedAreaId === id && updated.length > 0) { setSelectedAreaId(updated[0].id); }
        return updated;
      });
      postToGAS({ action: 'DELETE', table: 'area', id });
    } else {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      postToGAS({ action: 'DELETE', table: 'record', id });
    }
    setItemToDelete(null); // 모달 닫기
  };

  const handleSaveArea = (areaData: ForestryArea) => {
    const exists = areas.some((a) => a.id === areaData.id);
    setAreas(prev => exists ? prev.map(a => a.id === areaData.id ? areaData : a) : [...prev, areaData]);
    setSelectedAreaId(areaData.id);
    postToGAS({
      action: exists ? 'UPDATE' : 'CREATE',
      table: 'area',
      ...(exists ? { id: areaData.id } : {}),
      data: { id: areaData.id, name: areaData.name, tree_species: areaData.treeSpecies, area_size: areaData.areaSize, plant_date: areaData.plantDate, status: areaData.status, description: areaData.description }
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
        precipitation: finalRecord.precipitation,
        work_area: finalRecord.areaId,
        participants: finalRecord.workersCount,
        work_hours_num: finalRecord.workHours,
        work_details: finalRecord.content,
        item_name: finalRecord.materials,
        unit_price: finalRecord.price,
        quantity: finalRecord.quantity,
        total_cost: finalRecord.expense,
        photo_record: finalRecord.photoUrl
      }
    });
    setEditingRecord(null);
    setIsRecordModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['작업일', '날씨', '온도', '습도', '강수량', '작업구역', '투입인원', '작업시간', '작업내용', '투입자재', '단가', '수량', '지출비용'];
    const rows = filteredRecords.map((r) => {
      const area = areas.find((a) => a.id === r.areaId);
      return [r.date, r.weather, `${r.temperature}도`, `${r.humidity}%`, `${r.precipitation || 0}mm`, area ? area.name : '-', `${r.workersCount}명`, `${r.workHours}시간`, r.content, r.materials || '-', r.price, r.quantity, r.expense];
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `임업경영기록_${selectedYear}_${selectedMonth}월.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cleanMonth = selectedMonth.replace(/[^0-9]/g, '');
  const targetMonthStr = parseInt(cleanMonth) < 10 ? `0${parseInt(cleanMonth)}` : cleanMonth;

  const filteredRecords = records.filter(r => {
    if (!r?.date) return false;
    return r.date.startsWith(selectedYear) && (!filterByMonth || r.date.substring(5, 7) === targetMonthStr);
  });

  const totalExpenses = filteredRecords.reduce((sum, r) => sum + Number(r?.expense || 0), 0);
  const totalWorkHours = filteredRecords.reduce((sum, r) => sum + Number(r?.workHours || 0), 0);
  const totalWorkers = filteredRecords.reduce((sum, r) => sum + Number(r?.workersCount || 0), 0);

  const computedMonthlyData = useMemo(() => {
    const result = [];
    const defaultYearData = CLIMATE_DATA_YEARLY[selectedYear] || CLIMATE_DATA_YEARLY['2026'] || [];
    
    for (let m = 1; m <= 12; m++) {
      const monthName = `${m}월`;
      const monthStr = m < 10 ? `0${m}` : `${m}`;
      const monthRecords = records.filter(r => r?.date?.startsWith(`${selectedYear}-${monthStr}`));
      
      if (monthRecords.length > 0) {
        const temps = monthRecords.map(r => r.temperature).filter(t => typeof t === 'number');
        const humidities = monthRecords.map(r => r.humidity).filter(h => typeof h === 'number') as number[];
        
        const maxTemp = temps.length > 0 ? Math.max(...temps) : 0;
        const avgTemp = temps.length > 0 ? Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)) : 0;
        const avgHumidity = humidities.length > 0 ? Number((humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(1)) : 0;
        
        const totalPrecipitation = monthRecords.reduce((sum, r) => sum + Number(r.precipitation || 0), 0);
        
        result.push({ month: monthName, temperature: maxTemp, avgTemperature: avgTemp, precipitation: totalPrecipitation, humidity: avgHumidity });
      } else {
        const defaultMonthData = defaultYearData.find((d: any) => d.month === monthName);
        result.push(defaultMonthData ? { ...defaultMonthData } : { month: monthName, temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 });
      }
    }
    return result;
  }, [records, selectedYear]);

  const computedDailyData = useMemo(() => {
    const result = [];
    const yearNum = parseInt(selectedYear);
    const monthNum = parseInt(cleanMonth) || 7;
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
    
    for (let d = 1; d <= lastDay; d++) {
      const dayStr = d < 10 ? `0${d}` : `${d}`;
      const fullDateStr = `${selectedYear}-${monthStr}-${dayStr}`;
      const dayRecords = records.filter(r => r?.date === fullDateStr);
      const label = `${d}일`;
      
      if (dayRecords.length > 0) {
        const temps = dayRecords.map(r => r.temperature).filter(t => typeof t === 'number');
        const humidities = dayRecords.map(r => r.humidity).filter(h => typeof h === 'number') as number[];
        const maxTemp = temps.length > 0 ? Math.max(...temps) : 0;
        const avgTemp = temps.length > 0 ? Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)) : 0;
        const avgHumidity = humidities.length > 0 ? Number((humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(1)) : 0;
        
        const dailyPrecipitation = dayRecords.reduce((sum, r) => sum + Number(r.precipitation || 0), 0);
        
        result.push({ name: label, label: label, temperature: maxTemp, avgTemperature: avgTemp, precipitation: dailyPrecipitation, humidity: avgHumidity, originalKey: label });
      } else {
        result.push({ name: label, label: label, temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0, originalKey: label });
      }
    }
    return result;
  }, [records, selectedYear, cleanMonth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-md flex flex-col items-center max-w-sm w-full text-center animate-pulse">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700 mb-4"><Trees className="w-8 h-8" /></div>
          <h2 className="text-sm font-black text-slate-800 tracking-tight mb-1">데이터 동기화 중</h2>
          <p className="text-[10px] text-slate-400 font-medium mb-4">클라우드에서 최신 데이터를 불러오는 중입니다.</p>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200 rounded-lg">
            <Database className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            데이터 로딩 중
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen w-full bg-slate-100 text-slate-800 flex flex-col justify-between lg:overflow-hidden p-3 gap-2.5 font-sans">
      <header className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 lg:py-2 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-2.5 shadow-2xs h-auto lg:h-[54px] shrink-0">
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
        
        <div className="w-full lg:flex-1 lg:max-w-xl lg:mx-6 flex items-center justify-center">
          {isEditingAddress ? (
            <div className="flex items-center gap-1.5 w-full bg-slate-50 p-1 rounded-lg border border-emerald-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
              <input type="text" value={tempAddress} onChange={(e) => setTempAddress(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && tempAddress.trim()) { setAddress(tempAddress); localStorage.setItem('forestry_address', tempAddress); setIsEditingAddress(false); } if (e.key === 'Escape') { setTempAddress(address); setIsEditingAddress(false); } }} className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none placeholder-slate-400" autoFocus />
              <button onClick={() => { if (tempAddress.trim()) { setAddress(tempAddress); localStorage.setItem('forestry_address', tempAddress); setIsEditingAddress(false); } }} className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors cursor-pointer"><Check className="w-3 h-3" /></button>
              <button onClick={() => { setTempAddress(address); setIsEditingAddress(false); }} className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-md transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <div onClick={() => setIsEditingAddress(true)} className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 rounded-lg cursor-pointer transition-all w-full max-w-full text-center group">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 animate-bounce" />
              <span className="text-xs font-bold text-slate-700 truncate max-w-[280px] sm:max-w-[420px]">{address}</span>
              <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end shrink-0">
          <DatePicker selected={new Date(parseInt(selectedYear), parseInt(cleanMonth) - 1, 1)} onChange={(date: Date | null) => { if (date) { setSelectedYear(date.getFullYear().toString()); setSelectedMonth((date.getMonth() + 1).toString()); } }} dateFormat="yyyy년 MM월" showMonthYearPicker locale={ko} customInput={<CustomMonthInput />} />
          <button onClick={handleExportCSV} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-800 text-xs font-bold rounded-lg transition-all shadow-2xs cursor-pointer flex-1 sm:flex-initial"><Download className="w-3.5 h-3.5" /> 내보내기</button>
          <button onClick={() => { setEditingRecord(null); setIsRecordModalOpen(true); }} className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-extrabold rounded-lg transition-all shadow-xs cursor-pointer flex-1 sm:flex-initial"><Plus className="w-4 h-4" /> 기록 추가</button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 h-auto lg:h-[74px] shrink-0">
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center justify-between shadow-2xs h-auto lg:h-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl"><TrendingUp className="w-4.5 h-4.5" /></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold leading-none mb-1">{cleanMonth}월 지출 총계</p>
              <h3 className="text-sm font-black text-slate-800 leading-none">{totalExpenses.toLocaleString()} 원</h3>
            </div>
          </div>
          <span className="text-[9px] font-extrabold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-sm shrink-0">경영지 투입액</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center justify-between shadow-2xs h-auto lg:h-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl"><Clock className="w-4.5 h-4.5" /></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold leading-none mb-1">{cleanMonth}월 총 작업 시간</p>
              <h3 className="text-sm font-black text-slate-800 leading-none">{totalWorkHours.toLocaleString()} 시간</h3>
            </div>
          </div>
          <span className="text-[9px] font-extrabold text-sky-500 bg-sky-50 px-1.5 py-0.5 rounded-sm shrink-0">누적 작업공수</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center justify-between shadow-2xs h-auto lg:h-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Users className="w-4.5 h-4.5" /></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold leading-none mb-1">{cleanMonth}월 총 투입 인원</p>
              <h3 className="text-sm font-black text-slate-800 leading-none">{totalWorkers.toLocaleString()} 명</h3>
            </div>
          </div>
          <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm shrink-0">실가동 인적자원</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center justify-between shadow-2xs h-auto lg:h-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl"><Layers className="w-4.5 h-4.5" /></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold leading-none mb-1">총 등록 경영 대상구역</p>
              <h3 className="text-sm font-black text-slate-800 leading-none">{areas.length} 구역</h3>
            </div>
          </div>
          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm shrink-0">경영 필지 수</span>
        </div>
      </section>

      <section className="flex flex-col gap-1.5 shrink-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-center px-1 mb-0.5">
          <div className="flex items-center gap-2"><span className="w-1.5 h-3 bg-emerald-700 rounded-full"></span><span className="text-xs font-extrabold text-slate-600">임업 기후 복합 통계</span></div>
          <div className="flex items-center gap-2 hidden lg:flex"><span className="w-1.5 h-3 bg-emerald-700 rounded-full"></span><span className="text-xs font-extrabold text-slate-600">경영 대상 구역 정보</span></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-auto lg:h-[280px]">
          <div className="min-h-[300px] lg:h-full">
            <ClimateChart
              data={computedMonthlyData}
              dailyData={computedDailyData}
              selectedMonth={cleanMonth}
              onMonthSelect={(m) => {
                const num = m.replace(/[^0-9]/g, '');
                if (num) setSelectedMonth(num);
              }}
            />
          </div>
          <div className="min-h-[280px] lg:h-full">
            <AreaPanel areas={areas} selectedAreaId={selectedAreaId} onSelectArea={(id) => setSelectedAreaId(id)} onAddAreaClick={() => { setEditingArea(null); setIsAreaModalOpen(true); }} onEditAreaClick={(area) => { setEditingArea(area); setIsAreaModalOpen(true); }} onDeleteAreaClick={handleDeleteArea} />
          </div>
        </div>
      </section>

      <section className="flex-1 min-h-0 flex flex-col justify-between">
        <div className="flex items-center justify-between px-1 mb-1.5 shrink-0 mt-4 lg:mt-5">
          <div className="flex items-center gap-2"><span className="w-1.5 h-3 bg-emerald-700 rounded-full"></span><span className="text-xs font-extrabold text-slate-600">임업경영기록 상세 대장</span></div>
        </div>
        <div className="flex-1 min-h-0">
          <RecordTable records={filteredRecords} areas={areas} onEditRecordClick={(rec) => { setEditingRecord(rec); setIsRecordModalOpen(true); }} onDeleteRecordClick={handleDeleteRecord} filterByMonth={filterByMonth} setFilterByMonth={setFilterByMonth} selectedMonth={cleanMonth} selectedYear={selectedYear} />
        </div>
      </section>

      <RecordModal isOpen={isRecordModalOpen} onClose={() => { setIsRecordModalOpen(false); setEditingRecord(null); }} onSave={handleSaveRecord} record={editingRecord} areas={areas} />
      <AreaModal isOpen={isAreaModalOpen} onClose={() => { setIsAreaModalOpen(false); setEditingArea(null); }} onSave={handleSaveArea} area={editingArea} />
      
      {/* 💡 새로 추가된 삭제 확인 커스텀 모달 */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">정말 삭제하시겠습니까?</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">삭제된 데이터는 복구할 수 없으며, 연결된 구글 시트에서도 즉시 영구 삭제됩니다.</p>
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => setItemToDelete(null)} 
                className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                취소
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-2.5 text-sm font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-md"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}