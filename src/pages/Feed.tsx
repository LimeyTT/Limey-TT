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
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
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
    setLoading(true);
    // Search for hashtags, tags, categories, title, description
    // Hashtags: #tag, tags: comma/space separated, category, title, description
    let query = supabase
      .from('videos')
      .select(`*, profiles:profiles!videos_user_id_fkey(username, avatar_url)`)
      .order('created_at', { ascending: false });

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
    setLoading(false);
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      // Filter by category if not "All"
      if (activeCategory !== "All") {
        query = query.eq('category', activeCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching videos:', error);
        return;
      }

      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
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
            <Button type="submit" variant="neon" size="icon" aria-label="Go">
              <SearchIcon size={18} />
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
        ) : (searchResults !== null ? (
          searchResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found</p>
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
                    <img 
                      src={video.thumbnail_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop"}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
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
            <p className="text-muted-foreground">No videos found for this category</p>
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
                  <img 
                    src={video.thumbnail_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop"}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Video Duration */}
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      {formatDuration(video.duration)}
                    </Badge>
                  </div>
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xl">▶</span>
                    </div>
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
        )}
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