'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Search, Play, Loader2, ArrowLeft, Calendar, Clock, Star, Users, Film, MapPin, ChevronRight, Sun, Moon } from 'lucide-react';

const API_BASE = 'https://mozhuazy.com/api.php/provide/vod/';

interface VideoItem {
  vod_id: number;
  vod_name: string;
  type_name: string;
  vod_remarks: string;
  vod_actor?: string;
  vod_director?: string;
  vod_writer?: string;
  vod_pic?: string;
  vod_content?: string;
  vod_play_url?: string;
  vod_year?: string;
  vod_area?: string;
  vod_lang?: string;
  vod_duration?: string;
  vod_score?: string;
  vod_pubdate?: string;
  vod_class?: string;
  vod_blurb?: string;
}

interface SearchResponse {
  code: number;
  msg: string;
  list: VideoItem[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [episodes, setEpisodes] = useState<string[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [error, setError] = useState<string>('');
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [recommendedVideos, setRecommendedVideos] = useState<VideoItem[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const fetchRecommendedVideos = async () => {
    setLoadingRecommended(true);
    try {
      const response = await fetch(`${API_BASE}?ac=list`);
      const data: SearchResponse = await response.json();
      
      if (data.code === 1) {
        setRecommendedVideos(data.list?.slice(0, 12) || []);
      }
    } catch (error) {
      // 静默失败，不显示错误
    } finally {
      setLoadingRecommended(false);
    }
  };

  useEffect(() => {
    fetchRecommendedVideos();
    
    // 初始化主题
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    setSelectedVideo(null);
    setCurrentVideoUrl('');
    setEpisodes([]);
    setCurrentEpisodeIndex(null);
    
    try {
      const response = await fetch(`${API_BASE}?ac=list&wd=${encodeURIComponent(searchQuery)}`);
      const data: SearchResponse = await response.json();
      
      if (data.code === 1) {
        setSearchResults(data.list || []);
        if (data.list?.length === 0) {
          showError("未找到相关内容，试试其他关键词");
        }
      } else {
        showError(data.msg || "搜索失败");
        setSearchResults([]);
      }
    } catch (error) {
      showError("网络连接失败，请检查网络后重试");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodes = async (video: VideoItem) => {
    setSelectedVideo(video);
    setLoadingEpisodes(true);
    setCurrentVideoUrl('');
    setCurrentEpisodeIndex(null);
    
    try {
      const response = await fetch(`${API_BASE}?ac=detail&ids=${video.vod_id}`);
      const data: SearchResponse = await response.json();
      
      if (data.code === 1 && data.list && data.list.length > 0) {
        const videoData = data.list[0];
        setSelectedVideo(videoData);
        const playUrl = videoData.vod_play_url || '';
        
        const episodeUrls: string[] = [];
        if (playUrl) {
          const episodes = playUrl.split('#');
          episodes.forEach(episode => {
            const parts = episode.split('$');
            if (parts.length === 2 && parts[1].includes('.m3u8')) {
              episodeUrls.push(parts[1]);
            }
          });
        }
        
        setEpisodes(episodeUrls);
        if (episodeUrls.length === 1) {
          playEpisode(episodeUrls[0], 0);
        }
      } else {
        setEpisodes([]);
        showError("未找到播放资源");
      }
    } catch (error) {
      showError("获取详细信息失败");
      setEpisodes([]);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const playEpisode = (url: string, index: number) => {
    setCurrentVideoUrl(`https://mzm3u8jx.com/aliplayer.html?url=${url}`);
    setCurrentEpisodeIndex(index);
  };

  const playNextEpisode = () => {
    if (currentEpisodeIndex !== null && currentEpisodeIndex < episodes.length - 1) {
      const nextIndex = currentEpisodeIndex + 1;
      playEpisode(episodes[nextIndex], nextIndex);
    }
  };

  const playPreviousEpisode = () => {
    if (currentEpisodeIndex !== null && currentEpisodeIndex > 0) {
      const prevIndex = currentEpisodeIndex - 1;
      playEpisode(episodes[prevIndex], prevIndex);
    }
  };

  const resetView = () => {
    setSelectedVideo(null);
    setEpisodes([]);
    setCurrentVideoUrl('');
    setCurrentEpisodeIndex(null);
  };

  const formatContent = (content: string) => {
    return content?.replace(/<[^>]*>/g, '').replace(/\.\.\.<\/p>$/, '...') || '';
  };

  const getScoreColor = (score: string) => {
    const num = parseFloat(score);
    if (num >= 8) return 'text-green-600';
    if (num >= 7) return 'text-yellow-600';
    if (num >= 6) return 'text-orange-600';
    return 'text-red-600';
  };

  const renderVideoCard = (video: VideoItem) => (
    <Card 
      key={video.vod_id} 
      className="cursor-pointer hover:shadow-md transition-shadow" 
      onClick={() => fetchEpisodes(video)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight line-clamp-2">
            {video.vod_name}
          </CardTitle>
          <ChevronRight className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">{video.type_name}</Badge>
          {video.vod_year && (
            <span className="text-muted-foreground">{video.vod_year}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2">
          <Badge className="font-medium">{video.vod_remarks}</Badge>
          {video.vod_score && parseFloat(video.vod_score) > 0 && (
            <div className={`text-sm font-medium ${getScoreColor(video.vod_score)}`}>
              ★ {video.vod_score}
            </div>
          )}
        </div>
        {video.vod_actor && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            <Users className="h-3 w-3 inline mr-1" />
            {video.vod_actor.split(',').slice(0, 4).join(' / ')}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderLoadingCards = (count: number) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-20"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* 顶部工具栏 */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="gap-2"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? '浅色' : '深色'}
            </Button>
          </div>

          {/* 搜索区域 */}
          <div className={selectedVideo ? 'py-4' : 'py-16'}>
            <div className="max-w-2xl mx-auto text-center space-y-6">
              {!selectedVideo && (
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight">视频搜索</h1>
                  <p className="text-lg text-muted-foreground">发现精彩影视内容</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="搜索电影、电视剧、动漫..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="h-12 text-base pr-12"
                  />
                  <Button 
                    onClick={handleSearch} 
                    disabled={loading} 
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {selectedVideo && (
                <div className="flex items-center justify-center gap-4">
                  <Button variant="ghost" size="sm" onClick={resetView} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    返回搜索结果
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    正在浏览: {selectedVideo.vod_name}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 首页推荐内容 */}
          {!selectedVideo && !hasSearched && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">最新更新</h2>
                <p className="text-muted-foreground">发现热门影视作品</p>
              </div>
              
              {loadingRecommended ? (
                renderLoadingCards(12)
              ) : recommendedVideos.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {recommendedVideos.map((video) => renderVideoCard(video))}
                </div>
              ) : null}
            </div>
          )}

          {/* 搜索加载占位符 */}
          {loading && hasSearched && renderLoadingCards(8)}

          {/* 搜索结果 */}
          {!selectedVideo && hasSearched && !loading && (
            <div className="space-y-6">
              {searchResults.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">搜索结果</h2>
                    <Badge variant="secondary" className="text-sm">
                      找到 {searchResults.length} 部作品
                    </Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {searchResults.map((video) => renderVideoCard(video))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Film className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">没有找到相关内容</h3>
                  <p className="text-muted-foreground">试试其他关键词或检查拼写</p>
                </div>
              )}
            </div>
          )}

          {/* 视频详情页 */}
          {selectedVideo && (
            <div className="space-y-8">
              {/* 视频标题区 */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{selectedVideo.vod_name}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Film className="h-4 w-4" />
                        {selectedVideo.type_name}
                      </span>
                      {selectedVideo.vod_year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {selectedVideo.vod_year}
                        </span>
                      )}
                      {selectedVideo.vod_area && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {selectedVideo.vod_area}
                        </span>
                      )}
                      {selectedVideo.vod_duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {selectedVideo.vod_duration} 分钟
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-base px-3 py-1">{selectedVideo.vod_remarks}</Badge>
                    {selectedVideo.vod_score && parseFloat(selectedVideo.vod_score) > 0 && (
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm font-medium ${getScoreColor(selectedVideo.vod_score)}`}>
                        <Star className="h-4 w-4 fill-current" />
                        {selectedVideo.vod_score}
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedVideo.vod_class && (
                  <div className="flex flex-wrap gap-2">
                    {selectedVideo.vod_class.split(',').map((genre, index) => (
                      <Badge key={index} variant="secondary">{genre}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-8 lg:grid-cols-4">
                {/* 左侧信息栏 */}
                <div className="lg:col-span-1 space-y-6">
                  {/* 海报 */}
                  {selectedVideo.vod_pic && (
                    <Card>
                      <CardContent className="p-4">
                        <AspectRatio ratio={3/4}>
                          <img 
                            src={selectedVideo.vod_pic} 
                            alt={selectedVideo.vod_name}
                            className="object-cover w-full h-full rounded-lg"
                          />
                        </AspectRatio>
                      </CardContent>
                    </Card>
                  )}

                  {/* 演职员信息 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">演职员</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      {selectedVideo.vod_director && (
                        <div>
                          <p className="font-medium text-foreground mb-1">导演</p>
                          <p className="text-muted-foreground">{selectedVideo.vod_director}</p>
                        </div>
                      )}
                      
                      {selectedVideo.vod_writer && (
                        <div>
                          <p className="font-medium text-foreground mb-1">编剧</p>
                          <p className="text-muted-foreground">{selectedVideo.vod_writer}</p>
                        </div>
                      )}

                      {selectedVideo.vod_actor && (
                        <div>
                          <p className="font-medium text-foreground mb-1">主演</p>
                          <p className="text-muted-foreground leading-relaxed">{selectedVideo.vod_actor}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 右侧主内容区 */}
                <div className="lg:col-span-3 space-y-6">
                  {/* 播放器 */}
                  {currentVideoUrl && (
                    <Card>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Play className="h-5 w-5 text-green-600" />
                            正在播放
                            {currentEpisodeIndex !== null && episodes.length > 1 && (
                              <Badge variant="secondary">第 {currentEpisodeIndex + 1} / {episodes.length} 集</Badge>
                            )}
                          </CardTitle>
                          {episodes.length > 1 && (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={playPreviousEpisode}
                                disabled={currentEpisodeIndex === 0}
                              >
                                上一集
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={playNextEpisode}
                                disabled={currentEpisodeIndex === episodes.length - 1}
                              >
                                下一集
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <AspectRatio ratio={16/9}>
                          <iframe
                            src={currentVideoUrl}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allowFullScreen
                            className="rounded-b-lg"
                          />
                        </AspectRatio>
                      </CardContent>
                    </Card>
                  )}

                  {/* 选项卡内容 */}
                  <Card>
                    <Tabs defaultValue="episodes" className="w-full">
                      <CardHeader className="pb-4">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="episodes" className="gap-2">
                            <Play className="h-4 w-4" />
                            {episodes.length === 1 ? '播放' : `剧集 (${episodes.length})`}
                          </TabsTrigger>
                          <TabsTrigger value="info">详细信息</TabsTrigger>
                        </TabsList>
                      </CardHeader>

                      <CardContent>
                        <TabsContent value="episodes" className="mt-0">
                          {loadingEpisodes ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                              <Loader2 className="h-6 w-6 animate-spin" />
                              <p className="text-muted-foreground">加载中...</p>
                            </div>
                          ) : episodes.length > 0 ? (
                            <>
                              {episodes.length === 1 ? (
                                <div className="text-center py-8">
                                  <Button 
                                    size="lg" 
                                    onClick={() => playEpisode(episodes[0], 0)}
                                    className="gap-2"
                                  >
                                    <Play className="h-5 w-5" />
                                    开始播放
                                  </Button>
                                </div>
                              ) : (
                                <ScrollArea className="h-80">
                                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 pr-4">
                                    {episodes.map((episode, index) => (
                                      <Button
                                        key={index}
                                        variant={currentEpisodeIndex === index ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => playEpisode(episode, index)}
                                        className="h-12 text-sm font-medium"
                                      >
                                        {index + 1}
                                      </Button>
                                    ))}
                                  </div>
                                </ScrollArea>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-12 space-y-3">
                              <Film className="h-12 w-12 mx-auto text-muted-foreground" />
                              <div>
                                <h3 className="font-medium mb-1">暂无播放资源</h3>
                                <p className="text-sm text-muted-foreground">该内容暂时无法播放</p>
                              </div>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="info" className="mt-0">
                          <ScrollArea className="h-80">
                            <div className="space-y-6 pr-4">
                              {selectedVideo.vod_blurb && (
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-base">剧情简介</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {selectedVideo.vod_blurb}
                                  </p>
                                </div>
                              )}
                              
                              {selectedVideo.vod_content && formatContent(selectedVideo.vod_content) && (
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-base">详细介绍</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {formatContent(selectedVideo.vod_content)}
                                  </p>
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                {selectedVideo.vod_pubdate && (
                                  <div className="space-y-1">
                                    <p className="font-medium text-sm">上映时间</p>
                                    <p className="text-sm text-muted-foreground">{selectedVideo.vod_pubdate}</p>
                                  </div>
                                )}

                                {selectedVideo.vod_lang && (
                                  <div className="space-y-1">
                                    <p className="font-medium text-sm">语言</p>
                                    <p className="text-sm text-muted-foreground">{selectedVideo.vod_lang}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </CardContent>
                    </Tabs>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
