// 文件: src/app/api/[[...path]]/route.js
export const runtime = 'edge'

const proxy = (req) => {
  const url = new URL(req.url)
  url.hostname = 'mozhuazy.com'
  url.protocol = 'https:'
  url.port = ''

  // 去掉 /api 前缀
  url.pathname = url.pathname.replace(/^\/api/, '') || '/'

  return fetch(new Request(url, req))
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as DELETE,
  proxy as PATCH,
  proxy as HEAD,
  proxy as OPTIONS,
}
