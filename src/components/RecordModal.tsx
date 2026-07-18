import React, { useState, useEffect } from 'react';
import { ForestryRecord, ForestryArea } from '../types';
import { X, Save, UploadCloud } from 'lucide-react';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recordData: any) => void;
  record: ForestryRecord | null;
  areas: ForestryArea[];
}

export default function RecordModal({ isOpen, onClose, onSave, record, areas }: RecordModalProps) {
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    weather: '맑음',
    temperature: '',
    humidity: '',
    precipitation: '',
    areaId: '',
    workersCount: '',
    workHours: '',
    content: '',
    materials: '',
    price: '',
    quantity: '',
    photoUrl: ''
  });

  useEffect(() => {
    if (record) {
      setFormData({
        ...record,
        // 💡 핵심 수정: 기존 데이터의 구역이 비어있다면, 화면에 표시되는 첫 번째 구역의 ID로 강제 세팅합니다.
        // 이렇게 해야 선택지가 1개뿐일 때 빈칸으로 저장되는 버그를 막을 수 있습니다.
        areaId: record.areaId || (areas.length > 0 ? areas[0].id : ''),
        temperature: record.temperature ?? '',
        humidity: record.humidity ?? '',
        precipitation: record.precipitation ?? '',
        workersCount: record.workersCount ?? '',
        workHours: record.workHours ?? '',
        price: record.price ?? '',
        quantity: record.quantity ?? ''
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weather: '맑음',
        temperature: '',
        humidity: '',
        precipitation: '',
        areaId: areas.length > 0 ? areas[0].id : '',
        workersCount: '',
        workHours: '',
        content: '',
        materials: '',
        price: '',
        quantity: '',
        photoUrl: ''
      });
    }
  }, [record, isOpen, areas]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalData = {
      ...formData,
      temperature: formData.temperature === '' ? '' : Number(formData.temperature),
      humidity: formData.humidity === '' ? '' : Number(formData.humidity),
      precipitation: formData.precipitation === '' ? '' : Number(formData.precipitation),
      workersCount: formData.workersCount === '' ? '' : Number(formData.workersCount),
      workHours: formData.workHours === '' ? '' : Number(formData.workHours),
      price: formData.price === '' ? '' : Number(formData.price),
      quantity: formData.quantity === '' ? '' : Number(formData.quantity),
    };
    
    onSave(finalData);
  };

  const totalExpense = (Number(formData.price) || 0) * (Number(formData.quantity) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight">
              {record ? '임업경영 기록 대장 수정' : '신규 임업경영 기록 대장 추가'}
            </h2>
            <p className="text-xs text-emerald-100 mt-1">구글시트 대장에 실시간으로 추가되는 경영 대장 행을 입력합니다.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-100 hover:text-white hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="p-6 overflow-y-auto">
          <form id="record-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">작업일 (필수)</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">날씨</label>
                  <select
                    name="weather"
                    value={formData.weather}
                    onChange={handleChange}
                    className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  >
                    <option value="맑음">맑음</option>
                    <option value="흐림">흐림</option>
                    <option value="비">비</option>
                    <option value="눈">눈</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">온도 (°C)</label>
                  <input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">습도 (%)</label>
                  <input
                    type="number"
                    name="humidity"
                    value={formData.humidity}
                    onChange={handleChange}
                    className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 text-emerald-700">강수량 (mm)</label>
                  <input
                    type="number"
                    name="precipitation"
                    value={formData.precipitation}
                    onChange={handleChange}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-emerald-50/30"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">작업 구역 (필수)</label>
                <select
                  name="areaId"
                  required
                  value={formData.areaId}
                  onChange={handleChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                  {areas.length === 0 && <option value="">등록된 구역이 없습니다</option>}
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">참여 인원 (명)</label>
                  <input
                    type="number"
                    name="workersCount"
                    min="0"
                    value={formData.workersCount}
                    onChange={handleChange}
                    className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">작업 시간 (시간)</label>
                  <input
                    type="number"
                    name="workHours"
                    min="0"
                    step="0.5"
                    value={formData.workHours}
                    onChange={handleChange}
                    className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">작업 내용 (필수)</label>
              <input
                type="text"
                name="content"
                required
                value={formData.content}
                onChange={handleChange}
                placeholder="예: 참두릅 파종, 표고버섯 종균 접종, 왕벚나무 식재, 잡목 제거 등"
                className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">투입 자재</label>
                <input
                  type="text"
                  name="materials"
                  value={formData.materials}
                  onChange={handleChange}
                  placeholder="예: 친환경 유기비료"
                  className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">단가 (원)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">수량</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  step="0.1"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">산출 지출 비용 (수량 * 단가):</span>
              <span className="text-sm font-black text-slate-800">{totalExpense.toLocaleString()} 원</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">작업 사진 및 영수증/증빙 서류 첨부 (URL 입력)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                <input
                  type="url"
                  name="photoUrl"
                  value={formData.photoUrl}
                  onChange={handleChange}
                  placeholder="https:// (사진 주소 입력)"
                  className="w-full max-w-sm text-center bg-transparent focus:outline-none border-b border-slate-300 focus:border-emerald-500 text-sm pb-1 mb-1"
                />
                <p className="text-[10px] text-slate-400">사진의 URL 주소를 붙여넣어 첨부하세요</p>
              </div>
            </div>
          </form>
        </div>

        {/* 모달 푸터 */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-all cursor-pointer shadow-sm"
          >
            취소
          </button>
          <button
            type="submit"
            form="record-form"
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-black text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-all cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            {record ? '대장 수정' : '대장 저장'}
          </button>
        </div>

      </div>
    </div>
  );
}