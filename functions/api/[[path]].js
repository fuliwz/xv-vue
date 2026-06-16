const TARGET_HOST = 'https://www.roushuge.vip'

export async function onRequest(context) {
  const req = context.request
  const url = new URL(req.url)

  const path = url.pathname.replace(/^\/api/, '') || '/'
  const targetUrl = TARGET_HOST + path + url.search

  try {
    const resp = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': req.headers.get('User-Agent') || '',
        'Accept': 'text/html'
      }
    })

    // =========================
    // 1️⃣ 解决乱码：必须用 arrayBuffer
    // =========================
    const buffer = await resp.arrayBuffer()
    let html = new TextDecoder('utf-8').decode(buffer)

    const host = url.origin

    // =========================
    // 2️⃣ 去掉 base 标签（致命点）
    // =========================
    html = html.replace(/<base[^>]*>/g, '')

    // =========================
    // 3️⃣ 统一域名替换
    // =========================
    html = html.replaceAll(TARGET_HOST, host)

    // =========================
    // 4️⃣ 修复 CSS / JS（关键升级）
    // =========================
    html = html
      // /xxx 资源
      .replace(/(href|src)="\/(?!\/)/g, `$1="${host}/`)

      // //cdn.xxx.com（协议相对路径）
      .replace(/(href|src)="\/\//g, `$1="https://`)

    // =========================
    // 5️⃣ 防止 CF/浏览器缓存干扰
    // =========================
    return new Response(html, {
      status: resp.status,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-mirror': 'v3-fixed'
      }
    })

  } catch (e) {
    return new Response('proxy error: ' + e.message, {
      status: 500
    })
  }
}
