import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import BottomNavigation from "@/components/BottomNavigation";
import VideoPlayer from "@/components/VideoPlayer";
import { useVideoData } from "@/hooks/useVideoData";
import { Search, Upload, LogOut } from "lucide-react";

const Feed = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { videos, loading, fetchVideos } = useVideoData();
  
  const categories = [
    "All", "Soca", "Dancehall", "Carnival", "Comedy", "Dance", "Music", "Local News"
  ];

  useEffect(() => {
    fetchVideos(activeCategory);
  }, [activeCategory, fetchVideos]);

  const handleVideoEnd = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (direction === 'down' && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Limey</h1>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/upload')}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
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

      {/* Video Feed - Full Screen Swipe Interface */}
      {videos.length > 0 ? (
        <div className="relative h-screen">
          <VideoPlayer
            video={videos[currentVideoIndex]}
            isActive={true}
            onVideoEnd={handleVideoEnd}
          />
          
          {/* Swipe handlers */}
          <div 
            className="absolute top-0 left-0 w-full h-1/2 z-10"
            onClick={() => handleSwipe('down')}
          />
          <div 
            className="absolute bottom-0 left-0 w-full h-1/2 z-10"
            onClick={() => handleSwipe('up')}
          />
        </div>
      ) : (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">No videos available in this category</p>
          <Button 
            variant="neon" 
            className="mt-4"
            onClick={() => navigate('/upload')}
          >
            Upload First Video
          </Button>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Feed;