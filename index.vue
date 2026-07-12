<template>
  <view class="add">
    <view class="header">
      <text class="title">➕ 添加衣物</text>
    </view>
    
    <view class="form">
      <view class="form-group">
        <text class="form-label">衣物名称 *</text>
        <input v-model="form.name" placeholder="如：白色T恤" class="form-input" />
      </view>

      <view class="form-group">
        <text class="form-label">类别 *</text>
        <picker :value="categoryIndex" :range="categories" range-key="label" @change="onCategoryChange">
          <view class="form-picker">
            {{ categories[categoryIndex]?.label || '请选择' }}
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">颜色 *</text>
        <input v-model="form.color" placeholder="如：白色、蓝色" class="form-input" />
      </view>

      <view class="form-group">
        <text class="form-label">季节 *</text>
        <picker :value="seasonIndex" :range="seasons" @change="onSeasonChange">
          <view class="form-picker">
            {{ seasons[seasonIndex] || '请选择' }}
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">品牌（可选）</text>
        <input v-model="form.brand" placeholder="品牌名称" class="form-input" />
      </view>

      <view class="form-group">
        <text class="form-label">价格（可选）</text>
        <input v-model.number="form.price" type="digit" placeholder="0" class="form-input" />
      </view>

      <view class="form-group">
        <text class="form-label">图片</text>
        <view class="image-upload" @click="uploadImage">
          <image v-if="form.image" :src="form.image" mode="aspectFill" class="upload-image" />
          <view v-else class="upload-placeholder">
            <text class="placeholder-icon">📷</text>
            <text class="placeholder-text">点击上传图片</text>
          </view>
        </view>
      </view>

      <view class="submit-btn" @click="saveClothing">保存衣物</view>
    </view>

    <CustomTabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useClosetStore } from '@/stores/closet'
import CustomTabBar from '@/components/CustomTabBar.vue'

const store = useClosetStore()

const categories = [
  { label: '上衣', value: 'top' },
  { label: '下装', value: 'bottom' },
  { label: '连衣裙', value: 'dress' },
  { label: '外套', value: 'outerwear' },
  { label: '鞋包', value: 'shoes' },
  { label: '配饰', value: 'accessory' },
]

const seasons = ['春', '夏', '秋', '冬', '四季']

const categoryIndex = ref(0)
const seasonIndex = ref(4)

const form = reactive({
  name: '',
  category: 'top',
  color: '',
  season: 'all' as 'spring' | 'summer' | 'autumn' | 'winter' | 'all',
  brand: '',
  price: undefined as number | undefined,
  image: '',
})

watch(categoryIndex, (val) => {
  form.category = categories[val]?.value || 'top'
})

watch(seasonIndex, (val) => {
  const seasonMap: Record<number, 'spring' | 'summer' | 'autumn' | 'winter' | 'all'> = {
    0: 'spring',
    1: 'summer',
    2: 'autumn',
    3: 'winter',
    4: 'all'
  }
  form.season = seasonMap[val] || 'all'
})

const onCategoryChange = (e: any) => {
  categoryIndex.value = e.detail.value
}

const onSeasonChange = (e: any) => {
  seasonIndex.value = e.detail.value
}

const uploadImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      form.image = tempFilePath
    }
  })
}

const saveClothing = () => {
  if (!form.name.trim()) {
    uni.showToast({ title: '请填写衣物名称', icon: 'none' })
    return
  }
  if (!form.color.trim()) {
    uni.showToast({ title: '请填写颜色', icon: 'none' })
    return
  }

  const item = {
    id: Date.now().toString(),
    name: form.name,
    category: form.category,
    color: form.color,
    season: form.season,
    brand: form.brand || undefined,
    price: form.price,
    image: form.image || 'https://picsum.photos/seed/' + Date.now() + '/200/200',
    createdAt: Date.now()
  }

  store.addClothing(item)
  uni.showToast({ title: '✅ 添加成功！', icon: 'none' })
  
  form.name = ''
  form.category = 'top'
  categoryIndex.value = 0
  form.color = ''
  form.season = 'all'
  seasonIndex.value = 4
  form.brand = ''
  form.price = undefined
  form.image = ''
}
</script>

<style lang="scss" scoped>
.add { padding: 24rpx; padding-bottom: 180rpx; }
.header { margin-bottom: 32rpx; }
.title { font-size: 36rpx; color: #3d2c25; font-weight: 600; }
.form { background: #ffffff; border-radius: 24rpx; padding: 32rpx; }
.form-group { margin-bottom: 24rpx; }
.form-label { display: block; font-size: 28rpx; font-weight: 600; color: #3d2c25; margin-bottom: 12rpx; }
.form-input { width: 100%; padding: 20rpx; border: 2rpx solid #e8e0da; border-radius: 16rpx; font-size: 30rpx; }
.form-input:focus { border-color: #d4a89b; }

.form-picker {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e8e0da;
  border-radius: 16rpx;
  font-size: 30rpx;
  color: #3d2c25;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-arrow {
  color: #999;
  font-size: 24rpx;
}

.image-upload { 
  width: 200rpx; 
  height: 200rpx; 
  border: 4rpx dashed #ddd; 
  border-radius: 16rpx; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  overflow: hidden; 
}
.upload-image { width: 100%; height: 100%; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; }
.placeholder-icon { font-size: 48rpx; margin-bottom: 8rpx; }
.placeholder-text { color: #ccc; font-size: 24rpx; }

.submit-btn { 
  width: 100%; 
  padding: 24rpx; 
  background: #d4a89b; 
  color: #ffffff; 
  border-radius: 16rpx; 
  font-size: 32rpx; 
  font-weight: 600; 
  text-align: center;
  margin-top: 16rpx;
}
</style>