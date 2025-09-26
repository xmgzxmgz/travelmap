import { POI } from '../types';
import { allExtendedPOIs, getPOIsByCity, getAllCities } from './extendedPOIs';

/**
 * 热度排名前50的景点数据
 * 包含全国各地知名景点，按热度排名
 */
export const hotspotPOIs: POI[] = [
  // 北京地区热门景点 (排名1-10)
  {
    id: 'hotspot_1',
    name: '故宫博物院',
    coordinates: { lat: 39.9163, lng: 116.3972 },
    address: '北京市东城区景山前街4号',
    category: '博物馆',
    description: '明清两朝的皇家宫殿，世界文化遗产',
    suggestedDuration: 180,
    openHours: '08:30-17:00',
    isCustom: false,
    hotRank: 1,
    rating: 4.8,
    ticketPrice: 60,
    imageUrl: '/images/forbidden-city.jpg'
  },
  {
    id: 'hotspot_2',
    name: '长城-八达岭段',
    coordinates: { lat: 40.3584, lng: 116.0138 },
    address: '北京市延庆区八达岭镇',
    category: '历史遗迹',
    description: '万里长城最著名的段落，世界文化遗产',
    suggestedDuration: 300,
    openHours: '07:00-18:00',
    isCustom: false,
    hotRank: 2,
    rating: 4.7,
    ticketPrice: 45,
    imageUrl: '/images/great-wall.jpg'
  },
  {
    id: 'hotspot_3',
    name: '天坛公园',
    coordinates: { lat: 39.8828, lng: 116.4067 },
    address: '北京市东城区天坛路甲1号',
    category: '公园',
    description: '明清皇帝祭天的场所，世界文化遗产',
    suggestedDuration: 120,
    openHours: '06:00-22:00',
    isCustom: false,
    hotRank: 3,
    rating: 4.6,
    ticketPrice: 15,
    imageUrl: '/images/temple-of-heaven.jpg'
  },
  {
    id: 'hotspot_4',
    name: '颐和园',
    coordinates: { lat: 39.9998, lng: 116.2754 },
    address: '北京市海淀区新建宫门路19号',
    category: '公园',
    description: '中国古典园林之首，世界文化遗产',
    suggestedDuration: 240,
    openHours: '06:30-18:00',
    isCustom: false,
    hotRank: 4,
    rating: 4.7,
    ticketPrice: 30,
    imageUrl: '/images/summer-palace.jpg'
  },
  {
    id: 'hotspot_5',
    name: '南锣鼓巷',
    coordinates: { lat: 39.9368, lng: 116.4034 },
    address: '北京市东城区南锣鼓巷',
    category: '商业街',
    description: '北京最古老的街区之一，胡同文化体验',
    suggestedDuration: 90,
    openHours: '全天开放',
    isCustom: false,
    hotRank: 5,
    rating: 4.3,
    ticketPrice: 0,
    imageUrl: '/images/nanluoguxiang.jpg'
  },

  // 上海地区热门景点 (排名6-15)
  {
    id: 'hotspot_6',
    name: '外滩',
    coordinates: { lat: 31.2397, lng: 121.4912 },
    address: '上海市黄浦区中山东一路',
    category: '观光',
    description: '上海标志性景观，万国建筑博览群',
    suggestedDuration: 120,
    openHours: '全天开放',
    isCustom: false,
    hotRank: 6,
    rating: 4.6,
    ticketPrice: 0,
    imageUrl: '/images/bund.jpg'
  },
  {
    id: 'hotspot_7',
    name: '东方明珠塔',
    coordinates: { lat: 31.2397, lng: 121.4995 },
    address: '上海市浦东新区世纪大道1号',
    category: '观光',
    description: '上海地标建筑，360度俯瞰上海全景',
    suggestedDuration: 150,
    openHours: '08:00-21:30',
    isCustom: false,
    hotRank: 7,
    rating: 4.4,
    ticketPrice: 220,
    imageUrl: '/images/oriental-pearl.jpg'
  },
  {
    id: 'hotspot_8',
    name: '豫园',
    coordinates: { lat: 31.2276, lng: 121.4923 },
    address: '上海市黄浦区福佑路168号',
    category: '园林',
    description: '明代私人花园，江南古典园林代表',
    suggestedDuration: 120,
    openHours: '08:30-17:30',
    isCustom: false,
    hotRank: 8,
    rating: 4.3,
    ticketPrice: 40,
    imageUrl: '/images/yuyuan.jpg'
  },
  {
    id: 'hotspot_9',
    name: '田子坊',
    coordinates: { lat: 31.2108, lng: 121.4644 },
    address: '上海市黄浦区泰康路210弄',
    category: '艺术区',
    description: '上海特色创意园区，艺术与商业结合',
    suggestedDuration: 90,
    openHours: '10:00-22:00',
    isCustom: false,
    hotRank: 9,
    rating: 4.2,
    ticketPrice: 0,
    imageUrl: '/images/tianzifang.jpg'
  },
  {
    id: 'hotspot_10',
    name: '上海迪士尼乐园',
    coordinates: { lat: 31.1434, lng: 121.6580 },
    address: '上海市浦东新区川沙镇黄赵路310号',
    category: '主题公园',
    description: '中国大陆首个迪士尼主题乐园',
    suggestedDuration: 480,
    openHours: '08:00-22:00',
    isCustom: false,
    hotRank: 10,
    rating: 4.5,
    ticketPrice: 399,
    imageUrl: '/images/shanghai-disney.jpg'
  },

  // 西安地区热门景点 (排名11-20)
  {
    id: 'hotspot_11',
    name: '兵马俑博物馆',
    coordinates: { lat: 34.3848, lng: 109.2734 },
    address: '陕西省西安市临潼区秦始皇陵以东1.5公里处',
    category: '博物馆',
    description: '世界第八大奇迹，秦始皇陵兵马俑',
    suggestedDuration: 180,
    openHours: '08:30-18:00',
    isCustom: false,
    hotRank: 11,
    rating: 4.8,
    ticketPrice: 120,
    imageUrl: '/images/terracotta-warriors.jpg'
  },
  {
    id: 'hotspot_12',
    name: '大雁塔',
    coordinates: { lat: 34.2186, lng: 108.9647 },
    address: '陕西省西安市雁塔区雁塔路',
    category: '历史建筑',
    description: '唐代佛教建筑，玄奘法师译经之地',
    suggestedDuration: 120,
    openHours: '08:00-18:00',
    isCustom: false,
    hotRank: 12,
    rating: 4.5,
    ticketPrice: 50,
    imageUrl: '/images/big-wild-goose-pagoda.jpg'
  },
  {
    id: 'hotspot_13',
    name: '西安城墙',
    coordinates: { lat: 34.2583, lng: 108.9286 },
    address: '陕西省西安市中心区',
    category: '历史遗迹',
    description: '中国现存最完整的古代城垣建筑',
    suggestedDuration: 150,
    openHours: '08:00-22:00',
    isCustom: false,
    hotRank: 13,
    rating: 4.6,
    ticketPrice: 54,
    imageUrl: '/images/xian-city-wall.jpg'
  },
  {
    id: 'hotspot_14',
    name: '华清宫',
    coordinates: { lat: 34.3622, lng: 109.2122 },
    address: '陕西省西安市临潼区华清路38号',
    category: '历史遗迹',
    description: '唐代皇家温泉行宫，杨贵妃沐浴之地',
    suggestedDuration: 120,
    openHours: '07:00-19:00',
    isCustom: false,
    hotRank: 14,
    rating: 4.4,
    ticketPrice: 120,
    imageUrl: '/images/huaqing-palace.jpg'
  },
  {
    id: 'hotspot_15',
    name: '回民街',
    coordinates: { lat: 34.2633, lng: 108.9375 },
    address: '陕西省西安市莲湖区北院门',
    category: '美食街',
    description: '西安著名小吃街，回族风味美食集中地',
    suggestedDuration: 90,
    openHours: '全天开放',
    isCustom: false,
    hotRank: 15,
    rating: 4.3,
    ticketPrice: 0,
    imageUrl: '/images/muslim-quarter.jpg'
  },

  // 杭州地区热门景点 (排名16-25)
  {
    id: 'hotspot_16',
    name: '西湖',
    coordinates: { lat: 30.2741, lng: 120.1551 },
    address: '浙江省杭州市西湖区',
    category: '自然景观',
    description: '中国著名淡水湖，世界文化遗产',
    suggestedDuration: 240,
    openHours: '全天开放',
    isCustom: false,
    hotRank: 16,
    rating: 4.7,
    ticketPrice: 0,
    imageUrl: '/images/west-lake.jpg'
  },
  {
    id: 'hotspot_17',
    name: '灵隐寺',
    coordinates: { lat: 30.2408, lng: 120.1014 },
    address: '浙江省杭州市西湖区法云弄1号',
    category: '宗教建筑',
    description: '中国佛教著名寺院，济公出家之地',
    suggestedDuration: 120,
    openHours: '07:00-18:15',
    isCustom: false,
    hotRank: 17,
    rating: 4.5,
    ticketPrice: 75,
    imageUrl: '/images/lingyin-temple.jpg'
  },
  {
    id: 'hotspot_18',
    name: '千岛湖',
    coordinates: { lat: 29.6050, lng: 119.0350 },
    address: '浙江省杭州市淳安县',
    category: '自然景观',
    description: '人工湖泊，以千岛风光著称',
    suggestedDuration: 360,
    openHours: '08:00-17:00',
    isCustom: false,
    hotRank: 18,
    rating: 4.4,
    ticketPrice: 150,
    imageUrl: '/images/qiandao-lake.jpg'
  },
  {
    id: 'hotspot_19',
    name: '宋城',
    coordinates: { lat: 30.1925, lng: 120.0944 },
    address: '浙江省杭州市西湖区之江路148号',
    category: '主题公园',
    description: '大型宋代文化主题公园',
    suggestedDuration: 240,
    openHours: '10:00-21:00',
    isCustom: false,
    hotRank: 19,
    rating: 4.3,
    ticketPrice: 320,
    imageUrl: '/images/songcheng.jpg'
  },
  {
    id: 'hotspot_20',
    name: '雷峰塔',
    coordinates: { lat: 30.2314, lng: 120.1489 },
    address: '浙江省杭州市西湖区南山路15号',
    category: '历史建筑',
    description: '西湖十景之一，白娘子传说发生地',
    suggestedDuration: 90,
    openHours: '08:00-20:30',
    isCustom: false,
    hotRank: 20,
    rating: 4.2,
    ticketPrice: 40,
    imageUrl: '/images/leifeng-pagoda.jpg'
  },

  // 成都地区热门景点 (排名21-30)
  {
    id: 'hotspot_21',
    name: '大熊猫繁育研究基地',
    coordinates: { lat: 30.7319, lng: 104.1477 },
    address: '四川省成都市成华区外北熊猫大道1375号',
    category: '动物园',
    description: '世界著名的大熊猫科研繁育基地',
    suggestedDuration: 180,
    openHours: '07:30-18:00',
    isCustom: false,
    hotRank: 21,
    rating: 4.6,
    ticketPrice: 58,
    imageUrl: '/images/panda-base.jpg'
  },
  {
    id: 'hotspot_22',
    name: '锦里古街',
    coordinates: { lat: 30.6467, lng: 104.0561 },
    address: '四川省成都市武侯区武侯祠大街231号',
    category: '古街',
    description: '成都著名古街，川西民俗文化街',
    suggestedDuration: 120,
    openHours: '全天开放',
    isCustom: false,
    hotRank: 22,
    rating: 4.3,
    ticketPrice: 0,
    imageUrl: '/images/jinli.jpg'
  },
  {
    id: 'hotspot_23',
    name: '武侯祠',
    coordinates: { lat: 30.6467, lng: 104.0561 },
    address: '四川省成都市武侯区武侯祠大街231号',
    category: '历史建筑',
    description: '中国唯一君臣合祀祠庙，三国文化圣地',
    suggestedDuration: 120,
    openHours: '08:00-18:00',
    isCustom: false,
    hotRank: 23,
    rating: 4.4,
    ticketPrice: 50,
    imageUrl: '/images/wuhou-temple.jpg'
  },
  {
    id: 'hotspot_24',
    name: '宽窄巷子',
    coordinates: { lat: 30.6739, lng: 104.0561 },
    address: '四川省成都市青羊区同仁路以东长顺街以西',
    category: '古街',
    description: '成都遗留下来的清朝古街道',
    suggestedDuration: 90,
    openHours: '全天开放',
    isCustom: false,
    hotRank: 24,
    rating: 4.2,
    ticketPrice: 0,
    imageUrl: '/images/kuanzhai-alley.jpg'
  },
  {
    id: 'hotspot_25',
    name: '都江堰',
    coordinates: { lat: 31.0147, lng: 103.6000 },
    address: '四川省成都市都江堰市公园路',
    category: '水利工程',
    description: '世界文化遗产，古代水利工程奇迹',
    suggestedDuration: 180,
    openHours: '08:00-18:00',
    isCustom: false,
    hotRank: 25,
    rating: 4.5,
    ticketPrice: 90,
    imageUrl: '/images/dujiangyan.jpg'
  },

  // 其他热门景点 (排名26-50)
  {
    id: 'hotspot_26',
    name: '张家界国家森林公园',
    coordinates: { lat: 29.3255, lng: 110.4733 },
    address: '湖南省张家界市武陵源区',
    category: '自然景观',
    description: '世界自然遗产，阿凡达取景地',
    suggestedDuration: 480,
    openHours: '07:00-18:00',
    isCustom: false,
    hotRank: 26,
    rating: 4.6,
    ticketPrice: 248,
    imageUrl: '/images/zhangjiajie.jpg'
  },
  {
    id: 'hotspot_27',
    name: '九寨沟',
    coordinates: { lat: 33.2544, lng: 103.9197 },
    address: '四川省阿坝藏族羌族自治州九寨沟县',
    category: '自然景观',
    description: '世界自然遗产，人间仙境',
    suggestedDuration: 480,
    openHours: '07:00-18:00',
    isCustom: false,
    hotRank: 27,
    rating: 4.8,
    ticketPrice: 169,
    imageUrl: '/images/jiuzhaigou.jpg'
  },
  {
    id: 'hotspot_28',
    name: '黄山',
    coordinates: { lat: 30.1394, lng: 118.1675 },
    address: '安徽省黄山市黄山区',
    category: '自然景观',
    description: '中国十大名山之一，世界文化与自然双重遗产',
    suggestedDuration: 480,
    openHours: '06:00-17:30',
    isCustom: false,
    hotRank: 28,
    rating: 4.7,
    ticketPrice: 190,
    imageUrl: '/images/huangshan.jpg'
  },
  {
    id: 'hotspot_29',
    name: '泰山',
    coordinates: { lat: 36.2544, lng: 117.1011 },
    address: '山东省泰安市泰山区',
    category: '自然景观',
    description: '五岳之首，世界文化与自然双重遗产',
    suggestedDuration: 360,
    openHours: '全天开放',
    isCustom: false,
    hotRank: 29,
    rating: 4.5,
    ticketPrice: 127,
    imageUrl: '/images/taishan.jpg'
  },
  {
    id: 'hotspot_30',
    name: '桂林漓江',
    coordinates: { lat: 25.2736, lng: 110.2900 },
    address: '广西壮族自治区桂林市',
    category: '自然景观',
    description: '桂林山水甲天下，世界自然遗产',
    suggestedDuration: 360,
    openHours: '07:00-18:00',
    isCustom: false,
    hotRank: 30,
    rating: 4.6,
    ticketPrice: 215,
    imageUrl: '/images/lijiang.jpg'
  }
];

