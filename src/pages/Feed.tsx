import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Search as SearchIcon, X as CloseIcon } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import VideoPlayer from "@/components/VideoPlayer";

const Feed = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const categories = [
    "All", "Soca", "Dancehall", "Carnival", "Comedy", "Dance", "Music", "Local News"
  ];

  useEffect(() => {
    fetchVideos();
  }, [activeCategory]);

  // Focus search input when shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);
  // Search function for hashtags, tags, categories, title, description
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    // Search for hashtags, tags, categories, title, description
    // Hashtags: #tag, tags: comma/space separated, category, title, description
    let query = supabase
      .from('videos')
      .select(`*, profiles(username, avatar_url)`)
      .order('created_at', { ascending: false })
      .limit(50); // Limit search results

    // If search term starts with #, search description/tags for hashtag
    if (searchTerm.startsWith('#')) {
      const tag = searchTerm.replace('#', '').toLowerCase();
      query = query.ilike('description', `%#${tag}%`);
    } else {
      // Otherwise, search title, description, category, tags
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,tags.ilike.%${searchTerm}%`);
    }
    const { data, error } = await query;
    if (!error) {
      setSearchResults(data || []);
    } else {
      setSearchResults([]);
    }
    setSearchLoading(false);
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try with profiles join
      let query = supabase
        .from('videos')
        .select(`*, profiles(username, avatar_url)`)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to prevent performance issues

      // Filter by category if not "All"
      if (activeCategory !== "All") {
        query = query.eq('category', activeCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching videos with profiles:', error);
        // If profiles join fails, try without it
        let fallbackQuery = supabase
          .from('videos')
          .select(`*`)
          .order('created_at', { ascending: false })
          .limit(50);

        if (activeCategory !== "All") {
          fallbackQuery = fallbackQuery.eq('category', activeCategory);
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        
        if (fallbackError) {
          console.error('Error fetching videos without profiles:', fallbackError);
          setError('Failed to load videos. Please try again.');
          return;
        }
        
        setVideos(fallbackData || []);
      } else {
        setVideos(data || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (count?: number) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
                  <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Limey</h1>
            <div className="flex items-center space-x-2">
              {/* Search Icon Button */}
              <Button variant="ghost" size="icon" onClick={() => setShowSearch((v) => !v)} aria-label="Search">
                <SearchIcon size={20} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={fetchVideos}
                disabled={loading}
                aria-label="Refresh"
              >
                <div className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/upload')}>Upload</Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/settings')}
              >
                <Settings size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>Logout</Button>
            </div>
          </div>

        {/* Search Bar Overlay */}
        {showSearch && (
          <form onSubmit={handleSearch} className="flex items-center gap-2 mt-4 mb-2">
            <input
              ref={searchInputRef}
              type="text"
              className="flex-1 p-2 border rounded text-base bg-background text-foreground"
              placeholder="Search hashtags, titles, categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Button type="submit" variant="neon" size="icon" aria-label="Go" disabled={searchLoading}>
              {searchLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              ) : (
                <SearchIcon size={18} />
              )}
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => { setShowSearch(false); setSearchTerm(""); setSearchResults(null); }} aria-label="Close">
              <CloseIcon size={18} />
            </Button>
          </form>
        )}

        {/* Category Pills */}
        <div className="flex overflow-x-auto space-x-2 mt-4 pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Video Grid or Search Results */}
      <div className="p-4 pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchVideos} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (searchResults !== null ? (
          searchLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                Try searching with different keywords or hashtags
              </p>
              <Button onClick={() => { setShowSearch(false); setSearchTerm(""); setSearchResults(null); }} variant="outline">
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchResults.map((video) => (
                <Card 
                  key={video.id} 
                  className="video-card relative group cursor-pointer"
                  onClick={() => {
                    setSelectedVideo(video);
                    setCurrentVideoIndex(searchResults.findIndex(v => v.id === video.id));
                  }}
                >
                  <div className="relative aspect-[9/16] bg-muted rounded-lg overflow-hidden">
                    {video.thumbnail_url ? (
                      <img
                        src={`https://hhcirfvubsugcuypjyxpe.supabase.co/storage/v1/object/public/limeytt-uploads/${video.thumbnail_url}`}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl">🎬</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Video</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="bg-black/70 text-white">
                        {formatDuration(video.duration)}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground text-xl">▶</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="creator-badge">@{video.profiles?.username || 'unknown'}</span>
                      <span>{formatViews(video.view_count)} views</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (videos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📹</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
            <p className="text-muted-foreground mb-4">
              {activeCategory === "All" 
                ? "Be the first to upload a video!" 
                : `No videos found in the "${activeCategory}" category`
              }
            </p>
            <Button onClick={() => navigate('/upload')} variant="neon">
              Upload Your First Video
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <Card 
                key={video.id} 
                className="video-card relative group cursor-pointer"
                onClick={() => {
                  setSelectedVideo(video);
                  setCurrentVideoIndex(videos.findIndex(v => v.id === video.id));
                }}
              >
                <div className="relative aspect-[9/16] bg-muted rounded-lg overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={`https://hhcirfvubsugcuypjyxpe.supabase.co/storage/v1/object/public/limeytt-uploads/${video.thumbnail_url}`}
                      alt={video.title}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl">🎬</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Video</p>
                      </div>
                    </div>
                  )}
                  {/* Video Duration */}
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      {formatDuration(video.duration)}
                    </Badge>
                  </div>
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <button
                      className="w-12 h-12 bg-primary rounded-full flex items-center justify-center focus:outline-none"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedVideo(video);
                        setCurrentVideoIndex(videos.findIndex(v => v.id === video.id));
                      }}
                      aria-label="Play video"
                    >
                      <span className="text-primary-foreground text-xl">▶</span>
                    </button>
                  </div>
                </div>
                {/* Video Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                    {video.title}
                  </h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="creator-badge">@{video.profiles?.username || 'unknown'}</span>
                      <span>{formatViews(video.view_count)} views</span>
                    </div>
                </div>
              </Card>
            ))}
          </div>
        )))}

      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer 
          video={selectedVideo}
          videos={searchResults !== null ? searchResults : videos}
          currentIndex={currentVideoIndex}
          onClose={() => setSelectedVideo(null)}
          onNext={() => {
            const arr = searchResults !== null ? searchResults : videos;
            const nextIndex = currentVideoIndex + 1;
            if (nextIndex < arr.length) {
              setCurrentVideoIndex(nextIndex);
              setSelectedVideo(arr[nextIndex]);
            }
          }}
          onPrevious={() => {
            const arr = searchResults !== null ? searchResults : videos;
            const prevIndex = currentVideoIndex - 1;
            if (prevIndex >= 0) {
              setCurrentVideoIndex(prevIndex);
              setSelectedVideo(arr[prevIndex]);
            }
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Feed;