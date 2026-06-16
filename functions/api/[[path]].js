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

    const buffer = await resp.arrayBuffer()
    let html = new TextDecoder('utf-8').decode(buffer)

    const host = url.origin

    // =========================
    // 1️⃣ 域名替换（核心）
    // =========================
    html = html.replaceAll(TARGET_HOST, host)

    // =========================
    // 2️⃣ 删除 base 标签（防资源错位）
    // =========================
    html = html.replace(/<base[^>]*>/g, '')

    // =========================
    // 3️⃣ 修复绝对路径资源
    // =========================
    html = html
      .replace(/src="\//g, `src="${host}/`)
      .replace(/href="\//g, `href="${host}/`)

    // =========================
    // 4️⃣ 防止乱码头
    // =========================
    return new Response(html, {
      status: resp.status,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-cache',
        'x-mirror': 'v2-single-source'
      }
    })

  } catch (err) {
    return new Response(
      `proxy error: ${err.message}`,
      { status: 500 }
    )
  }
}
