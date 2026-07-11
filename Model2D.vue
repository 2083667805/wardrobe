<template>
  <view class="model-2d">
    <canvas canvas-id="modelCanvas" id="modelCanvas" class="model-canvas"></canvas>
    <view class="model-controls">
      <view class="control-btn" @click="zoomOut">🔍−</view>
      <view class="control-btn" @click="resetView">⟲ 重置</view>
      <view class="control-btn" @click="zoomIn">🔍+</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps<{
  topColor?: string
  bottomColor?: string
  outerColor?: string
  bust?: number
  waist?: number
  hip?: number
  shoulder?: number
  height?: number
}>()

const canvasWidth = 200
const canvasHeight = 380
let scale = 1
const minScale = 0.6
const maxScale = 1.5

watch(
  () => [props.topColor, props.bottomColor, props.outerColor, props.bust, props.waist, props.hip, props.shoulder, props.height],
  () => {
    nextTick(() => {
      drawModel()
    })
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  nextTick(() => {
    drawModel()
  })
})

const drawModel = () => {
  const ctx = uni.createCanvasContext('modelCanvas')
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  const baseHeight = 170
  const baseBust = 88
  const baseWaist = 68
  const baseHip = 92
  const baseShoulder = 40

  const heightScale = (props.height || baseHeight) / baseHeight
  const bustScale = (props.bust || baseBust) / baseBust
  const waistScale = (props.waist || baseWaist) / baseWaist
  const hipScale = (props.hip || baseHip) / baseHip
  const shoulderScale = (props.shoulder || baseShoulder) / baseShoulder

  const centerX = canvasWidth / 2
  const baseY = 20
  const totalScale = scale * Math.min(heightScale, 1.2)

  const getColor = (colorName: string) => {
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
    }
    return map[colorName] || '#d4a89b'
  }

  const topColor = getColor(props.topColor || '米色')
  const bottomColor = getColor(props.bottomColor || '牛仔蓝')
  const outerColor = getColor(props.outerColor || '')

  ctx.save()
  ctx.translate(centerX, baseY)
  ctx.scale(totalScale, totalScale)

  const legWidth = 18 * (hipScale * 0.8 + 0.2)
  const legHeight = 70 * heightScale

  ctx.fillStyle = '#f5d0b8'
  roundRect(ctx, -legWidth - 4, 130, legWidth, legHeight, 6)
  ctx.fill()
  roundRect(ctx, 4, 130, legWidth, legHeight, 6)
  ctx.fill()

  const torsoWidth = 50 * (bustScale * 0.3 + waistScale * 0.3 + hipScale * 0.4)
  const torsoHeight = 70 * heightScale

  ctx.fillStyle = '#f5d0b8'
  roundRect(ctx, -torsoWidth / 2, 50, torsoWidth, torsoHeight, 12)
  ctx.fill()

  if (bustScale > 0.7) {
    const bustSize = 8 * bustScale * 1.2
    ctx.fillStyle = '#f5d0b8'
    ctx.beginPath()
    ctx.ellipse(-12, 70, bustSize, bustSize * 0.7, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(12, 70, bustSize, bustSize * 0.7, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const armWidth = 8 * shoulderScale
  const armHeight = 50 * heightScale

  ctx.fillStyle = '#f5d0b8'
  roundRect(ctx, -torsoWidth / 2 - armWidth - 2, 55, armWidth, armHeight, 5)
  ctx.fill()
  roundRect(ctx, torsoWidth / 2 - 2, 55, armWidth, armHeight, 5)
  ctx.fill()

  const headSize = 32 * heightScale
  ctx.fillStyle = '#f5d0b8'
  ctx.beginPath()
  ctx.arc(0, 25, headSize / 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#3d2c25'
  ctx.beginPath()
  ctx.ellipse(0, 15, headSize / 2 + 4, headSize / 2.5, 0, 0, Math.PI * 2)
  ctx.fill()

  for (let i = -14; i < 16; i += 5) {
    ctx.beginPath()
    ctx.ellipse(i, 18, 6, 10, 0.2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#2d2d2d'
  ctx.beginPath()
  ctx.arc(-10, 26, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(10, 26, 2.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(-9, 25, 1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(11, 25, 1, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#c0392b'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(0, 35, 6, 0.1, Math.PI - 0.1)
  ctx.stroke()

  ctx.fillStyle = 'rgba(255, 150, 150, 0.3)'
  ctx.beginPath()
  ctx.ellipse(-18, 32, 8, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(18, 32, 8, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  if (props.bottomColor) {
    ctx.fillStyle = bottomColor
    roundRect(ctx, -torsoWidth / 2 + 6, 110, torsoWidth - 12, 30, 4)
    ctx.fill()
    roundRect(ctx, -legWidth - 2, 132, legWidth + 4, 45, 4)
    ctx.fill()
    roundRect(ctx, 2, 132, legWidth + 4, 45, 4)
    ctx.fill()
  }

  if (props.topColor) {
    ctx.fillStyle = topColor
    roundRect(ctx, -torsoWidth / 2 + 2, 52, torsoWidth - 4, 60, 8)
    ctx.fill()
    roundRect(ctx, -torsoWidth / 2 - armWidth, 56, armWidth + 2, 35, 5)
    ctx.fill()
    roundRect(ctx, torsoWidth / 2 - 2, 56, armWidth + 2, 35, 5)
    ctx.fill()

    ctx.fillStyle = '#f5d0b8'
    ctx.beginPath()
    ctx.moveTo(-6, 52)
    ctx.lineTo(0, 68)
    ctx.lineTo(6, 52)
    ctx.fill()

    ctx.strokeStyle = topColor
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(-6, 52)
    ctx.quadraticCurveTo(0, 65, 6, 52)
    ctx.stroke()
  }

  if (props.outerColor) {
    ctx.fillStyle = outerColor
    ctx.setGlobalAlpha(0.85)
    roundRect(ctx, -torsoWidth / 2 - 4, 48, torsoWidth + 8, 70, 10)
    ctx.fill()
    roundRect(ctx, -torsoWidth / 2 - armWidth - 4, 54, armWidth + 4, 38, 6)
    ctx.fill()
    roundRect(ctx, torsoWidth / 2 - 2, 54, armWidth + 4, 38, 6)
    ctx.fill()

    ctx.fillStyle = outerColor
    ctx.setGlobalAlpha(0.9)
    ctx.beginPath()
    ctx.moveTo(-8, 48)
    ctx.lineTo(0, 40)
    ctx.lineTo(8, 48)
    ctx.fill()

    ctx.setGlobalAlpha(1)
  }

  ctx.fillStyle = '#2d2d2d'
  ctx.beginPath()
  ctx.ellipse(-legWidth - 2, 182, 12, 6, 0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(legWidth + 2, 182, 12, 6, -0.1, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(-legWidth - 8, 185)
  ctx.lineTo(-legWidth + 6, 185)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(legWidth - 6, 185)
  ctx.lineTo(legWidth + 8, 185)
  ctx.stroke()

  ctx.restore()

  if (props.height || props.bust || props.waist) {
    ctx.fillStyle = '#999'
    ctx.setFontSize(11)
    ctx.setTextAlign('center')
    const info = []
    if (props.height) info.push(`${props.height}cm`)
    if (props.bust) info.push(`胸${props.bust}`)
    if (props.waist) info.push(`腰${props.waist}`)
    if (props.hip) info.push(`臀${props.hip}`)
    ctx.fillText(info.join(' | '), canvasWidth / 2, canvasHeight - 8)
  }

  ctx.draw()
}

const roundRect = (ctx: any, x: number, y: number, w: number, h: number, r: number) => {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

const zoomIn = () => {
  scale = Math.min(scale + 0.1, maxScale)
  drawModel()
}

const zoomOut = () => {
  scale = Math.max(scale - 0.1, minScale)
  drawModel()
}

const resetView = () => {
  scale = 1
  drawModel()
}
</script>

<style lang="scss" scoped>
.model-2d {
  width: 100%;
  height: 560rpx;
  position: relative;
  background: #f5f0eb;
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.model-canvas {
  width: 400rpx;
  height: 560rpx;
}

.model-controls {
  position: absolute;
  bottom: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16rpx;
}

.control-btn {
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  color: #3d2c25;
}
</style>