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
      setIsLoading(true);
      try {
        const response = await fetch(API_URL);
        const resData = await response.json();
        if (resData && Array.isArray(resData.areas)) {
          // 데이터 정규화 로직 적용[cite: 3]
          setAreas(resData.areas.map((a: any) => ({ ...a, treeSpecies: a.treeSpecies || a.tree_species, areaSize: Number(a.areaSize || a.area_size || 0), plantDate: a.plantDate || a.plant_date })));
          setRecords(Array.isArray(resData.records) ? resData.records.map((r: any) => ({ ...r, areaId: r.areaId || r.area_id, photoUrl: r.photoUrl || r.photo_url })) : []);
          if (resData.areas.length > 0) setSelectedAreaId(resData.areas[0].id);
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

  const handleSaveArea = (areaData: ForestryArea) => {
    const exists = areas.some((a) => a.id === areaData.id);
    setAreas((prev) => (exists ? prev.map((a) => (a.id === areaData.id ? areaData : a)) : [...prev, areaData]));
    postToGAS({
      action: exists ? 'UPDATE' : 'CREATE',
      table: 'area',
      ...(exists ? { id: areaData.id } : {}),
      data: { id: areaData.id, name: areaData.name, tree_species: areaData.treeSpecies, area_size: areaData.areaSize, plant_date: areaData.plantDate, status: areaData.status, description: areaData.description }
    });
    setEditingArea(null);
  };

  const handleSaveRecord = (recordData: any) => {
    const expense = recordData.price * recordData.quantity;
    const isEditing = !!recordData.id;
    const recordId = recordData.id || `REC-${Date.now().toString(36).toUpperCase()}`;
    const finalRecord = { ...recordData, id: recordId, expense };
    setRecords((prev) => (isEditing ? prev.map((r) => (r.id === recordId ? finalRecord : r)) : [finalRecord, ...prev]));
    postToGAS({
      action: isEditing ? 'UPDATE' : 'CREATE',
      table: 'record',
      ...(isEditing ? { id: recordId } : {}),
      data: { id: finalRecord.id, date: finalRecord.date, weather: finalRecord.weather, temperature: finalRecord.temperature, humidity: finalRecord.humidity, area_id: finalRecord.areaId, workers_count: finalRecord.workersCount, work_hours: finalRecord.workHours, content: finalRecord.content, materials: finalRecord.materials, price: finalRecord.price, quantity: finalRecord.quantity, expense: finalRecord.expense, photo_url: finalRecord.photoUrl }
    });
    setEditingRecord(null);
  };

  const filteredRecords = records.filter(r => r.date.startsWith(selectedYear) && (!filterByMonth || r.date.substring(5, 7) === (parseInt(selectedMonth) < 10 ? `0${selectedMonth}` : selectedMonth)));
  const totalExpenses = filteredRecords.reduce((sum, r) => sum + Number(r.expense), 0);
  const totalWorkHours = filteredRecords.reduce((sum, r) => sum + Number(r.workHours), 0);
  const totalWorkers = filteredRecords.reduce((sum, r) => sum + Number(r.workersCount), 0);

  return (
    <div className="min-h-screen lg:h-screen w-full bg-slate-100 text-slate-800 flex flex-col justify-between lg:overflow-hidden p-3 gap-2.5 font-sans">
      <header className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs shrink-0">
        <div className="flex items-center gap-2.5"><div className="p-1.5 bg-emerald-700 rounded-lg text-white"><Trees className="w-5 h-5" /></div><h1 className="text-sm font-black text-slate-800">임업경영관리 대시보드 V2.4</h1></div>
        <div className="flex items-center gap-2">
            <input type="month" value={`${selectedYear}-${parseInt(selectedMonth) < 10 ? '0'+selectedMonth : selectedMonth}`} onChange={(e) => { const [y, m] = e.target.value.split('-'); setSelectedYear(y); setSelectedMonth(parseInt(m).toString()); }} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"/>
            <button onClick={() => { setEditingRecord(null); setIsRecordModalOpen(true); }} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-lg shadow-xs cursor-pointer"><Plus className="w-4 h-4" />기록 추가</button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 h-auto shrink-0">
        <div className="bg-white rounded-xl border p-3 flex items-center gap-3"><div className="p-2.5 bg-rose-50 rounded-xl"><TrendingUp className="w-4 h-4 text-rose-600" /></div><div><p className="text-[10px] text-slate-400 font-bold">지출 총계</p><h3 className="text-sm font-black">{totalExpenses.toLocaleString()}원</h3></div></div>
        <div className="bg-white rounded-xl border p-3 flex items-center gap-3"><div className="p-2.5 bg-sky-50 rounded-xl"><Clock className="w-4 h-4 text-sky-600" /></div><div><p className="text-[10px] text-slate-400 font-bold">작업 시간</p><h3 className="text-sm font-black">{totalWorkHours.toLocaleString()}시간</h3></div></div>
        <div className="bg-white rounded-xl border p-3 flex items-center gap-3"><div className="p-2.5 bg-amber-50 rounded-xl"><Users className="w-4 h-4 text-amber-600" /></div><div><p className="text-[10px] text-slate-400 font-bold">투입 인원</p><h3 className="text-sm font-black">{totalWorkers.toLocaleString()}명</h3></div></div>
        <div className="bg-white rounded-xl border p-3 flex items-center gap-3"><div className="p-2.5 bg-emerald-50 rounded-xl"><Layers className="w-4 h-4 text-emerald-700" /></div><div><p className="text-[10px] text-slate-400 font-bold">구역</p><h3 className="text-sm font-black">{areas.length}개</h3></div></div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[280px] shrink-0">
        <ClimateChart data={CLIMATE_DATA_YEARLY[selectedYear]} selectedMonth={selectedMonth} onMonthSelect={setSelectedMonth} />
        <AreaPanel areas={areas} selectedAreaId={selectedAreaId} onSelectArea={setSelectedAreaId} onAddAreaClick={() => { setEditingArea(null); setIsAreaModalOpen(true); }} onEditAreaClick={(a) => { setEditingArea(a); setIsAreaModalOpen(true); }} onDeleteAreaClick={handleDeleteArea} />
      </section>

      <div className="flex-1 min-h-0">
        <RecordTable records={filteredRecords} areas={areas} onEditRecordClick={(r) => { setEditingRecord(r); setIsRecordModalOpen(true); }} onDeleteRecordClick={handleDeleteRecord} filterByMonth={filterByMonth} setFilterByMonth={setFilterByMonth} selectedMonth={selectedMonth} selectedYear={selectedYear} />
      </div>

      <RecordModal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} onSave={handleSaveRecord} record={editingRecord} areas={areas} />
      <AreaModal isOpen={isAreaModalOpen} onClose={() => setIsAreaModalOpen(false)} onSave={handleSaveArea} area={editingArea} />
    </div>
  );
}
