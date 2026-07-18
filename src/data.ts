import { ForestryArea, ForestryRecord, ClimateData } from './types';

export const DEFAULT_AREAS: ForestryArea[] = [
  {
    id: 'ZONE-A',
    name: 'Latitude 38 조경수 구역',
    treeSpecies: '왕벚나무',
    areaSize: 990,
    plantDate: '2024-04',
    status: '정상',
    description: '조경수 목적의 왕벚나무 묘목 식재 구역. 생장 상태 양호하며 지주대 고정 상태 양호.'
  },
  {
    id: 'ZONE-B',
    name: '산나물 노지 재배장',
    treeSpecies: '참두릅',
    areaSize: 1500,
    plantDate: '2025-03',
    status: '정상',
    description: '배수가 잘되는 경사지 노지 재배장. 봄철 새순 수확 이후 예초 및 추비 완료.'
  },
  {
    id: 'ZONE-C',
    name: '원목 버섯 재배사',
    treeSpecies: '표고버섯',
    areaSize: 500,
    plantDate: '2025-11',
    status: '정상',
    description: '참나무 원목 표고버섯 종균 접종 및 우물정자 쌓기 완료. 차광막 차광률 85% 유지 중.'
  },
  {
    id: 'ZONE-D',
    name: '임간 약초 재배지',
    treeSpecies: '산양삼',
    areaSize: 2000,
    plantDate: '2023-10',
    status: '주의',
    description: '천연 활엽수림 아래 낙엽층 내 산양삼 파종지. 일부 멧돼지 등 야생동물 침입 징후 있어 울타리 정비 필요.'
  }
];

export const DEFAULT_RECORDS: ForestryRecord[] = [
  {
    id: 'REC-001',
    date: '2026-07-01',
    weather: '맑음',
    temperature: 28,
    humidity: 55,
    areaId: 'ZONE-A',
    workersCount: 4,
    workHours: 6,
    content: '왕벚나무 조경수 식재(36주) 및 물주기 작업, 지주대 보강',
    materials: '왕벚나무 묘목 (H2.5, R6)',
    price: 35000,
    quantity: 36,
    expense: 1260000,
    photoUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=500&q=80' // Forest sun rays
  },
  {
    id: 'REC-002',
    date: '2026-07-05',
    weather: '맑음',
    temperature: 30,
    humidity: 62,
    areaId: 'ZONE-B',
    workersCount: 3,
    workHours: 8,
    content: '참두릅 노지 구역 파종 작업 및 잡초 억제용 친환경 멀칭 작업',
    materials: '참두릅 종근 및 왕겨 멀칭재',
    price: 15000,
    quantity: 10,
    expense: 150000,
    photoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&q=80' // Dense woods
  },
  {
    id: 'REC-003',
    date: '2026-07-10',
    weather: '흐림',
    temperature: 26,
    humidity: 75,
    areaId: 'ZONE-C',
    workersCount: 2,
    workHours: 4,
    content: '참나무 원목 표고버섯 종균 접종(천공 및 접종기 사용)',
    materials: '성형 표고 종균 (산림버섯연구소)',
    price: 12000,
    quantity: 8,
    expense: 96000,
    photoUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=500&q=80' // Autumn/summer forest
  },
  {
    id: 'REC-004',
    date: '2026-07-12',
    weather: '비',
    temperature: 22,
    humidity: 90,
    areaId: 'ZONE-D',
    workersCount: 2,
    workHours: 3,
    content: '임간 약초 재배지 야생동물 피해 예방용 침입 방지망 및 지주 파이프 보강 작업',
    materials: '울타리망 및 메탈 지주대',
    price: 8500,
    quantity: 20,
    expense: 170000,
    photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80' // Mountain stream / mist
  },
  {
    id: 'REC-005',
    date: '2026-07-15',
    weather: '맑음',
    temperature: 31,
    humidity: 48,
    areaId: 'ZONE-A',
    workersCount: 5,
    workHours: 7,
    content: '왕벚나무 지주대 유인끈 조정 및 묘목 가뭄 방지용 멀칭 보완',
    materials: '친환경 가뭄 대비 볏짚',
    price: 5000,
    quantity: 12,
    expense: 60000,
    photoUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=500&q=80' // Pine trees
  }
];

export const CLIMATE_DATA_YEARLY: Record<string, ClimateData[]> = {
  '2026': [
    { month: '1월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '2월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '3월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '4월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '5월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '6월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '7월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '8월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '9월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '10월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '11월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '12월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 }
  ],
  '2025': [
    { month: '1월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '2월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '3월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '4월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '5월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '6월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '7월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '8월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '9월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '10월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '11월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 },
    { month: '12월', temperature: 0, avgTemperature: 0, precipitation: 0, humidity: 0 }
  ]
};

export const DEFAULT_ADDRESS = '경기도 연천군 산림경영 대상지 (Latitude 38)';

export const WEATHER_OPTIONS = ['맑음', '흐림', '비', '눈', '안개'];
