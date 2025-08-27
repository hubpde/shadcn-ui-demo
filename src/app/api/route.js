// 路径：src/app/api/[[...path]]/route.js
export const runtime = 'edge' // Cloudflare Pages 需要 Edge Runtime

const proxy = (req) => {
  const url = new URL(req.url)
  url.hostname = 'mozhuazy.com'
  url.protocol = 'https:'
  url.port = '' // 用默认 443

  // 最简：克隆原请求，只改 URL（Host 会随 URL 自动匹配）
  return fetch(new Request(url, req))
}

// 覆盖常见所有方法（最简复用）
export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE, proxy as PATCH, proxy as HEAD, proxy as OPTIONS }
