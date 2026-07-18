import React from 'react';
import { ForestryArea } from '../types';
import { Layers, ChevronRight, Trees, Settings, Calendar, Maximize2, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface AreaPanelProps {
  areas: ForestryArea[];
  selectedAreaId: string;
  onSelectArea: (id: string) => void;
  onAddAreaClick: () => void;
  onEditAreaClick: (area: ForestryArea) => void;
  onDeleteAreaClick: (areaId: string) => void;
}

export default function AreaPanel({
  areas,
  selectedAreaId,
  onSelectArea,
  onAddAreaClick,
  onEditAreaClick,
  onDeleteAreaClick,
}: AreaPanelProps) {
  // Find currently selected area, fallback to first one if not found
  const selectedArea = areas.find(a => a.id === selectedAreaId) || areas[0];

  const getStatusStyle = (status: ForestryArea['status']) => {
    switch (status) {
      case '정상':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '주의':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '작업필요':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs h-full flex flex-col justify-between overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">경영 대상 구역 정보</h3>
            <p className="text-xxs text-slate-500">등록된 조림지 구역 상태 및 수종 현황</p>
          </div>
        </div>
        <button
          onClick={onAddAreaClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          구역 추가
        </button>
      </div>

      {/* Main Panel Content (Grid 2 Columns: Left list, Right details) */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Column: List (Max 4 items to strictly avoid scrolling) */}
        <div className="col-span-5 border-r border-slate-100 flex flex-col justify-start overflow-hidden bg-slate-50/20">
          <div className="flex-1 flex flex-col justify-between p-1.5 gap-1 overflow-hidden">
            {areas.slice(0, 4).map((area) => {
              const isSelected = area.id === selectedArea?.id;
              return (
                <div
                  key={area.id}
                  onClick={() => onSelectArea(area.id)}
                  className={`group flex items-center justify-between p-2 rounded-lg border transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-2xs'
                      : 'bg-white border-slate-100 hover:bg-slate-50/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1 rounded-md transition-colors ${
                      isSelected ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Trees className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{area.name}</p>
                      <p className="text-[10px] text-slate-400 truncate font-medium">{area.treeSpecies}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold border ${getStatusStyle(area.status)}`}>
                      {area.status}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                      isSelected ? 'text-emerald-700 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                    }`} />
                  </div>
                </div>
              );
            })}
            
            {/* If there are more than 4 areas (rare but handled gracefully without layout break) */}
            {areas.length > 4 && (
              <p className="text-[9px] text-center text-slate-400 font-medium py-0.5">
                외 {areas.length - 4}개 구역 등록됨 (화면 레이아웃 최적화)
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Detailed View */}
        <div className="col-span-7 p-3 flex flex-col justify-between overflow-hidden bg-white">
          {selectedArea ? (
            <div className="flex flex-col justify-between h-full">
              {/* Header Info */}
              <div>
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-xs font-extrabold text-slate-800 truncate">{selectedArea.name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${getStatusStyle(selectedArea.status)}`}>
                        {selectedArea.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span className="font-bold text-emerald-800">주요수종:</span> {selectedArea.treeSpecies}
                    </p>
                  </div>

                  {/* Actions for current area */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAreaClick(selectedArea);
                      }}
                      title="구역 정보 수정"
                      className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded-md transition-colors cursor-pointer border border-slate-100"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAreaClick(selectedArea.id);
                      }}
                      disabled={areas.length <= 1} // Keep at least 1 area
                      title={areas.length <= 1 ? "최소 1개의 구역이 유지되어야 합니다" : "구역 삭제"}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-50 disabled:opacity-30 rounded-md transition-colors cursor-pointer border border-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description Grid */}
                <p className="text-[11px] text-slate-600 line-clamp-2 mt-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100 leading-normal">
                  {selectedArea.description || '특이사항 없음.'}
                </p>
              </div>

              {/* Badges / Stats (Size, Plant Date) */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100/80">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-slate-50 rounded text-slate-500">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 leading-none">조림 면적</p>
                    <p className="text-xs font-extrabold text-slate-700">{selectedArea.areaSize.toLocaleString()} m²</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-slate-50 rounded text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 leading-none">식재 시기</p>
                    <p className="text-xs font-extrabold text-slate-700">{selectedArea.plantDate}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-4">
              <AlertCircle className="w-8 h-8 text-slate-300 mb-1" />
              <p className="text-xs font-semibold">구역을 선택하거나 새로 추가해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