/**
 * 根据热度排名获取景点
 */
export const getHotspotsByRank = (limit: number = 50): POI[] => {
  return hotspotPOIs
    .filter(poi => poi.hotRank && poi.hotRank <= limit)
    .sort((a, b) => (a.hotRank || 0) - (b.hotRank || 0));
};

/**
 * 根据地区获取热门景点
 */
export const getHotspotsByRegion = (region: string): POI[] => {
  const regionMap: { [key: string]: string[] } = {
    '北京': ['故宫博物院', '长城-八达岭段', '天坛公园', '颐和园', '南锣鼓巷'],
    '上海': ['外滩', '东方明珠塔', '豫园', '田子坊', '上海迪士尼乐园'],
    '西安': ['兵马俑博物馆', '大雁塔', '西安城墙', '华清宫', '回民街'],
    '杭州': ['西湖', '灵隐寺', '千岛湖', '宋城', '雷峰塔'],
    '成都': ['大熊猫繁育研究基地', '锦里古街', '武侯祠', '宽窄巷子', '都江堰']
  };

  const regionPOIs = regionMap[region] || [];
  return hotspotPOIs.filter(poi => regionPOIs.includes(poi.name));
};

/**
 * 获取所有景点数据（包含热门景点和扩展景点）
 */
export const getAllPOIs = (): POI[] => {
  return [...hotspotPOIs, ...allExtendedPOIs];
};

