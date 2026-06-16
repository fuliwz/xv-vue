const TARGET_HOST = 'https://kppq7764skqo.madou.christmas'

export async function onRequest(context) {
  const req = context.request
  const url = new URL(req.url)

  const path = url.pathname.replace(/^\/api/, '') || '/'
  const targetUrl = TARGET_HOST + path + url.search

  try {
    // =========================
    // 1️⃣ 请求源站
    // =========================
    const resp = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': req.headers.get('User-Agent') || '',
        'Accept': req.headers.get('Accept') || '*/*',
        'Referer': TARGET_HOST
      }
    })

    const contentType = resp.headers.get('content-type') || ''

    const buffer = await resp.arrayBuffer()
    let body = new TextDecoder('utf-8').decode(buffer)

    const host = url.origin

    // =========================
    // 2️⃣ 如果是 HTML → 做镜像重写
    // =========================
    if (contentType.includes('text/html')) {

      // 2.1 删除 base（致命坑）
      body = body.replace(/<base[^>]*>/g, '')

      // 2.2 替换源站域名
      body = body.replaceAll(TARGET_HOST, host)

      // 2.3 ⭐关键：所有资源统一走 /api 代理（解决 JS/CSS fallback）
      body = body.replace(
        /(src|href)="\/(?!\/)([^"]+)"/g,
        `$1="${host}/api/$2"`
      )

      // 2.4 处理协议相对路径
      body = body.replace(
        /(src|href)="\/\/(.*?)"/g,
        `$1="https://$2"`
      )
    }

    // =========================
    // 3️⃣ 返回响应
    // =========================
    return new Response(body, {
      status: resp.status,
      headers: {
        'content-type': contentType.includes('text/html')
          ? 'text/html; charset=utf-8'
          : contentType,

        'cache-control': 'no-cache',
        'x-mirror': 'pages-v3-fixed'
      }
    })

  } catch (err) {
    return new Response(
      'proxy error: ' + err.message,
      { status: 500 }
    )
  }
}
