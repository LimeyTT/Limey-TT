import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface VideoData {
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
  category?: string;
  tags?: string[];
  created_at: string;
  is_trending?: boolean;
  is_featured?: boolean;
}

export const useVideoData = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchVideos = async (category?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_user_id_fkey(username, display_name)
        `)
        .order('created_at', { ascending: false });

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const formattedVideos = data?.map(video => ({
        ...video,
        creator: video.profiles?.username || video.profiles?.display_name || 'Unknown'
      })) || [];

      setVideos(formattedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error",
        description: "Failed to load videos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_user_id_fkey(username, display_name)
        `)
        .eq('is_trending', true)
        .order('view_count', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      const formattedVideos = data?.map(video => ({
        ...video,
        creator: video.profiles?.username || video.profiles?.display_name || 'Unknown'
      })) || [];

      setVideos(formattedVideos);
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      toast({
        title: "Error",
        description: "Failed to load trending videos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVideos = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_user_id_fkey(username, display_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedVideos = data?.map(video => ({
        ...video,
        creator: video.profiles?.username || video.profiles?.display_name || 'Unknown'
      })) || [];

      setVideos(formattedVideos);
    } catch (error) {
      console.error('Error fetching user videos:', error);
      toast({
        title: "Error",
        description: "Failed to load user videos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async (
    file: File,
    title: string,
    description?: string,
    category?: string,
    tags?: string[]
  ) => {
    if (!user) {
      throw new Error('User must be logged in to upload videos');
    }

    try {
      // Upload video file
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('video-uploads')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('video-uploads')
        .getPublicUrl(fileName);

      // Generate thumbnail URL (placeholder for now)
      const thumbnailUrl = `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop`;

      // Create video record
      const { data, error } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description?.trim(),
          video_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          category: category || 'General',
          tags: tags || [],
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          is_trending: false,
          is_featured: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Increment user video count
      await supabase.rpc('increment_video_count', { user_id: user.id });

      toast({
        title: "Upload Successful! 🎉",
        description: "Your video has been uploaded to Limey"
      });

      return data;
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    loading,
    fetchVideos,
    fetchTrendingVideos,
    fetchUserVideos,
    uploadVideo,
    refetch: fetchVideos
  };
};