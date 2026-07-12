import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ClothingItem {
  id: string
  name: string
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory'
  color: string
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'all'
  brand?: string
  price?: number
  purchaseDate?: string
  image: string
  createdAt: number
}

export interface StyleConfig {
  id: string
  name: string
  icon: string
  description: string
  preferences: {
    top: string[]
    bottom: string[]
    outerwear: string[]
    colors: string[]
  }
}

export const styles: StyleConfig[] = [
  {
    id: 'korean',
    name: '韩系穿搭',
    icon: '🎀',
    description: '温柔简约，干净利落',
    preferences: {
      top: ['宽松', '落肩', '纯色', '条纹', 'V领', '卫衣', '针织'],
      bottom: ['直筒', '阔腿', '百褶', 'A字', '半身裙'],
      outerwear: ['风衣', '大衣', '西装', '针织开衫', '羽绒服'],
      colors: ['米色', '卡其', '藏青', '黑白', '棕色', '燕麦']
    }
  },
  {
    id: 'academic',
    name: '学院风',
    icon: '📚',
    description: '复古优雅，青春活力',
    preferences: {
      top: ['Polo', '衬衫', '针织背心', '菱格', '条纹', 'V领'],
      bottom: ['百褶裙', '格纹', '西装裤', 'A字裙'],
      outerwear: ['小西装', '针织开衫', '牛角扣大衣', '马甲'],
      colors: ['藏青', '酒红', '墨绿', '卡其', '米白', '深蓝']
    }
  },
  {
    id: 'sporty',
    name: '运动风',
    icon: '🏃',
    description: '舒适休闲，活力四射',
    preferences: {
      top: ['卫衣', 'T恤', '运动背心', '连帽衫', '宽松', '落肩'],
      bottom: ['运动裤', '工装裤', '慢跑裤', '短裤', '束脚'],
      outerwear: ['棒球服', '冲锋衣', '运动夹克', '羽绒马甲'],
      colors: ['黑白', '灰色', '藏青', '荧光', '军绿', '深灰']
    }
  },
  {
    id: 'artistic',
    name: '文艺风',
    icon: '🎨',
    description: '浪漫随性，复古自然',
    preferences: {
      top: ['碎花', '蕾丝', '棉麻', '刺绣', 'V领', '宽松', '针织'],
      bottom: ['棉麻裤', '长裙', '阔腿裤', '百褶', 'A字'],
      outerwear: ['针织开衫', '披肩', '风衣', '碎花外套', '棉麻'],
      colors: ['米色', '白色', '绿色', '姜黄', '藏青', '砖红', '芥末']
    }
  },
  {
    id: 'business',
    name: '通勤风',
    icon: '✨',
    description: '干练优雅，简约大方',
    preferences: {
      top: ['衬衫', '西装', '针织衫', '打底衫', 'V领', '纯色'],
      bottom: ['西装裤', '直筒裤', '一步裙', 'A字裙', '阔腿'],
      outerwear: ['西装', '大衣', '风衣', '马甲', '小香风'],
      colors: ['黑白', '藏青', '灰色', '卡其', '深灰', '燕麦', '米白']
    }
  },
  {
    id: 'casual',
    name: '休闲风',
    icon: '👕',
    description: '舒适自在，日常百搭',
    preferences: {
      top: ['T恤', '卫衣', '衬衫', '牛仔', '条纹', '纯色'],
      bottom: ['牛仔裤', '休闲裤', '短裤', '工装裤', '运动裤'],
      outerwear: ['牛仔外套', '夹克', '开衫', '风衣', '棒球服'],
      colors: ['蓝色', '白色', '黑色', '灰色', '卡其', '军绿', '米色']
    }
  }
]

