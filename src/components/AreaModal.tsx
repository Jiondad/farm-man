import React, { useState, useEffect, forwardRef } from 'react';
import { ForestryArea } from '../types';
import { X, Save, AlertCircle, Trash2, Trees, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale/ko';

const CustomAreaMonthInput = forwardRef(({ value, onClick }: any, ref: any) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 hover:border-emerald-500 rounded-lg text-xs font-semibold text-slate-800 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
  >
    <span>{value}</span>
    <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
  </button>
));
CustomAreaMonthInput.displayName = 'CustomAreaMonthInput';

interface AreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (area: ForestryArea) => void;
  onDelete?: (areaId: string) => void;
  area?: ForestryArea | null; // If editing
}

export default function AreaModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  area,
}: AreaModalProps) {
  const [name, setName] = useState('');
  const [treeSpecies, setTreeSpecies] = useState('');
  // 면적 입력을 유연하게 하기 위해 string 타입 허용
  const [areaSize, setAreaSize] = useState<number | string>(0);
  const [plantDate, setPlantDate] = useState('');
  const [status, setStatus] = useState<ForestryArea['status']>('정상');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // 시스템 현재 월 계산
    const currentMonth = new Date().toISOString().slice(0, 7);

    if (area) {
      // 수정 모드: 카멜케이스와 구글 시트의 스네이크케이스를 모두 지원하도록 호환성 추가
      setName(area.name || '');
      setTreeSpecies(area.treeSpecies || (area as any).tree_species || '왕벚나무');
      setAreaSize(area.areaSize || (area as any).area_size || 0);
      setPlantDate(area.plantDate || (area as any).plant_date || currentMonth);
      setStatus(area.status || '정상');
      setDescription(area.description || '');
    } else {
      // 신규 추가 모드: 초기값 셋업
      setName('');
      setTreeSpecies('왕벚나무'); 
      setAreaSize(0); 
      setPlantDate(currentMonth);
      setStatus('정상');
      setDescription('');
    }
    setError('');
  }, [area, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('구역명을 입력해주세요.');
      return;
    }
    if (!treeSpecies.trim()) {
      setError('주요 수종 및 재배품목을 기입해주세요.');
      return;
    }
    if (Number(areaSize) <= 0) {
      setError('면적은 0보다 커야 합니다.');
      return;
    }
    if (!plantDate) {
      setError('식재/파종/접종 시기를 기입해주세요.');
      return;
    }

    onSave({
      id: area?.id || `ZONE-${Date.now().toString(36).toUpperCase()}`,
      name,
      treeSpecies,
      areaSize: Number(areaSize) || 0, // 안전하게 숫자로 변환하여 전송
      plantDate,
      status,
      description,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trees className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="text-base font-extrabold">
                {area ? '재배/경영 구역 정보 수정' : '신규 재배/경영 구역 추가'}
              </h3>
              <p className="text-xxs text-emerald-200 font-medium">관리 대상 재배/경영 구역의 상세 정보를 기록하고 관리합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-700 rounded-lg text-emerald-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">구역명 (필수)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: E구역 (편백나무 시범단지)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tree Species */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">주요 수종 및 재배품목 (필수)</label>
              <input
                type="text"
                value={treeSpecies}
                onChange={(e) => setTreeSpecies(e.target.value)}
                placeholder="예: 편백나무, 참두릅, 표고버섯, 산양삼, 왕벚나무 등"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                required
              />
            </div>

            {/* Management Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">관리 상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ForestryArea['status'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              >
                <option value="정상">정상 생장 (안정)</option>
                <option value="주의">주의 (집중 모니터링)</option>
                <option value="작업필요">작업필요 (간벌/가지치기)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Area Size */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">경영/재배 면적 (m²)</label>
              <input
                type="number"
                min="0"
                value={areaSize}
                onChange={(e) => {
                  const val = e.target.value;
                  // 백스페이스로 모두 지웠을 때 강제로 0이나 100이 들어가는 현상 방지
                  setAreaSize(val === '' ? '' : Number(val));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                required
              />
            </div>

            {/* Planting Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">식재/파종/접종 시기 (YYYY-MM)</label>
              <DatePicker
                selected={(() => {
                  if (!plantDate) return new Date();
                  const [year, month] = plantDate.split('-');
                  return new Date(parseInt(year), parseInt(month) - 1, 1);
                })()}
                onChange={(date: Date | null) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    setPlantDate(`${year}-${month}`);
                  }
                }}
                dateFormat="yyyy년 MM월"
                showMonthYearPicker
                locale={ko}
                customInput={<CustomAreaMonthInput />}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">구역 특이사항 및 상세설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="구역 내 기후 민감도 및 관리 계획, 과거 비료 살포 이력 등을 기록해 주세요."
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              {area && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`${name} 구역을 정말 삭제하시겠습니까? 관련 경영기록의 작업구역 참조는 유지되지만 세부 조회시 영향이 갈 수 있습니다.`)) {
                      onDelete(area.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  구역 삭제
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
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
                구역 저장
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}