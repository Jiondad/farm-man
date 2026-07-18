export interface ForestryRecord {
  id: string;
  date: string;         // 작업일 (YYYY-MM-DD)
  weather: string;      // 날씨 (맑음, 흐림, 비, 눈, 안개)
  temperature: number;  // 온도 (°C)
  areaId: string;       // 작업구역 (Area.id)
  workersCount: number; // 참여인원 (명)
  workHours: number;    // 작업시간 (시간)
  content: string;      // 작업내용
  materials: string;    // 투입자재
  price: number;        // 단가 (원)
  quantity: number;     // 수량
  expense: number;      // 비용 = 단가 * 수량 (원)
  photoUrl: string;     // 사진 첨부 URL
}

export interface ForestryArea {
  id: string;
  name: string;         // 구역명 (예: 제1낙엽송지대)
  treeSpecies: string;  // 주요수종 (예: 소나무, 낙엽송, 편백나무, 참나무)
  areaSize: number;     // 면적 (m²)
  plantDate: string;    // 식재시기 (YYYY-MM)
  status: '정상' | '주의' | '작업필요'; // 관리상태
  description: string;  // 구역 특이사항 및 상세설명
}

export interface ClimateData {
  month: string;        // 월 (e.g. "1월")
  temperature: number;  // 평균 온도 (°C)
  precipitation: number;// 강수량 (mm)
}