export const useClosetStore = defineStore('closet', () => {
  const clothes = ref<ClothingItem[]>([])
  
  const selectedTop = ref<string | null>(null)
  const selectedBottom = ref<string | null>(null)
  const selectedOuter = ref<string | null>(null)

  const loadFromStorage = () => {
    const saved = uni.getStorageSync('clothes')
    if (saved) {
      try {
        clothes.value = JSON.parse(saved)
      } catch (e) {
        clothes.value = []
      }
    }
  }

  const saveToStorage = () => {
    uni.setStorageSync('clothes', JSON.stringify(clothes.value))
  }

  const addClothing = (item: ClothingItem) => {
    clothes.value.push(item)
    saveToStorage()
  }

  const addClothes = (items: ClothingItem[]) => {
    items.forEach(item => {
      clothes.value.push(item)
    })
    saveToStorage()
  }

  const deleteClothing = (id: string) => {
    clothes.value = clothes.value.filter(item => item.id !== id)
    saveToStorage()
  }

  const updateClothing = (id: string, data: Partial<ClothingItem>) => {
    const index = clothes.value.findIndex(item => item.id === id)
    if (index !== -1) {
      clothes.value[index] = { ...clothes.value[index], ...data }
      saveToStorage()
    }
  }

  const getClothing = (id: string) => {
    return clothes.value.find(item => item.id === id)
  }

  const wearOnModel = (item: ClothingItem) => {
    switch (item.category) {
      case 'top':
        selectedTop.value = item.id
        break
      case 'bottom':
        selectedBottom.value = item.id
        break
      case 'outerwear':
        selectedOuter.value = item.id
        break
      case 'dress':
        selectedTop.value = item.id
        selectedBottom.value = null
        break
      default:
        break
    }
    uni.setStorageSync('selectedTop', selectedTop.value || '')
    uni.setStorageSync('selectedBottom', selectedBottom.value || '')
    uni.setStorageSync('selectedOuter', selectedOuter.value || '')
  }

  const loadSelected = () => {
    const top = uni.getStorageSync('selectedTop')
    const bottom = uni.getStorageSync('selectedBottom')
    const outer = uni.getStorageSync('selectedOuter')
    if (top) selectedTop.value = top
    if (bottom) selectedBottom.value = bottom
    if (outer) selectedOuter.value = outer
  }

  const clearSelected = () => {
    selectedTop.value = null
    selectedBottom.value = null
    selectedOuter.value = null
    uni.removeStorageSync('selectedTop')
    uni.removeStorageSync('selectedBottom')
    uni.removeStorageSync('selectedOuter')
  }

  const getStyleRecommendation = (styleId: string, allClothes: ClothingItem[]) => {
    const style = styles.find(s => s.id === styleId)
    if (!style) {
      return { top: null, bottom: null, outerwear: null }
    }
    
    const preferences = style.preferences
    
    let topCandidates = allClothes.filter(item => 
      item.category === 'top' && 
      preferences.top.some(keyword => item.name.includes(keyword) || item.color.includes(keyword))
    )
    if (topCandidates.length === 0) {
      topCandidates = allClothes.filter(item => item.category === 'top')
    }
    
    let bottomCandidates = allClothes.filter(item => 
      item.category === 'bottom' && 
      preferences.bottom.some(keyword => item.name.includes(keyword) || item.color.includes(keyword))
    )
    if (bottomCandidates.length === 0) {
      bottomCandidates = allClothes.filter(item => item.category === 'bottom')
    }
    
    let outerCandidates = allClothes.filter(item => 
      item.category === 'outerwear' && 
      preferences.outerwear.some(keyword => item.name.includes(keyword) || item.color.includes(keyword))
    )
    if (outerCandidates.length === 0) {
      outerCandidates = allClothes.filter(item => item.category === 'outerwear')
    }
    
    const getRandom = (arr: ClothingItem[]) => {
      return arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null
    }
    
    return {
      top: getRandom(topCandidates),
      bottom: getRandom(bottomCandidates),
      outerwear: getRandom(outerCandidates)
    }
  }

  const getWeatherBasedRecommendation = (weatherCondition: string, temperature: number, allClothes: ClothingItem[]) => {
    const tempLevel = temperature < 10 ? 'cold' : temperature < 20 ? 'cool' : temperature < 28 ? 'normal' : 'hot'
    const isRainy = weatherCondition.includes('rain') || weatherCondition.includes('thunder')
    
    const seasonMap: Record<string, 'spring' | 'summer' | 'autumn' | 'winter' | 'all'> = {
      'cold': 'winter',
      'cool': 'autumn',
      'normal': 'spring',
      'hot': 'summer'
    }
    
    const currentSeason = seasonMap[tempLevel]
    
    let filteredClothes = allClothes.filter(item => 
      item.season === currentSeason || item.season === 'all'
    )
    
    if (isRainy) {
      filteredClothes = filteredClothes.filter(item => 
        item.category !== 'shoes' || !['运动鞋', '凉鞋'].some(keyword => item.name.includes(keyword))
      )
    }
    
    const getRandom = (arr: ClothingItem[]) => {
      return arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null
    }
    
    const tops = filteredClothes.filter(item => item.category === 'top')
    const bottoms = filteredClothes.filter(item => item.category === 'bottom')
    const outerwears = filteredClothes.filter(item => item.category === 'outerwear')
    
    const result: { top: ClothingItem | null; bottom: ClothingItem | null; outerwear: ClothingItem | null } = {
      top: getRandom(tops),
      bottom: getRandom(bottoms),
      outerwear: null
    }
    
    if (tempLevel === 'cold') {
      result.outerwear = getRandom(outerwears)
    } else if (tempLevel === 'cool' && outerwears.length > 0) {
      result.outerwear = Math.random() > 0.3 ? getRandom(outerwears) : null
    } else if (isRainy && outerwears.length > 0) {
      const rainCoats = outerwears.filter(item => 
        ['风衣', '外套', '冲锋衣'].some(keyword => item.name.includes(keyword))
      )
      result.outerwear = getRandom(rainCoats.length > 0 ? rainCoats : outerwears)
    }
    
    if (!result.top) result.top = getRandom(allClothes.filter(item => item.category === 'top'))
    if (!result.bottom) result.bottom = getRandom(allClothes.filter(item => item.category === 'bottom'))
    
    return result
  }

  const getAvailableStyles = () => styles

  loadFromStorage()
  loadSelected()

  return {
    clothes,
    selectedTop,
    selectedBottom,
    selectedOuter,
    addClothing,
    addClothes,
    deleteClothing,
    updateClothing,
    getClothing,
    loadFromStorage,
    saveToStorage,
    wearOnModel,
    loadSelected,
    clearSelected,
    styles,
    getStyleRecommendation,
    getWeatherBasedRecommendation,
    getAvailableStyles
  }
})