<template>
  <div class="loading-container">

    <div class="logo">
      Loading...
    </div>

    <div class="status">
      {{ status }}
    </div>

    <div class="progress-box">
      <div
        class="progress-bar"
        :style="{ width: progress + '%' }"
      ></div>
    </div>

    <div class="percent">
      {{ progress }}%
    </div>

  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'

const progress = ref(0)

const status = ref(
  '正在连接服务器...'
)

onMounted(async () => {

  let stage = 0

  const timer = setInterval(() => {

    if(progress.value < 20){

      status.value =
        '正在连接服务器...'

      progress.value++

    }else if(progress.value < 45){

      status.value =
        '正在获取视频信息...'

      progress.value++

    }else if(progress.value < 80){

      status.value =
        '正在处理页面内容...'

      progress.value++

    }else if(progress.value < 95){

      status.value =
        '正在准备渲染页面...'

      progress.value++

    }

  },80)

  try {

    const currentPath =
      window.location.pathname +
      window.location.search

    const response = await fetch(
      '/api' + currentPath,
      {
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          action:'fetch_video'
        })
      }
    )

    if(!response.ok){

      throw new Error(
        'HTTP ' +
        response.status
      )

    }

    const data =
      await response.json()

    status.value =
      '正在渲染页面...'

    progress.value = 100

    clearInterval(timer)

    setTimeout(() => {

      const decodedHtml =
        decodeURIComponent(
          escape(
            atob(
              data.encodedHtml
            )
          )
        )

      document.open()
      document.write(
        decodedHtml
      )
      document.close()

    },500)

  } catch(err){

    clearInterval(timer)

    console.error(err)

    status.value =
      '加载失败'

  }

})
</script>

<style>

html,
body{
  margin:0;
  padding:0;
}

.loading-container{

  position:fixed;

  left:0;
  top:0;

  width:100%;
  height:100%;

  display:flex;

  flex-direction:column;

  justify-content:center;

  align-items:center;

  background:#fff;

  font-family:
    Arial,
    Helvetica,
    sans-serif;

}

.logo{

  font-size:28px;

  font-weight:bold;

  margin-bottom:30px;

}

.status{

  font-size:16px;

  color:#666;

  margin-bottom:20px;

}

.progress-box{

  width:320px;

  height:10px;

  background:#e5e5e5;

  border-radius:20px;

  overflow:hidden;

}

.progress-bar{

  height:100%;

  width:0;

  background:#2196f3;

  transition:
    width .3s ease;

}

.percent{

  margin-top:15px;

  font-size:24px;

  font-weight:bold;

  color:#2196f3;

}

</style>
