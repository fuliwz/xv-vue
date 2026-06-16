export async function onRequest(context) {
  const url = new URL(context.request.url)

  const targetHost = 'https://www.roushuge.vip'

  const targetUrl =
    targetHost +
    url.pathname.replace(/^\/api/, '') +
    url.search

  const init = {
    method: context.request.method,
    headers: context.request.headers
  }

  if (
    context.request.method !== 'GET' &&
    context.request.method !== 'HEAD'
  ) {
    init.body = await context.request.text()
  }

  const response = await fetch(targetUrl, init)

  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  })
}
