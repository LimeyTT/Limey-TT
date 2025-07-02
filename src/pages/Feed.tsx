import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Feed = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  
  const categories = [
    "All", "Soca", "Dancehall", "Carnival", "Comedy", "Dance", "Music", "Local News"
  ];

  // Mock video data
  const mockVideos = [
    {
      id: 1,
      creator: "SocaKing_TT",
      title: "Carnival Prep 2024 🎭",
      views: "15.2K",
      duration: "0:45",
      thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop",
      isLive: false
    },
    {
      id: 2,
      creator: "TriniDancer",
      title: "Best Wining Tutorial",
      views: "23.1K",
      duration: "1:20",
      thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop",
      isLive: false
    },
    {
      id: 3,
      creator: "CarnivalQueen",
      title: "LIVE: Costume Reveal! 🔥",
      views: "1.8K",
      duration: "",
      thumbnail: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=600&fit=crop",
      isLive: true
    },
    {
      id: 4,
      creator: "LocalComedy",
      title: "Trini Life Be Like... 😂",
      views: "8.9K",
      duration: "0:30",
      thumbnail: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=600&fit=crop",
      isLive: false
    },
    {
      id: 5,
      creator: "SteelPanMaster",
      title: "Sweet Pan Vibes",
      views: "12.5K",
      duration: "2:15",
      thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop",
      isLive: false
    },
    {
      id: 6,
      creator: "TriniTech",
      title: "Local Business Tips",
      views: "5.3K",
      duration: "1:45",
      thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop",
      isLive: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Limey</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">Search</Button>
            <Button variant="outline" size="sm">Upload</Button>
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
      <div className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mockVideos.map((video) => (
            <Card key={video.id} className="video-card relative group cursor-pointer">
              <div className="relative aspect-[9/16] bg-muted rounded-lg overflow-hidden">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Video Duration or LIVE badge */}
                <div className="absolute bottom-2 right-2">
                  {video.isLive ? (
                    <Badge className="bg-red-600 text-white animate-pulse">
                      LIVE
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      {video.duration}
                    </Badge>
                  )}
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
                  <span className="creator-badge">{video.creator}</span>
                  <span>{video.views} views</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Button variant="ghost" size="sm">Home</Button>
          <Button variant="ghost" size="sm">Trending</Button>
          <Button variant="neon" size="sm" className="px-6">+</Button>
          <Button variant="ghost" size="sm">Live</Button>
          <Button variant="ghost" size="sm">Profile</Button>
        </div>
      </div>
    </div>
  );
};

export default Feed;