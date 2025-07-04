import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/BottomNavigation";

const Trending = () => {
  // TODO: Replace with real API call to fetch trending videos from backend
  // Each video should have a thumbnail_url (first frame), and optionally a cover image
  const trendingVideos = [];

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
        <div className="space-y-4">
          {trendingVideos.map((video, index) => (
            <Card 
              key={video.id} 
              className="flex items-center space-x-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => {
                console.log("Trending video clicked:", video.title);
                // Navigate to video player
              }}
            >
              <div className="flex-shrink-0">
                <Badge variant="secondary" className="text-xs font-bold">
                  {video.trending}
                </Badge>
              </div>
              
              <div className="relative w-16 h-20 rounded-lg overflow-hidden">
                <img 
                  src={video.thumbnail_url || video.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop"} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <Badge variant="secondary" className="absolute bottom-1 right-1 text-xs bg-black/70 text-white">
                  {video.duration}
                </Badge>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">{video.creator}</span>
                  <span>{video.views} views</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Trending;