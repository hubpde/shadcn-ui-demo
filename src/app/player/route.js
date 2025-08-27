// 文件: src/app/player/route.js
export const runtime = 'edge'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const videoUrl = searchParams.get('url')
  
  // 回退图片
  const fallbackImage = 'https://bizhi1.com/wp-content/uploads/2025/07/minimalist-pink-checkerboard-pattern-desktop-wallpaper.jpg'
  
  const html = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>YV - Player</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body { height: 100%; margin: 0; background: #000; }
    #player { width: 100%; height: 100%; }
    #fallback-image { 
      width: 100%; 
      height: 100%; 
      object-fit: cover; 
      display: block;
    }
  </style>
</head>
<body>
  ${videoUrl ? '<div id="player"></div>' : `<img id="fallback-image" src="${fallbackImage}" alt="默认图片" />`}
  
  ${videoUrl ? `
  <!-- 依赖 -->
  <script src="https://cdn.jsdelivr.net/npm/hls.js/dist/hls.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.min.js"></script>
  <script>
    const art = new Artplayer({
      container: '#player',
      url: '${videoUrl}',
      type: 'm3u8',
      autoplay: true,
      // —— 控件/功能开关（常用）——
      fullscreen: true,         // 原生全屏按钮
      fullscreenWeb: false,      // 网页全屏按钮
      pip: true,                // 画中画
      playbackRate: true,       // 倍速
      setting: true,            // 右上角设置
      miniProgressBar: true,    // 迷你进度条
      hotkey: true,             // 空格/方向键 等快捷键
      airplay: true,            // AirPlay（支持设备时）
      lang: (navigator.language || 'zh-CN').toLowerCase(),
      theme: '#1e90ff',
      // 使用 hls.js 播放 m3u8
      customType: {
        m3u8: (video, url) => {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            art.on('destroy', () => hls.destroy());
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url; // Safari 原生
          } else {
            alert('当前浏览器不支持播放该流');
          }
        },
      },
    });
    // 可选：首次点击自动请求全屏（避免自动全屏被限制）
    document.addEventListener('click', () => {
      if (!document.fullscreenElement) art.fullscreen.request();
    }, { once: true });
  </script>
  ` : ''}
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
