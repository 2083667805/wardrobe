<template>
  <div class="model-container">
    <div ref="modelContainer" class="model-scene"></div>
    <div class="model-controls">
      <button @click="rotateLeft">⟲ 左转</button>
      <button @click="rotateRight">⟳ 右转</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const modelContainer = ref<HTMLDivElement>()
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let modelGroup: THREE.Group
let animationId: number

// 接收衣服颜色
const props = defineProps<{
  topColor?: string
  bottomColor?: string
  outerColor?: string
}>()

// 监听颜色变化，重新生成衣服
watch(
  () => [props.topColor, props.bottomColor, props.outerColor],
  () => {
    if (modelGroup) {
      // 移除旧的衣服
      const toRemove: THREE.Object3D[] = []
      modelGroup.children.forEach(child => {
        if (child.userData?.isClothing) {
          toRemove.push(child)
        }
      })
      toRemove.forEach(child => {
        modelGroup.remove(child)
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
      // 重新创建衣服
      createClothes()
    }
  },
  { deep: true }
)

onMounted(() => {
  initThree()
  createModel()
  animate()
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) renderer.dispose()
})

const initThree = () => {
  if (!modelContainer.value) return

  const width = modelContainer.value.clientWidth || 180
  const height = modelContainer.value.clientHeight || 320

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf5f0eb)

  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
  camera.position.set(2.5, 2, 4)
  camera.lookAt(0, 0.8, 0)

  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  modelContainer.value.appendChild(renderer.domElement)

  // 轨道控制器（支持鼠标拖拽旋转）
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0.8, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.autoRotate = true
  controls.autoRotateSpeed = 1.5
  controls.minDistance = 2
  controls.maxDistance = 8
  controls.update()

  // 灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
  mainLight.position.set(3, 5, 4)
  mainLight.castShadow = true
  scene.add(mainLight)

  const fillLight = new THREE.DirectionalLight(0xffeedd, 0.3)
  fillLight.position.set(-2, 1, 3)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.2)
  rimLight.position.set(0, 2, -4)
  scene.add(rimLight)

  // 地面阴影接收
  const planeGeom = new THREE.PlaneGeometry(4, 4)
  const planeMat = new THREE.ShadowMaterial({ opacity: 0.15 })
  const plane = new THREE.Mesh(planeGeom, planeMat)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = -0.05
  plane.receiveShadow = true
  scene.add(plane)
}

const createModel = () => {
  modelGroup = new THREE.Group()
  modelGroup.position.y = 0

  // ========== 身体 ==========
  // 躯干
  const torsoGeom = new THREE.CylinderGeometry(0.45, 0.5, 0.7, 12)
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: 0xf5d0b8, 
    roughness: 0.4,
    metalness: 0.0
  })
  const torso = new THREE.Mesh(torsoGeom, bodyMat)
  torso.position.y = 0.75
  torso.castShadow = true
  torso.userData = { isBody: true }
  modelGroup.add(torso)

  // ========== 头部 ==========
  const headGeom = new THREE.SphereGeometry(0.22, 12, 12)
  const headMat = new THREE.MeshStandardMaterial({ 
    color: 0xf5d0b8, 
    roughness: 0.3 
  })
  const head = new THREE.Mesh(headGeom, headMat)
  head.position.y = 1.3
  head.castShadow = true
  head.userData = { isBody: true }
  modelGroup.add(head)

  // ========== 头发 ==========
  const hairGeom = new THREE.SphereGeometry(0.24, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2)
  const hairMat = new THREE.MeshStandardMaterial({ 
    color: 0x3d2c25, 
    roughness: 0.9 
  })
  const hair = new THREE.Mesh(hairGeom, hairMat)
  hair.position.y = 1.38
  hair.rotation.x = 0.1
  hair.userData = { isBody: true }
  modelGroup.add(hair)

  // ========== 手臂 ==========
  const armGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.4, 8)
  const armMat = new THREE.MeshStandardMaterial({ color: 0xf5d0b8, roughness: 0.5 })
  
  const leftArm = new THREE.Mesh(armGeom, armMat)
  leftArm.position.set(-0.5, 0.9, 0)
  leftArm.rotation.z = 0.3
  leftArm.rotation.x = -0.2
  leftArm.castShadow = true
  leftArm.userData = { isBody: true }
  modelGroup.add(leftArm)

  const rightArm = new THREE.Mesh(armGeom, armMat)
  rightArm.position.set(0.5, 0.9, 0)
  rightArm.rotation.z = -0.3
  rightArm.rotation.x = 0.2
  rightArm.castShadow = true
  rightArm.userData = { isBody: true }
  modelGroup.add(rightArm)

  // ========== 腿部 ==========
  const legGeom = new THREE.CylinderGeometry(0.1, 0.12, 0.4, 8)
  const legMat = new THREE.MeshStandardMaterial({ color: 0xf5d0b8, roughness: 0.5 })
  
  const leftLeg = new THREE.Mesh(legGeom, legMat)
  leftLeg.position.set(-0.16, 0.3, 0)
  leftLeg.castShadow = true
  leftLeg.userData = { isBody: true }
  modelGroup.add(leftLeg)

  const rightLeg = new THREE.Mesh(legGeom, legMat)
  rightLeg.position.set(0.16, 0.3, 0)
  rightLeg.castShadow = true
  rightLeg.userData = { isBody: true }
  modelGroup.add(rightLeg)

  // ========== 鞋子 ==========
  const shoeGeom = new THREE.SphereGeometry(0.1, 8, 8)
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.8 })
  
  const leftShoe = new THREE.Mesh(shoeGeom, shoeMat)
  leftShoe.position.set(-0.16, 0.05, 0.06)
  leftShoe.scale.set(1, 0.5, 1.2)
  leftShoe.userData = { isBody: true }
  modelGroup.add(leftShoe)

  const rightShoe = new THREE.Mesh(shoeGeom, shoeMat)
  rightShoe.position.set(0.16, 0.05, 0.06)
  rightShoe.scale.set(1, 0.5, 1.2)
  rightShoe.userData = { isBody: true }
  modelGroup.add(rightShoe)

  // 创建衣服
  createClothes()

  scene.add(modelGroup)
}

