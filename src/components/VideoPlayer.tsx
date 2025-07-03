import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  video: {
    id: string;
    title: string;
    description?: string;
    video_url: string;
    thumbnail_url?: string;
    user_id: string;
    creator?: string;
    like_count?: number;
    comment_count?: number;
    view_count?: number;
    isLive?: boolean;
  };
  isActive?: boolean;
  onVideoEnd?: () => void;
}

const VideoPlayer = ({ video, isActive = false, onVideoEnd }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.like_count || 0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      // Update view count
      handleViewCount();
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleViewCount = async () => {
    if (!user) return;
    
    try {
      // Increment view count in database
      const { error } = await supabase
        .from('videos')
        .update({ 
          view_count: (video.view_count || 0) + 1 
        })
        .eq('id', video.id);

      if (error) {
        console.error('Error updating view count:', error);
      }
    } catch (err) {
      console.error('Error updating view count:', err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to like videos"
      });
      return;
    }

    try {
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from('video_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', video.id);

        if (!error) {
          setLiked(false);
          setLikeCount(prev => prev - 1);
          // Call decrement function
          await supabase.rpc('decrement_like_count', { video_id_input: video.id });
        }
      } else {
        // Like
        const { error } = await supabase
          .from('video_likes')
          .insert({
            user_id: user.id,
            video_id: video.id
          });

        if (!error) {
          setLiked(true);
          setLikeCount(prev => prev + 1);
          // Call increment function
          await supabase.rpc('increment_like_count', { video_id_input: video.id });
        }
      }
    } catch (err) {
      console.error('Error handling like:', err);
    }
  };

  const handleComment = () => {
    // Open comments modal/sheet
    toast({
      title: "Comments",
      description: "Comments functionality coming soon!"
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied!",
          description: "Video link copied to clipboard"
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={video.video_url}
        poster={video.thumbnail_url}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        onEnded={onVideoEnd}
        onClick={togglePlay}
      />
      
      {/* Video overlay controls */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top overlay - video info */}
        <div className="absolute top-4 left-4 right-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {video.isLive && (
                <Badge className="bg-red-600 text-white animate-pulse">
                  🔴 LIVE
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>

        {/* Bottom overlay - video actions */}
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <div className="flex flex-col space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="flex flex-col items-center p-2 bg-black/20 backdrop-blur-sm rounded-full"
            >
              <Heart 
                className={`h-6 w-6 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
              />
              <span className="text-xs text-white mt-1">{likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="flex flex-col items-center p-2 bg-black/20 backdrop-blur-sm rounded-full"
            >
              <MessageCircle className="h-6 w-6 text-white" />
              <span className="text-xs text-white mt-1">{video.comment_count || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex flex-col items-center p-2 bg-black/20 backdrop-blur-sm rounded-full"
            >
              <Share className="h-6 w-6 text-white" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBookmarked(!bookmarked)}
              className="flex flex-col items-center p-2 bg-black/20 backdrop-blur-sm rounded-full"
            >
              <Bookmark 
                className={`h-6 w-6 ${bookmarked ? 'fill-white text-white' : 'text-white'}`} 
              />
            </Button>
          </div>
        </div>

        {/* Bottom left - creator info */}
        <div className="absolute bottom-4 left-4 pointer-events-auto max-w-xs">
          <div className="text-white">
            <p className="font-semibold text-sm mb-1">@{video.creator}</p>
            <p className="text-sm opacity-90 line-clamp-2">{video.title}</p>
            {video.description && (
              <p className="text-xs opacity-75 mt-1 line-clamp-2">{video.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;