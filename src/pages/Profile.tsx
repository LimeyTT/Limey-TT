import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import BottomNavigation from "@/components/BottomNavigation";
import { Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [isVideoPopupOpen, setIsVideoPopupOpen] = useState(false);
  const [startY, setStartY] = useState(0);

  // User videos state
  const [userVideos, setUserVideos] = useState<any[]>([]);


  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserVideos();
    }
  }, [user]);

  // Fetch user videos from Supabase Storage (limey-media/<user.id>)
  const fetchUserVideos = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase.storage.from('limey-media').list(user.id, { limit: 100 });
      if (error) {
        console.error('Error fetching user videos:', error);
        setUserVideos([]);
        return;
      }
      const videos = data
        .filter((file) => file.name.match(/\.(mp4|mov|webm|ogg)$/i))
        .map((file) => {
          const { publicUrl } = supabase.storage.from('limey-media').getPublicUrl(`${user.id}/${file.name}`).data;
          return {
            id: file.id || file.name,
            title: file.name,
            video_url: publicUrl,
            thumbnail_url: '',
            created_at: file.created_at || '',
          };
        });
      setUserVideos(videos);
    } catch (err) {
      console.error('User videos fetch error:', err);
      setUserVideos([]);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle video selection
  const handleVideoClick = (index: number) => {
    setSelectedVideoIndex(index);
    setIsVideoPopupOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Handle popup close
  const handleCloseVideo = () => {
    setIsVideoPopupOpen(false);
    setSelectedVideoIndex(null);
    document.body.style.overflow = 'auto';
  };

  // Handle next video
  const handleNextVideo = () => {
    if (selectedVideoIndex === null || !userVideos) return;
    const nextIndex = selectedVideoIndex + 1;
    if (nextIndex < userVideos.length) {
      setSelectedVideoIndex(nextIndex);
    }
  };

  // Handle previous video
  const handlePreviousVideo = () => {
    if (selectedVideoIndex === null || !userVideos) return;
    const prevIndex = selectedVideoIndex - 1;
    if (prevIndex >= 0) {
      setSelectedVideoIndex(prevIndex);
    } else {
      // Refresh the page when swiping down on first video
      window.location.reload();
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Profile</h1>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/settings')}
            >
              <SettingsIcon className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>Logout</Button>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-white">
              {profile?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          
          {/* Username */}
          <h2 className="text-2xl font-bold text-foreground mb-1">
            @{profile?.username || 'user'}
          </h2>
          
          {/* Display name */}
          <p className="text-muted-foreground mb-4">
            {profile?.display_name || user?.email}
          </p>
          
          {/* Stats */}
          <div className="flex items-center space-x-6 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{profile?.following_count || 0}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{profile?.follower_count || 0}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{profile?.likes_received || 0}</div>
              <div className="text-xs text-muted-foreground">Likes</div>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              {profile.bio}
            </p>
          )}

          {/* Creator Badge */}
          {profile?.is_creator && (
            <Badge className="mb-4">
              🎬 Creator
            </Badge>
          )}

          {/* Trini Credits */}
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-sm text-muted-foreground">TriniCredits:</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              💰 {profile?.trini_credits || 0}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline">Edit Profile</Button>
            <Button variant="neon">Share Profile</Button>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-4">
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="likes">Liked</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos" className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              {userVideos.map((video, index) => (
                <Card
                  key={video.id}
                  className="relative aspect-[9/16] cursor-pointer group"
                  onClick={() => handleVideoClick(index)}
                >
                  <img
                    src={video.thumbnail_url || video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-full object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                      {video.duration || "--:--"}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <div className="text-white text-xs">
                      👁️ {video.view_count || 0}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {userVideos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No videos yet</p>
                <Button variant="neon">Create Your First Video</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="likes" className="mt-4">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Your liked videos will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-4">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Your saved videos will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Video Popup */}
      {isVideoPopupOpen && selectedVideoIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black touch-none"
          onTouchStart={(e) => {
            const touch = e.touches[0];
            setStartY(touch.clientY);
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            const deltaY = touch.clientY - startY;
            
            if (Math.abs(deltaY) > 100) {
              if (deltaY > 0 && selectedVideoIndex === 0) {
                handleCloseVideo();
                window.location.reload();
              } else if (deltaY > 0) {
                handlePreviousVideo();
              } else {
                handleNextVideo();
              }
              setStartY(touch.clientY);
            }
          }}
        >
          <div className="relative h-full w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white"
              onClick={handleCloseVideo}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
            
            <video
              key={userVideos[selectedVideoIndex]?.id}
              src={userVideos[selectedVideoIndex]?.video_url}
              poster={userVideos[selectedVideoIndex]?.thumbnail_url || userVideos[selectedVideoIndex]?.thumbnail || "/placeholder.svg"}
              className="h-full w-full object-cover"
              autoPlay
              playsInline
              loop
              controls
            />
            
            <div className="absolute bottom-20 left-4 right-4 text-white">
              <h3 className="text-lg font-bold mb-2">{userVideos[selectedVideoIndex].title}</h3>
              <div className="flex items-center space-x-2">
                <span>{userVideos[selectedVideoIndex].views} views</span>
                <span>•</span>
                <span>{userVideos[selectedVideoIndex].likes} likes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Profile;