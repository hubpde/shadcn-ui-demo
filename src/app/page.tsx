'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Search, Play, Loader2, ArrowLeft, Calendar, Clock, Star, Users, Film, MapPin, ChevronRight, ExternalLink, X, History } from 'lucide-react';

const API_BASE = '/api/api.php/provide/vod/';

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
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 从本地存储加载搜索历史
  useEffect(() => {
    const saved = localStorage.getItem('search_history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch {
        // 忽略解析错误
      }
    }
  }, []);

  // 保存搜索历史到本地存储
  const saveSearchHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  // 清空搜索历史
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search_history');
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const fetchRecommendedVideos = async () => {
    setLoadingRecommended(true);
    try {
      const response = await fetch(`${API_BASE}?ac=list`);
      const data: SearchResponse = await response.json();
      
      if (data.code === 1) {
        setRecommendedVideos(data.list?.slice(0, 12) || []);
      }
    } catch {
      // 静默失败，可以添加重试逻辑
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchRecommendedVideos();
        }, 2000);
      }
    } finally {
      setLoadingRecommended(false);
    }
  };

  useEffect(() => {
    fetchRecommendedVideos();
  }, [retryCount]);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    setSelectedVideo(null);
    setCurrentVideoUrl('');
    setEpisodes([]);
    setCurrentEpisodeIndex(null);
    setShowHistory(false);
    
    // 保存到搜索历史
    saveSearchHistory(searchTerm);
    
    try {
      const response = await fetch(`${API_BASE}?ac=list&wd=${encodeURIComponent(searchTerm)}`);
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
    } catch {
      showError("网络连接失败，请检查网络后重试");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 防抖搜索
  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // 如果输入为空，显示搜索历史
    if (!value.trim() && searchHistory.length > 0) {
      setShowHistory(true);
    } else {
      setShowHistory(false);
    }
  };

  // 清空输入框
  const clearSearch = () => {
    setSearchQuery('');
    setShowHistory(false);
    inputRef.current?.focus();
  };

  // 重置到首页
  const resetToHome = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedVideo(null);
    setCurrentVideoUrl('');
    setEpisodes([]);
    setCurrentEpisodeIndex(null);
    setHasSearched(false);
    setShowHistory(false);
    setError('');
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
    } catch {
      showError("获取详细信息失败");
      setEpisodes([]);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const playEpisode = (url: string, index: number) => {
    setCurrentVideoUrl(`/player?url=${url}`);
    setCurrentEpisodeIndex(index);
  };

  const resetView = () => {
    setSelectedVideo(null);
    setEpisodes([]);
    setCurrentVideoUrl('');
    setCurrentEpisodeIndex(null);
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
      className="cursor-pointer hover:shadow-md transition-shadow group" 
      onClick={() => fetchEpisodes(video)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {video.vod_name}
          </CardTitle>
          <ChevronRight className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
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
      <div className="container mx-auto p-6 max-w-6xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError('')}
                className="h-auto p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 搜索区域 */}
        <div className={selectedVideo ? 'py-4' : 'py-14'}>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            {!selectedVideo && (
              <div className="space-y-3">
                <h1 
                  className="text-4xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors" 
                  onClick={resetToHome}
                >
                  YV
                </h1>
              </div>
            )}
            
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    placeholder="公主今天看点什么？"
                    value={searchQuery}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    onFocus={() => {
                      if (!searchQuery.trim() && searchHistory.length > 0) {
                        setShowHistory(true);
                      }
                    }}
                    onBlur={() => {
                      // 延迟隐藏历史记录，允许点击
                      setTimeout(() => setShowHistory(false), 200);
                    }}
                    className="h-12 text-base pr-24"
                  />
                  
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                    {searchQuery && (
                      <Button 
                        onClick={clearSearch}
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleSearch()} 
                      disabled={loading || !searchQuery.trim()} 
                      size="sm"
                      className="h-10 w-10 p-0"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* 搜索历史下拉 */}
              {showHistory && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <History className="h-4 w-4" />
                        搜索历史
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearchHistory}
                        className="h-auto p-1 text-muted-foreground hover:text-foreground"
                      >
                        清空
                      </Button>
                    </div>
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-2 hover:bg-muted rounded text-sm transition-colors"
                        onClick={() => {
                          setSearchQuery(item);
                          handleSearch(item);
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
          <div>
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
                  <Badge variant="secondary">找到 {searchResults.length} 部作品</Badge>
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
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* 视频标题区 */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold">{selectedVideo.vod_name}</h1>
              <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-muted-foreground">
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
              
              <div className="flex flex-wrap justify-center gap-2">
                <Badge className="text-sm px-3 py-1">{selectedVideo.vod_remarks}</Badge>
                {selectedVideo.vod_score && parseFloat(selectedVideo.vod_score) > 0 && (
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm font-medium ${getScoreColor(selectedVideo.vod_score)}`}>
                    <Star className="h-4 w-4 fill-current" />
                    {selectedVideo.vod_score}
                  </div>
                )}
                {selectedVideo.vod_class && selectedVideo.vod_class.split(',').map((genre, index) => (
                  <Badge key={index} variant="secondary">{genre}</Badge>
                ))}
              </div>
            </div>

            {/* 播放器 */}
            {currentVideoUrl && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-600" />
                    <span className="font-medium">正在播放</span>
                    {currentEpisodeIndex !== null && episodes.length > 1 && (
                      <Badge variant="secondary">第 {currentEpisodeIndex + 1} 集</Badge>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(currentVideoUrl, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    新窗口播放
                  </Button>
                </div>
                <AspectRatio ratio={16/9} className="bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={currentVideoUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                    allow="fullscreen *; autoplay; encrypted-media; picture-in-picture"
                    sandbox="allow-same-origin allow-scripts allow-presentation allow-forms"
                  />
                </AspectRatio>
              </div>
            )}

            {/* 内容区 */}
            <div className="grid gap-8 md:grid-cols-3">
              
              {/* 海报 */}
              <div className="md:col-span-1">
                {selectedVideo.vod_pic && (
                  <AspectRatio ratio={3/4} className="mb-6">
                    <img 
                      src={selectedVideo.vod_pic} 
                      alt={selectedVideo.vod_name}
                      className="object-cover w-full h-full rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </AspectRatio>
                )}
                
                {/* 演职员信息 */}
                <div className="space-y-4 text-sm">
                  {selectedVideo.vod_director && (
                    <div>
                      <p className="font-medium mb-1">导演</p>
                      <p className="text-muted-foreground">{selectedVideo.vod_director}</p>
                    </div>
                  )}
                  
                  {selectedVideo.vod_actor && (
                    <div>
                      <p className="font-medium mb-1">主演</p>
                      <p className="text-muted-foreground leading-relaxed">{selectedVideo.vod_actor}</p>
                    </div>
                  )}

                  {selectedVideo.vod_pubdate && (
                    <div>
                      <p className="font-medium mb-1">上映时间</p>
                      <p className="text-muted-foreground">{selectedVideo.vod_pubdate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 剧集和简介 */}
              <div className="md:col-span-2 space-y-6 pb-8 md:pb-12">
                
                {/* 剧集选择 */}
                {loadingEpisodes ? (
                  <div className="space-y-4">
                    <div className="h-7 bg-muted rounded w-48 animate-pulse"></div>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                ) : episodes.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">
                      {episodes.length === 1 ? '开始播放' : `选择集数 (共 ${episodes.length} 集)`}
                    </h3>
                    
                    {episodes.length === 1 ? (
                      <Button 
                        size="lg" 
                        onClick={() => playEpisode(episodes[0], 0)}
                        className="w-full gap-2"
                      >
                        <Play className="h-5 w-5" />
                        立即播放
                      </Button>
                    ) : (
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                        {episodes.map((episode, index) => (
                          <Button
                            key={index}
                            variant={currentEpisodeIndex === index ? "default" : "outline"}
                            size="sm"
                            onClick={() => playEpisode(episode, index)}
                            className="h-12 text-sm font-medium hover:scale-105 transition-transform"
                          >
                            {index + 1}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">暂无播放资源</p>
                  </div>
                )}

                {/* 剧情简介 */}
                {selectedVideo.vod_blurb && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">剧情简介</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedVideo.vod_blurb}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
