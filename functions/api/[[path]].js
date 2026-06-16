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
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    })

    const buffer = await resp.arrayBuffer()
    const contentType = resp.headers.get('content-type') || ''

    let html = decodeSmart(buffer, contentType)

    const host = url.origin

    // =========================
    // 1️⃣ 删除 base（致命坑）
    // =========================
    html = html.replace(/<base[^>]*>/g, '')

    // =========================
    // 2️⃣ 域名统一替换
    // =========================
    html = html.replaceAll(TARGET_HOST, host)

    // =========================
    // 3️⃣ CSS/JS 资源统一代理（核心）
    // =========================
    html = html.replace(
      /(src|href)="\/(?!\/)([^"]+)"/g,
      `$1="${host}/api/$2"`
    )

    // =========================
    // 4️⃣ 协议相对路径修复
    // =========================
    html = html.replace(
      /(src|href)="\/\/([^"]+)"/g,
      `$1="https://$2"`
    )

    // =========================
    // 5️⃣ 输出响应
    // =========================
    return new Response(html, {
      status: resp.status,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-mirror': 'v6-production'
      }
    })

  } catch (err) {
    return new Response('proxy error: ' + err.message, {
      status: 500
    })
  }
}

---

# 🧠 三、v6 核心：智能解码（解决乱码关键）

```js id="decode_smart"
function decodeSmart(buffer, contentType) {
  const bytes = new Uint8Array(buffer)

  // 1️⃣ 从 header 识别 charset
  let charset = contentType.match(/charset=([^;]+)/i)?.[1]?.toLowerCase()

  // 2️⃣ fallback：HTML meta 判断
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  const meta = binary.match(/charset=([a-z0-9\-]+)/i)
  if (!charset && meta) {
    charset = meta[1].toLowerCase()
  }

  // 3️⃣ GBK / GB2312 处理（关键）
  if (charset === 'gbk' || charset === 'gb2312') {
    return decodeGBK(buffer)
  }

  // 4️⃣ 默认 UTF-8
  try {
    return new TextDecoder('utf-8').decode(buffer)
  } catch (e) {
    return decodeGBK(buffer)
  }
}
