import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface WeatherInfo {
  city: string
  temperature: number
  weather: string
  weatherCode: string
  humidity: number
  wind: string
  windDirection: string
  windLevel: string
  feelsLike: number
  uvIndex: number
  pm25: number
  visibility: number
  sunrise: string
  sunset: string
  updateTime: Date
  forecast: WeatherForecast[]
}

export interface WeatherForecast {
  date: string
  day: string
  weather: string
  weatherCode: string
  tempHigh: number
  tempLow: number
  wind: string
}

export const useWeatherStore = defineStore('weather', () => {
  const weather = ref<WeatherInfo | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

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

  const currentIcon = computed(() => {
    if (!weather.value) return '☀️'
    return weatherIcons[weather.value.weatherCode] || '☀️'
  })

  const temperatureLevel = computed(() => {
    if (!weather.value) return 'normal'
    const temp = weather.value.temperature
    if (temp < 10) return 'cold'
    if (temp < 20) return 'cool'
    if (temp < 28) return 'normal'
    return 'hot'
  })

  const getTemperatureAdvice = computed(() => {
    if (!weather.value) return ''
    const temp = weather.value.temperature
    if (temp < 5) return '❄️ 天气寒冷，建议穿厚外套和保暖内衣'
    if (temp < 10) return '🧥 天气微凉，建议穿外套或毛衣'
    if (temp < 15) return '🍂 天气舒适，薄外套或针织衫即可'
    if (temp < 20) return '🌿 天气适宜，长袖T恤或衬衫'
    if (temp < 25) return '🌸 天气暖和，短袖T恤或连衣裙'
    if (temp < 30) return '☀️ 天气炎热，建议穿轻薄透气衣物'
    return '🔥 天气酷热，建议穿短袖短裤并做好防晒'
  })

  const getSeasonSuggestion = computed(() => {
    if (!weather.value) return ''
    const temp = weather.value.temperature
    if (temp < 10) return '冬季穿搭'
    if (temp < 20) return '春秋穿搭'
    return '夏季穿搭'
  })

  const getWeatherCondition = computed(() => {
    if (!weather.value) return 'sunny'
    const code = weather.value.weatherCode
    if (code.includes('rain') || code.includes('thunder')) return 'rainy'
    if (code.includes('snow')) return 'snowy'
    if (code.includes('fog')) return 'foggy'
    if (code.includes('wind')) return 'windy'
    if (code.includes('cloudy')) return 'cloudy'
    if (code.includes('overcast')) return 'overcast'
    return 'sunny'
  })

  const getMockWeather = (): WeatherInfo => {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    
    let baseTemp = 25
    let weatherType = 'sunny'
    
    if (month >= 12 || month <= 2) {
      baseTemp = 8 + Math.random() * 8
      weatherType = Math.random() > 0.7 ? 'cloudy' : 'sunny'
    } else if (month >= 3 && month <= 5) {
      baseTemp = 15 + Math.random() * 10
      weatherType = Math.random() > 0.6 ? 'cloudy' : 'sunny'
    } else if (month >= 6 && month <= 8) {
      baseTemp = 28 + Math.random() * 6
      weatherType = Math.random() > 0.5 ? 'sunny' : (Math.random() > 0.5 ? 'cloudy' : 'rainy')
    } else {
      baseTemp = 18 + Math.random() * 8
      weatherType = Math.random() > 0.6 ? 'sunny' : 'cloudy'
    }

    const weatherMap: Record<string, { name: string; icon: string }> = {
      'sunny': { name: '晴', icon: 'sunny' },
      'cloudy': { name: '多云', icon: 'cloudy' },
      'overcast': { name: '阴', icon: 'overcast' },
      'rainy': { name: '小雨', icon: 'rainy' },
      'thunderstorm': { name: '雷阵雨', icon: 'thunderstorm' },
      'snowy': { name: '小雪', icon: 'snowy' },
      'foggy': { name: '雾', icon: 'foggy' },
      'windy': { name: '大风', icon: 'windy' }
    }

    const weatherInfo = weatherMap[weatherType]
    
    const forecast: WeatherForecast[] = []
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    
    for (let i = 1; i <= 5; i++) {
      const forecastDate = new Date(now)
      forecastDate.setDate(day + i)
      const forecastDay = weekDays[forecastDate.getDay()]
      
      const tempVariation = (Math.random() - 0.5) * 6
      const forecastTempHigh = Math.round(baseTemp + tempVariation + Math.random() * 4)
      const forecastTempLow = Math.round(forecastTempHigh - 6 - Math.random() * 4)
      
      const forecastWeatherTypes = ['sunny', 'cloudy', 'overcast', 'rainy']
      const forecastType = forecastWeatherTypes[Math.floor(Math.random() * forecastWeatherTypes.length)]
      const forecastInfo = weatherMap[forecastType]
      
      forecast.push({
        date: `${forecastDate.getMonth() + 1}/${forecastDate.getDate()}`,
        day: forecastDay,
        weather: forecastInfo.name,
        weatherCode: forecastInfo.icon,
        tempHigh: forecastTempHigh,
        tempLow: forecastTempLow,
        wind: `${['北', '南', '东', '西'][Math.floor(Math.random() * 4)]}风${Math.floor(Math.random() * 4) + 2}级`
      })
    }

    return {
      city: '北京',
      temperature: Math.round(baseTemp),
      weather: weatherInfo.name,
      weatherCode: weatherInfo.icon,
      humidity: Math.floor(40 + Math.random() * 40),
      wind: `${['北', '南', '东', '西'][Math.floor(Math.random() * 4)]}风${Math.floor(Math.random() * 4) + 2}级`,
      windDirection: ['北风', '南风', '东风', '西风'][Math.floor(Math.random() * 4)],
      windLevel: `${Math.floor(Math.random() * 4) + 2}级`,
      feelsLike: Math.round(baseTemp + (Math.random() - 0.5) * 4),
      uvIndex: Math.floor(Math.random() * 10) + 1,
      pm25: Math.floor(Math.random() * 50),
      visibility: 10 + Math.random() * 5,
      sunrise: '05:30',
      sunset: '19:30',
      updateTime: now,
      forecast
    }
  }

  const fetchWeather = async (city?: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const saved = uni.getStorageSync('weather_data')
      const savedTime = uni.getStorageSync('weather_time')
      const now = Date.now()
      
      if (saved && savedTime && (now - Number(savedTime)) < 3600000) {
        weather.value = JSON.parse(saved)
        isLoading.value = false
        return
      }
      
      const mockData = getMockWeather()
      weather.value = mockData
      
      uni.setStorageSync('weather_data', JSON.stringify(mockData))
      uni.setStorageSync('weather_time', now.toString())
      
      isLoading.value = false
    } catch (e) {
      error.value = '获取天气失败，请稍后重试'
      isLoading.value = false
      
      const saved = uni.getStorageSync('weather_data')
      if (saved) {
        weather.value = JSON.parse(saved)
      }
    }
  }

  const refreshWeather = async () => {
    await fetchWeather()
  }

  return {
    weather,
    isLoading,
    error,
    currentIcon,
    temperatureLevel,
    getTemperatureAdvice,
    getSeasonSuggestion,
    getWeatherCondition,
    fetchWeather,
    refreshWeather,
    weatherIcons
  }
})