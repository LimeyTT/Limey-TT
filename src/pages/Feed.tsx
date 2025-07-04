import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import VideoPlayer from "@/components/VideoPlayer";

const Feed = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const categories = [
    "All", "Soca", "Dancehall", "Carnival", "Comedy", "Dance", "Music", "Local News"
  ];

  useEffect(() => {
    fetchVideos();
  }, [activeCategory]);

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
            <Button variant="ghost" size="sm">Search</Button>
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

      {/* Video Grid */}
      <div className="p-4 pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : videos.length === 0 ? (
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
          videos={videos}
          currentIndex={currentVideoIndex}
          onClose={() => setSelectedVideo(null)}
          onNext={() => {
            const nextIndex = currentVideoIndex + 1;
            if (nextIndex < videos.length) {
              setCurrentVideoIndex(nextIndex);
              setSelectedVideo(videos[nextIndex]);
            }
          }}
          onPrevious={() => {
            const prevIndex = currentVideoIndex - 1;
            if (prevIndex >= 0) {
              setCurrentVideoIndex(prevIndex);
              setSelectedVideo(videos[prevIndex]);
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