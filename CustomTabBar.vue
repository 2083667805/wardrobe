<template>
  <view class="custom-tabbar">
    <view 
      class="tabbar-item" 
      v-for="(item, index) in tabList" 
      :key="index"
      :class="{ active: currentIndex === index }"
      @click="switchTab(item.pagePath, index)"
    >
      <text class="tabbar-icon">{{ item.icon }}</text>
      <text class="tabbar-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentIndex = ref(0)

const tabList = [
  { pagePath: '/pages/index/index', text: '首页', icon: '🏠' },
  { pagePath: '/pages/closet/index', text: '衣橱', icon: '👗' },
  { pagePath: '/pages/add/index', text: '添加', icon: '➕' },
  { pagePath: '/pages/outfits/index', text: '穿搭', icon: '❤️' },
]

const switchTab = (pagePath: string, index: number) => {
  currentIndex.value = index
  uni.switchTab({ url: pagePath })
}
</script>

<style lang="scss" scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1rpx solid #e8e0da;
  box-shadow: 0 -2rpx 20rpx rgba(0,0,0,0.05);
  z-index: 100;
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 24rpx;
  border-radius: 40rpx;
  transition: all 0.3s;
}

.tabbar-icon {
  font-size: 40rpx;
}

.tabbar-text {
  font-size: 22rpx;
  color: #999;
}

.tabbar-item.active {
  .tabbar-text {
    color: #d4a89b;
    font-weight: 600;
  }
}
</style>