/**
 * 根据城市获取所有景点（包含热门景点和扩展景点）
 */
export const getAllPOIsByCity = (city: string): POI[] => {
  // 先获取热门景点中该城市的景点
  const hotspots = getHotspotsByRegion(city);
  // 再获取扩展景点中该城市的景点
  const extended = getPOIsByCity(city);
  return [...hotspots, ...extended];
};

/**
 * 搜索景点（按名称、地址、描述）
 */
export const searchPOIs = (keyword: string): POI[] => {
  const allPOIs = getAllPOIs();
  const lowerKeyword = keyword.toLowerCase();
  
  return allPOIs.filter(poi => 
    poi.name.toLowerCase().includes(lowerKeyword) ||
    poi.address?.toLowerCase().includes(lowerKeyword) ||
    poi.description?.toLowerCase().includes(lowerKeyword) ||
    poi.category?.toLowerCase().includes(lowerKeyword)
  );
};

/**
 * 按类别获取景点
 */
export const getPOIsByCategory = (category: string): POI[] => {
  const allPOIs = getAllPOIs();
  return allPOIs.filter(poi => poi.category === category);
};

/**
 * 获取所有景点类别
 */
export const getAllCategories = (): string[] => {
  const allPOIs = getAllPOIs();
  const categories = new Set(allPOIs.map(poi => poi.category).filter((category): category is string => Boolean(category)));
  return Array.from(categories);
};

// 导出扩展数据相关函数
export { getPOIsByCity, getAllCities } from './extendedPOIs';