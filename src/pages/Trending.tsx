import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/BottomNavigation";

const Trending = () => {
  const [trendingVideos, setTrendingVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      setError(null);
      // Fetch top 100 videos ordered by like_count and view_count (likes first, then views)
      const { data, error } = await supabase
        .from("videos")
        .select("id, title, duration, thumbnail_url, like_count, view_count, profiles(username), created_at")
        .order("like_count", { ascending: false })
        .order("view_count", { ascending: false })
        .limit(100);
      if (error) {
        setError("Failed to fetch trending videos");
        setTrendingVideos([]);
      } else {
        setTrendingVideos(data || []);
      }
      setLoading(false);
    };
    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🔥 Trending</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">Filter</Button>
          </div>
        </div>
      </div>

      {/* Trending Videos */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading trending videos...</div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">{error}</div>
        ) : (
          <div className="space-y-4">
            {trendingVideos.map((video, index) => (
              <Card 
                key={video.id} 
                className="flex items-center space-x-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => {
                  // TODO: Navigate to video player for this video
                  console.log("Trending video clicked:", video.title);
                }}
              >
                <div className="flex-shrink-0">
                  <Badge variant="secondary" className="text-xs font-bold">
                    #{index + 1}
                  </Badge>
                </div>
                <div className="relative w-16 h-20 rounded-lg overflow-hidden">
                  <img 
                    src={video.thumbnail_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop"} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge variant="secondary" className="absolute bottom-1 right-1 text-xs bg-black/70 text-white">
                    {video.duration ? video.duration : "--:--"}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">@{video.profiles?.username || "unknown"}</span>
                    <span>{video.view_count || 0} views</span>
                    <span className="ml-2">{video.like_count || 0} likes</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Trending;