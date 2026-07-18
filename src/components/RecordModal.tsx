import React, { useState, useEffect } from 'react';
import { ForestryRecord, ForestryArea } from '../types';
import { X, Save, AlertCircle, Sparkles, HelpCircle, UploadCloud, FileText, Trash2, Paperclip } from 'lucide-react';
import { WEATHER_OPTIONS } from '../data';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<ForestryRecord, 'id' | 'expense'> & { id?: string }) => void;
  record?: ForestryRecord | null; // If editing
  areas: ForestryArea[];
}

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
  const [humidity, setHumidity] = useState(60);
  const [areaId, setAreaId] = useState('');
  const [workersCount, setWorkersCount] = useState(1);
  const [workHours, setWorkHours] = useState(4);
  const [content, setContent] = useState('');
  const [materials, setMaterials] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState('');

  // Local state for uploaded files
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [existingFileNames, setExistingFileNames] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Hydrate fields if editing
  useEffect(() => {
    if (record) {
      setDate(record.date);
      setWeather(record.weather);
      setTemperature(record.temperature);
      setHumidity(record.humidity !== undefined ? record.humidity : 60);
      setAreaId(record.areaId);
      setWorkersCount(record.workersCount);
      setWorkHours(record.workHours);
      setContent(record.content);
      setMaterials(record.materials);
      setPrice(record.price);
      setQuantity(record.quantity);

      // Handle parsing of photoUrl
      if (record.photoUrl) {
        if (record.photoUrl.startsWith('http')) {
          setExistingFileNames([record.photoUrl]);
        } else {
          setExistingFileNames(record.photoUrl.split(',').map(s => s.trim()).filter(Boolean));
        }
      } else {
        setExistingFileNames([]);
      }
      setAttachedFiles([]);
    } else {
      // Default initialization for new records
      const todayStr = new Date().toISOString().split('T')[0];
      setDate(todayStr);
      setWeather('맑음');
      setTemperature(25);
      setHumidity(60);
      setAreaId(areas.length > 0 ? areas[0].id : '');
      setWorkersCount(2);
      setWorkHours(8);
      setContent('');
      setMaterials('');
      setPrice(0);
      setQuantity(0);
      setExistingFileNames([]);
      setAttachedFiles([]);
    }
    setError('');
  }, [record, isOpen, areas]);

  if (!isOpen) return null;

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files) as File[];
      const validFiles = filesArray.filter(
        file => file.type.startsWith('image/') || file.type === 'application/pdf'
      );
      if (validFiles.length > 0) {
        setAttachedFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const removeExistingFile = (index: number) => {
    setExistingFileNames(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      setError('작업일을 입력해주세요.');
      return;
    }
    if (!areaId) {
      setError('작업구역을 선택해주세요. 구역이 없다면 먼저 재배/경영 구역을 추가해 주세요.');
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

    // Combine existing file names and newly attached local files
    const combinedFiles = [
      ...existingFileNames,
      ...attachedFiles.map(f => f.name)
    ];
    const finalPhotoUrl = combinedFiles.join(', ');

    onSave({
      id: record?.id,
      date,
      weather,
      temperature: Number(temperature),
      humidity: Number(humidity),
      areaId,
      workersCount: Number(workersCount),
      workHours: Number(workHours),
      content,
      materials,
      price: Number(price),
      quantity: Number(quantity),
      photoUrl: finalPhotoUrl,
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

            {/* Weather & Temperature & Humidity */}
            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">날씨</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
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
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  placeholder="24"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">습도 (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  placeholder="60"
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
              placeholder="예: 참두릅 파종, 표고버섯 종균 접종, 왕벚나무 식재, 잡목 제거 등"
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

          {/* File Upload Zone */}
          <div className="border-t border-slate-100 pt-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">작업 사진 및 영수증/증빙 서류 첨부 (다중 파일 업로드)</label>
            
            {/* Drop Zone Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload-input')?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging 
                  ? 'border-emerald-600 bg-emerald-50/50 scale-[1.01]' 
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <input
                id="file-upload-input"
                type="file"
                multiple
                accept="image/*, application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className={`p-2.5 rounded-full ${isDragging ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'} transition-colors`}>
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-700">파일을 드래그 앤 드롭하거나 클릭하여 첨부하세요</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">이미지(JPG, PNG) 및 PDF 파일 첨부 가능</p>
                </div>
              </div>
            </div>

            {/* Attached Files List */}
            {((existingFileNames.length > 0) || (attachedFiles.length > 0)) && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">첨부된 파일 목록 ({existingFileNames.length + attachedFiles.length}개)</p>
                
                <div className="bg-slate-50/60 rounded-xl border border-slate-100 p-2 space-y-1 max-h-[160px] overflow-y-auto">
                  {/* Render existing saved files */}
                  {existingFileNames.map((fileName, idx) => (
                    <div key={`existing-${idx}`} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200/60 shadow-3xs group/item">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {fileName.startsWith('http') ? (
                          <img src={fileName} className="w-5 h-5 rounded object-cover shrink-0" referrerPolicy="no-referrer" />
                        ) : (
                          <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xxs font-semibold text-slate-600 truncate" title={fileName}>
                          {fileName.startsWith('http') ? '온라인 연동 이미지 (기본값)' : fileName}
                        </span>
                        <span className="text-[9px] font-extrabold px-1 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded shrink-0">기존 파일</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingFile(idx)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                        title="기존 첨부 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Render newly attached local files */}
                  {attachedFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200/60 shadow-3xs group/item">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {file.type.startsWith('image/') ? (
                          <div className="w-5 h-5 rounded overflow-hidden shrink-0 bg-slate-100">
                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xxs font-semibold text-slate-700 truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                        <span className="text-[9px] font-extrabold px-1 py-0.2 bg-amber-50 text-amber-700 border border-amber-100 rounded shrink-0">대기 중</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachedFile(idx)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                        title="첨부 취소"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
