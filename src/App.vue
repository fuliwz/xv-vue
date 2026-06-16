<template>
  <div class="loading-container">
    <div class="logo">Loading...</div>
    <div class="status">{{ status }}</div>

    <div class="progress-box">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>

    <div class="percent">{{ progress }}%</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const progress = ref(0)
const status = ref('连接服务器...')

onMounted(async () => {
  let timer = setInterval(() => {
    if (progress.value < 90) progress.value++
  }, 60)

  try {
    status.value = '加载页面中...'

    const path = window.location.pathname + window.location.search

    const res = await fetch('/api' + path, {
      method: 'GET'
    })

    const html = await res.text()

    progress.value = 100
    status.value = '渲染中...'

    clearInterval(timer)

    setTimeout(() => {
      // ⚠️ v2核心：直接替换 DOM（稳定）
      document.open()
      document.write(html)
      document.close()
    }, 200)

  } catch (e) {
    clearInterval(timer)
    status.value = '加载失败'
  }
})
</script>
