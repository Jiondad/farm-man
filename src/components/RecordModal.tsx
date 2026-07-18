import React, { useState, useEffect } from 'react';
import { ForestryRecord, ForestryArea } from '../types';
import { X, Save, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import { WEATHER_OPTIONS } from '../data';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<ForestryRecord, 'id' | 'expense'> & { id?: string }) => void;
  record?: ForestryRecord | null; // If editing
  areas: ForestryArea[];
}

// Preset list of beautiful forest photos that fit any work content
const PHOTO_PRESETS = [
  { name: '금강송 숲', url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=500&q=80' },
  { name: '밀창 침엽수림', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&q=80' },
  { name: '가을 단풍지대', url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=500&q=80' },
  { name: '아침 안개 조림지', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80' },
  { name: '울창한 녹색림', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=500&q=80' },
];

export default function RecordModal({
  isOpen,
  onClose,
  onSave,
  record,
  areas,
}: RecordModalProps) {
  const [date, setDate] = useState('');
  const [weather, setWeather] = useState('맑음');
  const [temperature, setTemperature] = useState(24);
  const [areaId, setAreaId] = useState('');
  const [workersCount, setWorkersCount] = useState(1);
  const [workHours, setWorkHours] = useState(4);
  const [content, setContent] = useState('');
  const [materials, setMaterials] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [photoUrl, setPhotoUrl] = useState(PHOTO_PRESETS[0].url);
  const [error, setError] = useState('');

  // Hydrate fields if editing
  useEffect(() => {
    if (record) {
      setDate(record.date);
      setWeather(record.weather);
      setTemperature(record.temperature);
      setAreaId(record.areaId);
      setWorkersCount(record.workersCount);
      setWorkHours(record.workHours);
      setContent(record.content);
      setMaterials(record.materials);
      setPrice(record.price);
      setQuantity(record.quantity);
      setPhotoUrl(record.photoUrl || PHOTO_PRESETS[0].url);
    } else {
      // Default initialization for new records
      const todayStr = new Date().toISOString().split('T')[0];
      setDate(todayStr);
      setWeather('맑음');
      setTemperature(25);
      setAreaId(areas.length > 0 ? areas[0].id : '');
      setWorkersCount(2);
      setWorkHours(8);
      setContent('');
      setMaterials('');
      setPrice(0);
      setQuantity(0);
      setPhotoUrl(PHOTO_PRESETS[0].url);
    }
    setError('');
  }, [record, isOpen, areas]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      setError('작업일을 입력해주세요.');
      return;
    }
    if (!areaId) {
      setError('작업구역을 선택해주세요. 구역이 없다면 먼저 경영 대상 구역을 추가해 주세요.');
      return;
    }
    if (!content.trim()) {
      setError('작업 내용을 기술해 주세요.');
      return;
    }
    if (workersCount <= 0) {
      setError('참여 인원은 1명 이상이어야 합니다.');
      return;
    }
    if (workHours <= 0) {
      setError('작업 시간은 0보다 커야 합니다.');
      return;
    }

    onSave({
      id: record?.id,
      date,
      weather,
      temperature: Number(temperature),
      areaId,
      workersCount: Number(workersCount),
      workHours: Number(workHours),
      content,
      materials,
      price: Number(price),
      quantity: Number(quantity),
      photoUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-300" />
              {record ? '임업경영 기록 수정' : '신규 임업경영 기록 대장 추가'}
            </h3>
            <p className="text-xxs text-emerald-200 font-medium">구글시트 대장에 실시간으로 추가되는 경영 대장 행을 입력합니다.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-700 rounded-lg text-emerald-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Grid Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">작업일 (필수)</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                required
              />
            </div>

            {/* Weather & Temperature */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">날씨</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                >
                  {WEATHER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">온도 (°C)</label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  placeholder="24"
                />
              </div>
            </div>

            {/* Work Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">작업 구역 (필수)</label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                required
              >
                <option value="">-- 구역 선택 --</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} ({area.treeSpecies})
                  </option>
                ))}
              </select>
            </div>

            {/* Workers Count / Work Hours */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">참여 인원 (명)</label>
                <input
                  type="number"
                  min="1"
                  value={workersCount}
                  onChange={(e) => setWorkersCount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">작업 시간 (시간)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={workHours}
                  onChange={(e) => setWorkHours(Math.max(0.5, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Work Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">작업 내용 (필수)</label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              placeholder="예: 금강송 우량목 가지치기 및 잡목정리"
              required
            />
          </div>

          {/* Materials & Finance */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">투입 자재</label>
              <input
                type="text"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                placeholder="예: 친환경 유기비료"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">단가 (원)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">수량</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                placeholder="0"
              />
            </div>
          </div>

          {/* Simulated Cost Summary */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">산출 지출 비용 (수량 * 단가):</span>
            <span className="text-sm font-black text-emerald-800">{(price * quantity).toLocaleString()} 원</span>
          </div>

          {/* Photo attachment selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">작업 사진 첨부 (갤러리 프리셋 선택)</label>
            <div className="grid grid-cols-5 gap-2">
              {PHOTO_PRESETS.map((ph) => {
                const isSelected = photoUrl === ph.url;
                return (
                  <div
                    key={ph.name}
                    onClick={() => setPhotoUrl(ph.url)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all relative group ${
                      isSelected ? 'border-emerald-600 scale-[1.03] shadow-md' : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <img src={ph.url} alt={ph.name} className="w-full h-12 object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 p-0.5 text-[8px] text-white text-center truncate font-semibold">
                      {ph.name}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Custom URL Input if needed */}
            <div className="mt-2.5">
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="또는 커스텀 이미지 URL을 직접 기입하세요"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              대장 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
