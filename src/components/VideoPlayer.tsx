import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  user_id: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

const VideoPlayer = ({ video, onClose }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user has liked this video
    const checkLikeStatus = async () => {
      if (user) {
        const { data } = await supabase
          .from('video_likes')
          .select('id')
          .eq('video_id', video.id)
          .eq('user_id', user.id)
          .single();
        
        setIsLiked(!!data);
      }
    };

    checkLikeStatus();
  }, [video.id, user]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', video.id)
          .eq('user_id', user.id);
        setIsLiked(false);
      } else {
        // Like
        await supabase
          .from('video_likes')
          .insert({
            video_id: video.id,
            user_id: user.id
          });
        setIsLiked(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.href
      });
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Video link copied to clipboard"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-md mx-auto">
        {/* Video */}
        <video
          ref={videoRef}
          src={video.video_url}
          poster={video.thumbnail_url}
          className="w-full h-full object-cover"
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {/* Overlay Controls */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Top Bar */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white bg-black/50 hover:bg-black/70"
            >
              ✕
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white bg-black/50 hover:bg-black/70"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
          </div>

          {/* Center Play Button */}
          {!isPlaying && (
            <div className="flex items-center justify-center">
              <Button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white"
              >
                <Play size={24} className="text-white ml-1" />
              </Button>
            </div>
          )}

          {/* Bottom Info & Actions */}
          <div className="flex justify-between items-end">
            <div className="flex-1 mr-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2">
                  <span className="text-white text-sm font-bold">
                    {video.profiles?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-white font-semibold">
                  @{video.profiles?.username || 'unknown'}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-1 line-clamp-2">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-white/80 text-sm line-clamp-2">
                  {video.description}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="flex flex-col items-center text-white bg-black/50 hover:bg-black/70 p-2"
              >
                <Heart size={24} className={isLiked ? "fill-red-500 text-red-500" : ""} />
                <span className="text-xs">{video.like_count || 0}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center text-white bg-black/50 hover:bg-black/70 p-2"
              >
                <MessageCircle size={24} />
                <span className="text-xs">{video.comment_count || 0}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex flex-col items-center text-white bg-black/50 hover:bg-black/70 p-2"
              >
                <Share size={24} />
                <span className="text-xs">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;