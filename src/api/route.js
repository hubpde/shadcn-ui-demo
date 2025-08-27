// 文件：functions/api/[[path]].js

export default async function handler(req, res) {
  const targetUrl = 'https://mozhuazy.com' + req.url.replace(/^\/api/, '')

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
  })

  res.status(response.status)
  response.headers.forEach((value, key) => res.setHeader(key, value))
  response.body.pipe(res)
}
