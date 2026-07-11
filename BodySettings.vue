<template>
  <view class="body-settings">
    <view class="settings-header" @click="expanded = !expanded">
      <text class="header-text">📏 身材数据</text>
      <text class="arrow">{{ expanded ? '▼' : '▶' }}</text>
    </view>
    <view v-show="expanded" class="settings-content">
      <view class="form-row">
        <text class="row-label">身高 (cm)</text>
        <input type="number" v-model.number="body.height" @blur="updateBody" class="row-input" />
      </view>
      <view class="form-row">
        <text class="row-label">胸围 (cm)</text>
        <input type="number" v-model.number="body.bust" @blur="updateBody" class="row-input" />
      </view>
      <view class="form-row">
        <text class="row-label">腰围 (cm)</text>
        <input type="number" v-model.number="body.waist" @blur="updateBody" class="row-input" />
      </view>
      <view class="form-row">
        <text class="row-label">臀围 (cm)</text>
        <input type="number" v-model.number="body.hip" @blur="updateBody" class="row-input" />
      </view>
      <view class="form-row">
        <text class="row-label">肩宽 (cm)</text>
        <input type="number" v-model.number="body.shoulderWidth" @blur="updateBody" class="row-input" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const expanded = ref(false)

const body = ref({
  height: 170,
  bust: 88,
  waist: 68,
  hip: 92,
  shoulderWidth: 40
})

const emit = defineEmits<{
  (e: 'update', data: any): void
}>()

onMounted(() => {
  const saved = uni.getStorageSync('bodyData')
  if (saved) {
    try {
      body.value = JSON.parse(saved)
      emit('update', body.value)
    } catch (e) {}
  }
})

const updateBody = () => {
  uni.setStorageSync('bodyData', JSON.stringify(body.value))
  emit('update', body.value)
}
</script>

<style lang="scss" scoped>
.body-settings {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  font-weight: 600;
  color: #3d2c25;
}

.header-text {
  font-size: 28rpx;
}

.arrow {
  color: #ccc;
  font-size: 24rpx;
}

.settings-content {
  padding: 0 24rpx 24rpx;
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}

.row-label {
  font-size: 26rpx;
  color: #666;
}

.row-input {
  width: 120rpx;
  padding: 8rpx 16rpx;
  border: 2rpx solid #e8e0da;
  border-radius: 12rpx;
  font-size: 26rpx;
  text-align: center;
}

.row-input:focus {
  border-color: #d4a89b;
}
</style>