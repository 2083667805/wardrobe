<template>
  <view class="home">
    <view class="weather-card" v-if="weatherStore.weather">
      <view class="weather-header">
        <view class="location">
          <text class="location-icon">📍</text>
          <text class="location-text">{{ weatherStore.weather.city }}</text>
        </view>
        <text class="update-time">{{ formatTime(weatherStore.weather.updateTime) }}</text>
      </view>
      <view class="weather-content">
        <view class="temperature-section">
          <text class="weather-icon-large">{{ weatherStore.currentIcon }}</text>
          <view class="temp-info">
            <text class="temperature">{{ weatherStore.weather.temperature }}°</text>
            <text class="weather-text">{{ weatherStore.weather.weather }}</text>
          </view>
        </view>
        <view class="weather-details">
          <view class="detail-item">
            <text class="detail-icon">💧</text>
            <text class="detail-text">{{ weatherStore.weather.humidity }}%</text>
          </view>
          <view class="detail-item">
            <text class="detail-icon">💨</text>
            <text class="detail-text">{{ weatherStore.weather.wind }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-icon">🌡️</text>
            <text class="detail-text">体感 {{ weatherStore.weather.feelsLike }}°</text>
          </view>
        </view>
      </view>
      <view class="weather-forecast">
        <view class="forecast-item" v-for="(item, index) in weatherStore.weather.forecast" :key="index">
          <text class="forecast-day">{{ item.day }}</text>
          <text class="forecast-icon">{{ getForecastIcon(item.weatherCode) }}</text>
          <text class="forecast-temp">{{ item.tempLow }}°-{{ item.tempHigh }}°</text>
        </view>
      </view>
      <view class="weather-advice">
        <text>{{ weatherStore.getTemperatureAdvice }}</text>
      </view>
    </view>

    <view class="header">
      <text class="title">👗 我的衣橱</text>
      <text class="subtitle">共 {{ clothes.length }} 件衣物</text>
    </view>

    <view class="section recommend-section">
      <view class="section-header">
        <text class="section-title">✨ 今日穿搭推荐</text>
        <view class="recommend-tabs">
          <view 
            class="tab-item"
            :class="{ active: recommendMode === 'weather' }"
            @click="switchRecommendMode('weather')"
          >
            <text class="tab-icon">🌤️</text>
            <text>天气推荐</text>
          </view>
          <view 
            class="tab-item"
            :class="{ active: recommendMode === 'style' }"
            @click="switchRecommendMode('style')"
          >
            <text class="tab-icon">🎨</text>
            <text>风格推荐</text>
          </view>
        </view>
        <view class="refresh-btn" @click="refreshRecommend">🔄</view>
      </view>

      <view class="style-selector" v-if="recommendMode === 'style'">
        <view 
          v-for="style in availableStyles" 
          :key="style.id"
          class="style-tag"
          :class="{ active: currentStyle === style.id }"
          @click="selectStyle(style.id)"
        >
          <text class="style-icon">{{ style.icon }}</text>
          <text class="style-name">{{ style.name }}</text>
        </view>
      </view>

      <view class="recommend-hint" v-if="recommendMode === 'weather' && weatherStore.weather">
        <text class="hint-icon">🌤️</text>
        <text class="hint-text">基于当前天气（{{ weatherStore.weather.weather }} {{ weatherStore.weather.temperature }}°）为您推荐</text>
      </view>

      <view class="recommend-hint" v-else-if="recommendMode === 'style'">
        <text class="hint-icon">🎨</text>
        <text class="hint-text">当前风格：<text class="hint-bold">{{ getCurrentStyleName() }}</text> - {{ getCurrentStyleDesc() }}</text>
      </view>

      <view class="recommend-card" v-if="recommendation.length > 0">
        <view class="recommend-items">
          <view v-for="item in recommendation" :key="item.id" class="recommend-item">
            <image :src="item.image || 'https://picsum.photos/seed/' + item.id + '/200/200'" mode="aspectFill" class="recommend-image" />
            <text class="recommend-name">{{ item.name }}</text>
            <view class="item-color" :style="{ background: getColorHex(item.color) }"></view>
          </view>
        </view>
        <view class="recommend-tags">
          <view class="tag" v-if="recommendMode === 'weather'">{{ weatherStore.getSeasonSuggestion }}</view>
          <view class="tag" v-if="recommendMode === 'style'">{{ getCurrentStyleName() }}</view>
          <view class="tag" v-if="weatherStore.weather">{{ weatherStore.weather.weather }} {{ weatherStore.weather.temperature }}°</view>
        </view>
        <view class="recommend-actions">
          <view class="action-btn" @click="saveOutfit">❤️ 收藏这套</view>
          <view class="action-btn primary" @click="refreshRecommend">换一套</view>
          <view class="action-btn" @click="clearWearing" v-if="hasSelected">清除穿着</view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">衣橱还空空的，快去添加衣物吧！</text>
        <view class="add-link" @click="goToAdd">+ 添加第一件</view>
      </view>
    </view>

    <view class="section model-section">
      <view class="section-header">
        <text class="section-title">👤 模特穿搭展示</text>
      </view>
      <view class="model-container">
        <Model2D 
          v-if="showModel"
          :topColor="wearingTop?.color || ''"
          :bottomColor="wearingBottom?.color || ''"
          :outerColor="wearingOuter?.color || ''"
          :bust="bodyData.bust"
          :waist="bodyData.waist"
          :hip="bodyData.hip"
          :shoulder="bodyData.shoulderWidth"
          :height="bodyData.height"
        />
        <view v-else class="no-model">
          <text class="no-model-icon">👤</text>
          <text class="no-model-text">添加至少3件衣物\n才能展示穿搭</text>
        </view>
      </view>
      <view class="model-info" v-if="showModel">
        <view class="info-row">
          <text class="info-label">上衣：</text>
          <text class="info-value">{{ wearingTop?.name || '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">下装：</text>
          <text class="info-value">{{ wearingBottom?.name || '-' }}</text>
        </view>
        <view class="info-row" v-if="wearingOuter">
          <text class="info-label">外套：</text>
          <text class="info-value">{{ wearingOuter?.name || '-' }}</text>
        </view>
      </view>
    </view>

    <BodySettings @update="onBodyUpdate" />

    <view class="section stats-section">
      <view class="section-header">
        <text class="section-title">📊 衣橱统计</text>
      </view>
      <view class="stats-grid">
        <view class="stat-card" v-for="(count, category) in stats" :key="category">
          <text class="stat-number">{{ count }}</text>
          <text class="stat-label">{{ categoryNames[category] || category }}</text>
        </view>
      </view>
    </view>

    <CustomTabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClosetStore, styles } from '@/stores/closet'
import { useWeatherStore } from '@/stores/weather'
import Model2D from '@/components/Model2D.vue'
import BodySettings from '@/components/BodySettings.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const store = useClosetStore()
const weatherStore = useWeatherStore()
const clothes = computed(() => store.clothes)

const categoryNames: Record<string, string> = {
  top: '上衣',
  bottom: '下装',
  dress: '连衣裙',
  outerwear: '外套',
  shoes: '鞋包',
  accessory: '配饰'
}

const stats = computed(() => {
  const result: Record<string, number> = {}
  clothes.value.forEach(item => {
    result[item.category] = (result[item.category] || 0) + 1
  })
  return result
})

const availableStyles = styles
const currentStyle = ref<string>('korean')
const recommendMode = ref<'weather' | 'style'>('weather')
const recommendation = ref<any[]>([])
const favoriteOutfits = ref<any[]>([])
const bodyData = ref({
  height: 170,
  bust: 88,
  waist: 68,
  hip: 92,
  shoulderWidth: 40
})

const weatherIcons: Record<string, string> = {
  'sunny': '☀️',
  'cloudy': '☁️',
  'overcast': '⛅',
  'rainy': '🌧️',
  'thunderstorm': '⛈️',
  'snowy': '❄️',
  'foggy': '🌫️',
  'windy': '💨'
}

const getForecastIcon = (code: string) => {
  return weatherIcons[code] || '☀️'
}

const formatTime = (date: Date) => {
  const d = new Date(date)
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes} 更新`
}

const switchRecommendMode = (mode: 'weather' | 'style') => {
  recommendMode.value = mode
  refreshRecommend()
}

const selectStyle = (styleId: string) => {
  currentStyle.value = styleId
  uni.setStorageSync('preferredStyle', styleId)
  if (recommendMode.value === 'style') {
    refreshRecommend()
  }
}

const getCurrentStyleName = () => {
  const style = availableStyles.find(s => s.id === currentStyle.value)
  return style ? `${style.icon} ${style.name}` : '未选择'
}

const getCurrentStyleDesc = () => {
  const style = availableStyles.find(s => s.id === currentStyle.value)
  return style ? style.description : ''
}

const getColorHex = (colorName: string) => {
  const map: Record<string, string> = {
    '白色': '#ffffff',
    '黑色': '#2d2d2d',
    '红色': '#c0392b',
    '蓝色': '#2980b9',
    '绿色': '#27ae60',
    '黄色': '#f1c40f',
    '紫色': '#8e44ad',
    '粉色': '#e84393',
    '灰色': '#95a5a6',
    '米色': '#f5e6d3',
    '棕色': '#8d6e63',
    '橙色': '#e67e22',
    '藏青': '#2c3e50',
    '卡其': '#c4a882',
    '牛仔蓝': '#5d7b93',
    '酒红': '#8e3a3a',
    '墨绿': '#2d5016',
    '军绿': '#4b6a3b',
    '姜黄': '#d4a017',
    '米白': '#f5f0e8',
    '深灰': '#4a4a4a',
  }
  return map[colorName] || '#d4a89b'
}

const generateRecommendation = () => {
  if (recommendMode.value === 'weather' && weatherStore.weather) {
    const result = store.getWeatherBasedRecommendation(
      weatherStore.weather.weatherCode,
      weatherStore.weather.temperature,
      clothes.value
    )
    const items = []
    if (result.top) items.push(result.top)
    if (result.bottom) items.push(result.bottom)
    if (result.outerwear) items.push(result.outerwear)
    recommendation.value = items
  } else {
    const result = store.getStyleRecommendation(currentStyle.value, clothes.value)
    const items = []
    if (result.top) items.push(result.top)
    if (result.bottom) items.push(result.bottom)
    if (result.outerwear) items.push(result.outerwear)
    
    if (items.length < 3) {
      const categories = ['top', 'bottom', 'outerwear']
      categories.forEach(cat => {
        if (!items.find(item => item.category === cat)) {
          const fallback = store.clothes.filter(item => item.category === cat)
          if (fallback.length > 0) {
            const random = fallback[Math.floor(Math.random() * fallback.length)]
            if (!items.find(item => item.id === random.id)) {
              items.push(random)
            }
          }
        }
      })
    }
    
    recommendation.value = items
  }
}

const refreshRecommend = () => {
  generateRecommendation()
}

const hasSelected = computed(() => {
  return store.selectedTop || store.selectedBottom || store.selectedOuter
})

const wearingTop = computed(() => {
  if (store.selectedTop) {
    return store.getClothing(store.selectedTop)
  }
  return recommendation.value.find(item => item.category === 'top') || recommendation.value[0] || null
})

const wearingBottom = computed(() => {
  if (store.selectedBottom) {
    return store.getClothing(store.selectedBottom)
  }
  return recommendation.value.find(item => item.category === 'bottom') || recommendation.value[1] || null
})

const wearingOuter = computed(() => {
  if (store.selectedOuter) {
    return store.getClothing(store.selectedOuter)
  }
  return recommendation.value.find(item => item.category === 'outerwear') || recommendation.value[2] || null
})

const showModel = computed(() => {
  return recommendation.value.length >= 2 || hasSelected.value
})

const clearWearing = () => {
  store.clearSelected()
}

const saveOutfit = () => {
  if (recommendation.value.length === 0) return
  const style = availableStyles.find(s => s.id === currentStyle.value)
  const outfit = {
    id: Date.now().toString(),
    items: recommendation.value.map(item => item.id),
    name: `${recommendMode.value === 'weather' ? '🌤️' : (style?.icon || '')}${recommendMode.value === 'weather' ? '天气' : (style?.name || '我的')}搭配 ${favoriteOutfits.value.length + 1}`,
    styleId: currentStyle.value,
    recommendMode: recommendMode.value,
    isFavorite: true,
    createdAt: Date.now()
  }
  favoriteOutfits.value.push(outfit)
  uni.setStorageSync('favoriteOutfits', JSON.stringify(favoriteOutfits.value))
  uni.showToast({ title: '❤️ 收藏成功！', icon: 'none' })
}

const onBodyUpdate = (data: any) => {
  bodyData.value = data
}

const goToAdd = () => {
  uni.switchTab({ url: '/pages/add/index' })
}

onMounted(() => {
  const saved = uni.getStorageSync('favoriteOutfits')
  if (saved) {
    try {
      favoriteOutfits.value = JSON.parse(saved)
    } catch (e) {}
  }
  
  const savedBody = uni.getStorageSync('bodyData')
  if (savedBody) {
    try {
      bodyData.value = JSON.parse(savedBody)
    } catch (e) {}
  }
  
  const savedStyle = uni.getStorageSync('preferredStyle')
  if (savedStyle) {
    currentStyle.value = savedStyle
  }
  
  if (clothes.value.length === 0) {
    store.addClothes([
      {
        id: '1',
        name: '白色宽松T恤',
        category: 'top',
        color: '白色',
        season: 'summer',
        image: 'https://picsum.photos/seed/1/200/200',
        createdAt: Date.now()
      },
      {
        id: '2',
        name: '蓝色百褶裙',
        category: 'bottom',
        color: '藏青',
        season: 'all',
        image: 'https://picsum.photos/seed/2/200/200',
        createdAt: Date.now()
      },
      {
        id: '3',
        name: '米色风衣',
        category: 'outerwear',
        color: '米色',
        season: 'autumn',
        image: 'https://picsum.photos/seed/3/200/200',
        createdAt: Date.now()
      },
      {
        id: '4',
        name: '灰色卫衣',
        category: 'top',
        color: '灰色',
        season: 'autumn',
        image: 'https://picsum.photos/seed/4/200/200',
        createdAt: Date.now()
      },
      {
        id: '5',
        name: '黑色运动裤',
        category: 'bottom',
        color: '黑色',
        season: 'all',
        image: 'https://picsum.photos/seed/5/200/200',
        createdAt: Date.now()
      },
      {
        id: '6',
        name: '藏青棒球服',
        category: 'outerwear',
        color: '藏青',
        season: 'autumn',
        image: 'https://picsum.photos/seed/6/200/200',
        createdAt: Date.now()
      },
      {
        id: '7',
        name: '红色毛衣',
        category: 'top',
        color: '红色',
        season: 'winter',
        image: 'https://picsum.photos/seed/7/200/200',
        createdAt: Date.now()
      },
      {
        id: '8',
        name: '深蓝色牛仔裤',
        category: 'bottom',
        color: '牛仔蓝',
        season: 'all',
        image: 'https://picsum.photos/seed/8/200/200',
        createdAt: Date.now()
      },
      {
        id: '9',
        name: '黑色羽绒服',
        category: 'outerwear',
        color: '黑色',
        season: 'winter',
        image: 'https://picsum.photos/seed/9/200/200',
        createdAt: Date.now()
      }
    ])
  }
  
  weatherStore.fetchWeather().then(() => {
    generateRecommendation()
  })
  
  store.loadSelected()
})
</script>

<style lang="scss" scoped>
.home { padding: 24rpx; padding-bottom: 180rpx; }

.weather-card {
  background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  color: #ffffff;
  margin-bottom: 32rpx;
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.location {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.location-icon { font-size: 32rpx; }
.location-text { font-size: 28rpx; font-weight: 500; }
.update-time { font-size: 24rpx; opacity: 0.8; }

.weather-content {
  margin-bottom: 24rpx;
}

.temperature-section {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.weather-icon-large {
  font-size: 72rpx;
}

.temp-info {
  display: flex;
  flex-direction: column;
}

.temperature {
  font-size: 80rpx;
  font-weight: 700;
  line-height: 1;
}

.weather-text {
  font-size: 32rpx;
  font-weight: 500;
  margin-top: 8rpx;
}

.weather-details {
  display: flex;
  gap: 32rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.detail-icon { font-size: 28rpx; }
.detail-text { font-size: 24rpx; opacity: 0.9; }

.weather-forecast {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-top: 1rpx solid rgba(255,255,255,0.2);
  border-bottom: 1rpx solid rgba(255,255,255,0.2);
  margin-bottom: 16rpx;
}

.forecast-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.forecast-day { font-size: 22rpx; opacity: 0.8; }
.forecast-icon { font-size: 28rpx; }
.forecast-temp { font-size: 22rpx; opacity: 0.8; }

.weather-advice {
  font-size: 24rpx;
  opacity: 0.9;
  text-align: center;
  padding-top: 8rpx;
}

.header { margin-bottom: 24rpx; }
.title { display: block; font-size: 36rpx; font-weight: 700; color: #3d2c25; }
.subtitle { display: block; color: #999; font-size: 24rpx; margin-top: 4rpx; }

.section { background: #ffffff; border-radius: 24rpx; padding: 32rpx; margin-bottom: 24rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; flex-wrap: wrap; gap: 12rpx; }
.section-title { font-size: 32rpx; color: #3d2c25; font-weight: 600; }

.recommend-tabs {
  display: flex;
  gap: 8rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
  padding: 4rpx;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
  transition: all 0.3s;
  
  &.active {
    background: #d4a89b;
    color: #ffffff;
  }
}

.tab-icon { font-size: 24rpx; }

.refresh-btn { 
  background: #f5ede9; 
  border-radius: 32rpx; 
  color: #d4a89b; 
  font-size: 28rpx; 
  padding: 12rpx 24rpx;
}

.style-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.style-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  border: 2rpx solid #e8e0da;
  background: #ffffff;
  font-size: 24rpx;
  color: #666;
  
  &.active {
    border-color: #d4a89b;
    background: #f5ede9;
    color: #d4a89b;
    font-weight: 600;
  }
}

.style-icon { font-size: 24rpx; }
.style-name { font-size: 24rpx; }

.recommend-hint {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #999;
  padding: 12rpx 0 20rpx;
  border-bottom: 1rpx solid #f0e8e3;
  margin-bottom: 20rpx;
}

.hint-icon { font-size: 28rpx; }
.hint-text { flex: 1; }
.hint-bold { color: #d4a89b; font-weight: 600; }

.recommend-card { text-align: center; }
.recommend-items { display: flex; justify-content: center; gap: 16rpx; margin-bottom: 20rpx; flex-wrap: wrap; }
.recommend-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.recommend-image { width: 140rpx; height: 140rpx; border-radius: 16rpx; border: 2rpx solid #f0e8e3; }
.recommend-name { font-size: 24rpx; color: #666; }
.item-color {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 1rpx solid #e8e0da;
}

.recommend-tags {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.tag {
  background: #FFE5E5;
  color: #FF6B6B;
  font-size: 22rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.recommend-actions {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.action-btn { 
  padding: 16rpx 32rpx; 
  background: #f5f5f5; 
  border-radius: 40rpx; 
  font-size: 26rpx; 
  color: #666;
  
  &.primary {
    background: #d4a89b;
    color: #ffffff;
  }
}

.empty-state { text-align: center; padding: 48rpx 0; color: #999; }
.empty-icon { display: block; font-size: 64rpx; margin-bottom: 16rpx; }
.empty-text { display: block; font-size: 28rpx; margin-bottom: 24rpx; }
.add-link { color: #d4a89b; font-weight: 600; font-size: 30rpx; }

.model-section {
  padding: 32rpx;
}

.model-container {
  width: 100%;
  height: 560rpx;
  background: #f5f0eb;
  border-radius: 24rpx;
  margin-bottom: 20rpx;
}

.no-model {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.no-model-icon { font-size: 80rpx; margin-bottom: 20rpx; color: #ccc; }
.no-model-text { font-size: 26rpx; color: #999; text-align: center; line-height: 1.6; }

.model-info {
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 20rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
}

.info-label { font-size: 26rpx; color: #999; }
.info-value { font-size: 26rpx; color: #3d2c25; font-weight: 500; }

.stats-section {
  padding: 32rpx;
}

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rpx; }
.stat-card { background: #f8f4f1; border-radius: 16rpx; padding: 24rpx; text-align: center; }
.stat-number { display: block; font-size: 40rpx; font-weight: 700; color: #3d2c25; }
.stat-label { font-size: 24rpx; color: #999; }

@media (max-width: 750rpx) {
  .weather-details { gap: 20rpx; }
  .recommend-items { gap: 12rpx; }
  .recommend-image { width: 120rpx; height: 120rpx; }
}
</style>