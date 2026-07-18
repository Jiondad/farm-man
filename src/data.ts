import { ForestryArea, ForestryRecord, ClimateData } from './types';

export const DEFAULT_AREAS: ForestryArea[] = [
  {
    id: 'ZONE-A',
    name: 'A구역 (소나무 군락지)',
    treeSpecies: '강송 (금강소나무)',
    areaSize: 12500,
    plantDate: '2015-04',
    status: '정상',
    description: '식재 후 11년 경과. 생장 상태 매우 양호함. 주기적인 가지치기 및 잡목 제거 완료.'
  },
  {
    id: 'ZONE-B',
    name: 'B구역 (편백나무 숲)',
    treeSpecies: '편백나무',
    areaSize: 8400,
    plantDate: '2018-05',
    status: '정상',
    description: '피톤치드 방출량 우수. 토양 수분 상태 양호하며 병해충 감염 이력 없음.'
  },
  {
    id: 'ZONE-C',
    name: 'C구역 (낙엽송 조림지)',
    treeSpecies: '일본잎갈나무 (낙엽송)',
    areaSize: 15000,
    plantDate: '2020-03',
    status: '작업필요',
    description: '밀도가 조밀하여 간벌(나무솎기) 작업 예정. 하층 식생 무성하여 예초 필요.'
  },
  {
    id: 'ZONE-D',
    name: 'D구역 (참나무 군락)',
    treeSpecies: '상수리나무 / 신갈나무',
    areaSize: 9800,
    plantDate: '2012-10',
    status: '주의',
    description: '일부 참나무 시들음병 의심 징후 발견. 주기적인 모니터링 및 방제 대책 필요.'
  }
];

export const DEFAULT_RECORDS: ForestryRecord[] = [
  {
    id: 'REC-001',
    date: '2026-07-01',
    weather: '맑음',
    temperature: 28,
    areaId: 'ZONE-B',
    workersCount: 4,
    workHours: 6,
    content: '편백나무 가식지 잡초 제거 및 토양 비료 살포',
    materials: '복합비료 (유기질)',
    price: 18000,
    quantity: 10,
    expense: 180000,
    photoUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=500&q=80' // Forest sun rays
  },
  {
    id: 'REC-002',
    date: '2026-07-05',
    weather: '맑음',
    temperature: 30,
    areaId: 'ZONE-C',
    workersCount: 3,
    workHours: 8,
    content: '낙엽송 조림지 하층 식생 예초 및 가지치기',
    materials: '예초기 연료 및 날',
    price: 25000,
    quantity: 2,
    expense: 50000,
    photoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&q=80' // Dense woods
  },
  {
    id: 'REC-003',
    date: '2026-07-10',
    weather: '흐림',
    temperature: 26,
    areaId: 'ZONE-D',
    workersCount: 2,
    workHours: 4,
    content: '참나무 시들음병 해충 방제 트랩 설치 및 약제 주입',
    materials: '시들음병 방제 약제',
    price: 35000,
    quantity: 5,
    expense: 175000,
    photoUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=500&q=80' // Autumn/summer forest
  },
  {
    id: 'REC-004',
    date: '2026-07-12',
    weather: '비',
    temperature: 22,
    areaId: 'ZONE-A',
    workersCount: 2,
    workHours: 3,
    content: '우천 대비 산사태 방지 배수로 정비 및 토사 보강',
    materials: '마대 자루',
    price: 1500,
    quantity: 30,
    expense: 45000,
    photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80' // Mountain stream / mist
  },
  {
    id: 'REC-005',
    date: '2026-07-15',
    weather: '맑음',
    temperature: 31,
    areaId: 'ZONE-A',
    workersCount: 5,
    workHours: 7,
    content: '금강송 우량목 가지치기 및 아랫가지 정리 작업',
    materials: '가지치기 고지톱 날',
    price: 12000,
    quantity: 4,
    expense: 48000,
    photoUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=500&q=80' // Pine trees
  }
];

export const CLIMATE_DATA_YEARLY: Record<string, ClimateData[]> = {
  '2026': [
    { month: '1월', temperature: -2.4, precipitation: 18 },
    { month: '2월', temperature: 0.8, precipitation: 24 },
    { month: '3월', temperature: 6.2, precipitation: 45 },
    { month: '4월', temperature: 12.5, precipitation: 68 },
    { month: '5월', temperature: 18.1, precipitation: 82 },
    { month: '6월', temperature: 22.8, precipitation: 145 },
    { month: '7월', temperature: 26.5, precipitation: 290 }, // Current Selected
    { month: '8월', temperature: 27.2, precipitation: 240 },
    { month: '9월', temperature: 21.8, precipitation: 135 },
    { month: '10월', temperature: 15.3, precipitation: 55 },
    { month: '11월', temperature: 7.9, precipitation: 38 },
    { month: '12월', temperature: 0.2, precipitation: 22 }
  ],
  '2025': [
    { month: '1월', temperature: -3.0, precipitation: 12 },
    { month: '2월', temperature: -0.5, precipitation: 18 },
    { month: '3월', temperature: 5.8, precipitation: 35 },
    { month: '4월', temperature: 11.9, precipitation: 55 },
    { month: '5월', temperature: 17.5, precipitation: 95 },
    { month: '6월', temperature: 21.9, precipitation: 120 },
    { month: '7월', temperature: 25.8, precipitation: 310 },
    { month: '8월', temperature: 26.9, precipitation: 195 },
    { month: '9월', temperature: 22.1, precipitation: 160 },
    { month: '10월', temperature: 14.8, precipitation: 48 },
    { month: '11월', temperature: 8.2, precipitation: 42 },
    { month: '12월', temperature: -0.8, precipitation: 28 }
  ]
};

export const DEFAULT_ADDRESS = '강원특별자치도 평창군 대관령면 횡계리 산 145-3 (국유림 경영 대장 제2026-04호)';

export const WEATHER_OPTIONS = ['맑음', '흐림', '비', '눈', '안개'];
