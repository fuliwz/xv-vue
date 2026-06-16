const TARGET_HOST = 'https://www.roushuge.vip'

// hop-by-hop headers（必须剔除）
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade'
])

function filterHeaders(headers) {
  const h = new Headers()

  for (const [key, value] of headers.entries()) {
    const k = key.toLowerCase()
    if (!HOP_BY_HOP_HEADERS.has(k)) {
      h.set(k, value)
    }
  }

  // 强制修正 host（很重要）
  h.set('host', new URL(TARGET_HOST).host)

  return h
}

export async function onRequest(context) {
  const incomingReq = context.request
  const url = new URL(incomingReq.url)

  const targetUrl =
    TARGET_HOST +
    url.pathname.replace(/^\/api/, '') +
    url.search

  const controller = new AbortController()

  // 超时控制（10秒）
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const isBodyAllowed =
      !['GET', 'HEAD'].includes(incomingReq.method)

    const fetchOptions = {
      method: incomingReq.method,
      headers: filterHeaders(incomingReq.headers),
      redirect: 'follow',
      signal: controller.signal
    }

    if (isBodyAllowed) {
      // 用 arrayBuffer 保留二进制能力（比 text 更安全）
      fetchOptions.body = await incomingReq.arrayBuffer()
    }

    const resp = await fetch(targetUrl, fetchOptions)

    const headers = new Headers(resp.headers)

    // 防止 CF / 浏览器冲突
    headers.delete('content-encoding')
    headers.delete('content-length')
    headers.delete('transfer-encoding')

    // 可选：允许跨域（如果你做API）
    headers.set('access-control-allow-origin', '*')

    clearTimeout(timeout)

    return new Response(resp.body, {
      status: resp.status,
      headers
    })
  } catch (err) {
    clearTimeout(timeout)

    return new Response(
      JSON.stringify({
        error: 'proxy_error',
        message: err.message
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json'
        }
      }
    )
  }
}