const createClothes = () => {
  // ========== 上衣 ==========
  if (props.topColor) {
    const color = new THREE.Color(props.topColor)
    
    // 上衣主体
    const topGeom = new THREE.CylinderGeometry(0.5, 0.45, 0.4, 12)
    const topMat = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.6,
      side: THREE.DoubleSide,
    })
    const top = new THREE.Mesh(topGeom, topMat)
    top.position.y = 0.85
    top.castShadow = true
    top.userData = { isClothing: true }
    modelGroup.add(top)

    // 左袖子
    const sleeveGeom = new THREE.CylinderGeometry(0.05, 0.07, 0.2, 8)
    const sleeveMat = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.6,
    })
    const leftSleeve = new THREE.Mesh(sleeveGeom, sleeveMat)
    leftSleeve.position.set(-0.45, 0.9, 0)
    leftSleeve.rotation.z = 0.5
    leftSleeve.rotation.x = -0.2
    leftSleeve.userData = { isClothing: true }
    modelGroup.add(leftSleeve)

    const rightSleeve = new THREE.Mesh(sleeveGeom, sleeveMat)
    rightSleeve.position.set(0.45, 0.9, 0)
    rightSleeve.rotation.z = -0.5
    rightSleeve.rotation.x = 0.2
    rightSleeve.userData = { isClothing: true }
    modelGroup.add(rightSleeve)

    // 领口（小圆环装饰）
    const collarGeom = new THREE.TorusGeometry(0.15, 0.03, 8, 12)
    const collarMat = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.5,
    })
    const collar = new THREE.Mesh(collarGeom, collarMat)
    collar.position.y = 1.02
    collar.rotation.x = Math.PI / 2
    collar.scale.set(1, 1, 0.6)
    collar.userData = { isClothing: true }
    modelGroup.add(collar)
  }

  // ========== 下装 ==========
  if (props.bottomColor) {
    const color = new THREE.Color(props.bottomColor)
    
    // 裤子主体
    const bottomGeom = new THREE.CylinderGeometry(0.45, 0.5, 0.4, 12)
    const bottomMat = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.6,
      side: THREE.DoubleSide,
    })
    const bottom = new THREE.Mesh(bottomGeom, bottomMat)
    bottom.position.y = 0.45
    bottom.castShadow = true
    bottom.userData = { isClothing: true }
    modelGroup.add(bottom)

    // 左裤腿
    const legClothGeom = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8)
    const legClothMat = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.6,
    })
    const leftLegCloth = new THREE.Mesh(legClothGeom, legClothMat)
    leftLegCloth.position.set(-0.14, 0.2, 0)
    leftLegCloth.userData = { isClothing: true }
    modelGroup.add(leftLegCloth)

    const rightLegCloth = new THREE.Mesh(legClothGeom, legClothMat)
    rightLegCloth.position.set(0.14, 0.2, 0)
    rightLegCloth.userData = { isClothing: true }
    modelGroup.add(rightLegCloth)
  }

  // ========== 外套 ==========
  if (props.outerColor) {
    const color = new THREE.Color(props.outerColor)
    
    const outerGeom = new THREE.CylinderGeometry(0.55, 0.5, 0.5, 12)
    const outerMat = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    })
    const outer = new THREE.Mesh(outerGeom, outerMat)
    outer.position.y = 0.85
    outer.castShadow = true
    outer.userData = { isClothing: true }
    modelGroup.add(outer)
  }
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

const rotateLeft = () => {
  controls.autoRotate = false
  modelGroup.rotation.y += 0.3
}

const rotateRight = () => {
  controls.autoRotate = false
  modelGroup.rotation.y -= 0.3
}
</script>

<style scoped>
.model-container {
  width: 100%;
  height: 320px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #f5f0eb;
}

.model-scene {
  width: 100%;
  height: 100%;
}

.model-controls {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.model-controls button {
  padding: 4px 14px;
  border: none;
  border-radius: 16px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(8px);
  font-size: 12px;
  color: #3d2c25;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s;
}

.model-controls button:hover {
  background: white;
  transform: scale(1.05);
}
</style>