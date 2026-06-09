<template>
  <div style="padding:20px">加载中...</div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
  try {
    const currentPath =
      window.location.pathname +
      window.location.search

    const response = await fetch('/api' + currentPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'fetch_video'
      })
    })

    if (!response.ok) {
      throw new Error('HTTP ' + response.status)
    }

    const data = await response.json()

    const decodedHtml = decodeURIComponent(
      escape(atob(data.encodedHtml))
    )

    document.open()
    document.write(decodedHtml)
    document.close()
  } catch (err) {
    console.error(err)
  }
})
</script>
