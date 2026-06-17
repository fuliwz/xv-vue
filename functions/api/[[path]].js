const TARGET_HOST = 'https://www.xvideos.com'

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
        'Accept': 'text/html',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    })

    const buffer = await resp.arrayBuffer()
    const contentType = resp.headers.get('content-type') || ''

    let html = decodeSmart(buffer, contentType)

    const host = url.origin

    // 删除 base
    html = html.replace(/<base[^>]*>/g, '')

    // 域名替换
    html = html.replaceAll(TARGET_HOST, host)

    // 资源代理
    html = html.replace(
      /(src|href)="\/(?!\/)([^"]+)"/g,
      `$1="${host}/api/$2"`
    )

    // 协议修复
    html = html.replace(
      /(src|href)="\/\/([^"]+)"/g,
      `$1="https://$2"`
    )

    return new Response(html, {
      status: resp.status,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store'
      }
    })

  } catch (err) {
    return new Response('proxy error: ' + err.message, {
      status: 500
    })
  }
}

/* =========================
   🔧 智能解码（GBK/UTF-8）
========================= */

function decodeSmart(buffer, contentType) {
  const bytes = new Uint8Array(buffer)

  let charset =
    contentType.match(/charset=([^;]+)/i)?.[1]?.toLowerCase()

  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  const meta = binary.match(/charset=([a-z0-9\-]+)/i)
  if (!charset && meta) charset = meta[1].toLowerCase()

  if (charset === 'gbk' || charset === 'gb2312') {
    return decodeGBK(buffer)
  }

  try {
    return new TextDecoder('utf-8').decode(buffer)
  } catch (e) {
    return decodeGBK(buffer)
  }
}

/* =========================
   🔧 GBK fallback
========================= */

function decodeGBK(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return decodeURIComponent(escape(binary))
}
