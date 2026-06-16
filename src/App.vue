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
const status = ref('正在连接服务器...')

onMounted(async () => {
  let timer = setInterval(() => {
    if (progress.value < 90) {
      progress.value++
    }
  }, 60)

  try {
    status.value = '正在加载页面...'

    // =========================
    // 1️⃣ 核心：只走 GET /api + 当前路径
    // =========================
    const target =
      '/api' +
      window.location.pathname +
      window.location.search

    const res = await fetch(target, {
      method: 'GET',
      headers: {
        'Accept': 'text/html'
      }
    })

    if (!res.ok) {
      throw new Error('HTTP ' + res.status)
    }

    // =========================
    // 2️⃣ 获取 HTML（不再 JSON）
    // =========================
    const html = await res.text()

    progress.value = 100
    status.value = '正在渲染页面...'

    clearInterval(timer)

    // =========================
    // 3️⃣ 稳定渲染（镜像核心）
    // =========================
    setTimeout(() => {
      // 清空 Vue 容器，避免冲突
      document.body.innerHTML = ''

      // 写入完整 HTML
      document.open()
      document.write(html)
      document.close()
    }, 200)

  } catch (err) {
    clearInterval(timer)
    console.error(err)

    status.value = '加载失败'
    progress.value = 100
  }
})
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

.loading-container {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  font-family: Arial, Helvetica, sans-serif;
}

.logo {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 30px;
}

.status {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.progress-box {
  width: 320px;
  height: 10px;
  background: #e5e5e5;
  border-radius: 20px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  width: 0;
  background: #2196f3;
  transition: width 0.3s ease;
}

.percent {
  margin-top: 15px;
  font-size: 24px;
  font-weight: bold;
  color: #2196f3;
}
</style>
