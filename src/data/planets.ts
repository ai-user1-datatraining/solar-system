export interface PlanetData {
  id: string;
  name: string;
  nameEn: string;
  radius: number; // 顯示半徑（像素）
  orbitRadius: number; // 軌道半徑（像素）
  orbitalPeriod: number; // 公轉週期（地球日）
  diameter: string; // 實際直徑
  distanceFromSun: string; // 與太陽距離
  description: string;
  color: string;
  glowColor: string;
  speed: number; // 動畫速度因子
}

export const planets: PlanetData[] = [
  {
    id: 'mercury',
    name: '水星',
    nameEn: 'Mercury',
    radius: 4,
    orbitRadius: 60,
    orbitalPeriod: 88,
    diameter: '4,879 km',
    distanceFromSun: '5,790 萬 km',
    description: '太陽系中最小的行星，也是距離太陽最近的行星。表面佈滿隕石坑，溫差極大。',
    color: '#b5b5b5',
    glowColor: '#8a8a8a',
    speed: 4.15,
  },
  {
    id: 'venus',
    name: '金星',
    nameEn: 'Venus',
    radius: 7,
    orbitRadius: 90,
    orbitalPeriod: 225,
    diameter: '12,104 km',
    distanceFromSun: '1.082 億 km',
    description: '太陽系中最熱的行星，擁有濃厚的二氧化碳大氣層。自轉方向與其他行星相反。',
    color: '#e8cda0',
    glowColor: '#d4a853',
    speed: 1.62,
  },
  {
    id: 'earth',
    name: '地球',
    nameEn: 'Earth',
    radius: 8,
    orbitRadius: 125,
    orbitalPeriod: 365,
    diameter: '12,756 km',
    distanceFromSun: '1.496 億 km',
    description: '我們的家園，太陽系中唯一已知存在生命的行星。擁有液態水和適宜的大氣層。',
    color: '#4da6ff',
    glowColor: '#2980b9',
    speed: 1.0,
  },
  {
    id: 'mars',
    name: '火星',
    nameEn: 'Mars',
    radius: 6,
    orbitRadius: 165,
    orbitalPeriod: 687,
    diameter: '6,792 km',
    distanceFromSun: '2.279 億 km',
    description: '被稱為「紅色星球」，表面富含氧化鐵。擁有太陽系最高的山——奧林帕斯山。',
    color: '#e74c3c',
    glowColor: '#c0392b',
    speed: 0.53,
  },
  {
    id: 'jupiter',
    name: '木星',
    nameEn: 'Jupiter',
    radius: 18,
    orbitRadius: 220,
    orbitalPeriod: 4333,
    diameter: '142,984 km',
    distanceFromSun: '7.786 億 km',
    description: '太陽系中最大的行星，是一顆氣態巨行星。著名的大紅斑是一個持續數百年的風暴。',
    color: '#d4a574',
    glowColor: '#b87333',
    speed: 0.084,
  },
  {
    id: 'saturn',
    name: '土星',
    nameEn: 'Saturn',
    radius: 15,
    orbitRadius: 280,
    orbitalPeriod: 10759,
    diameter: '120,536 km',
    distanceFromSun: '14.34 億 km',
    description: '以壯觀的環系統聞名，主要由冰和岩石碎片組成。密度低於水，是唯一能浮在水上的行星。',
    color: '#f0d58c',
    glowColor: '#c9a84c',
    speed: 0.034,
  },
  {
    id: 'uranus',
    name: '天王星',
    nameEn: 'Uranus',
    radius: 11,
    orbitRadius: 335,
    orbitalPeriod: 30687,
    diameter: '51,118 km',
    distanceFromSun: '28.71 億 km',
    description: '一顆冰巨行星，軸傾角接近90度，幾乎是「躺著」公轉。呈現獨特的藍綠色。',
    color: '#7ec8e3',
    glowColor: '#45b7d1',
    speed: 0.012,
  },
  {
    id: 'neptune',
    name: '海王星',
    nameEn: 'Neptune',
    radius: 10,
    orbitRadius: 385,
    orbitalPeriod: 60190,
    diameter: '49,528 km',
    distanceFromSun: '45.04 億 km',
    description: '太陽系最外層的行星，風速可達每小時2,100公里，是太陽系中風速最快的行星。',
    color: '#3498db',
    glowColor: '#2471a3',
    speed: 0.006,
  },
];

export const sunData = {
  name: '太陽',
  nameEn: 'Sun',
  diameter: '1,392,700 km',
  description: '太陽系的中心恆星，佔據太陽系總質量的99.86%。是一顆G型主序星，表面溫度約5,500°C。',
  radius: 30,
  color: '#ffd700',
  glowColor: '#ff8c00',
};
