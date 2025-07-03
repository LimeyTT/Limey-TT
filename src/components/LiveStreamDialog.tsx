import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Video, VideoOff, Mic, MicOff, Settings } from "lucide-react";

const LiveStreamDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setHasPermissions(true);
      toast({
        title: "Permissions Granted! 🎥",
        description: "Camera and microphone access enabled"
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Permission Denied",
        description: "Camera and microphone access is required for live streaming",
        variant: "destructive"
      });
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setHasPermissions(false);
    setIsLive(false);
  };

  const startLiveStream = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to start live streaming"
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your live stream"
      });
      return;
    }

    try {
      // Create live stream record in database
      const { data, error } = await supabase
        .from('live_streams')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          is_active: true,
          viewer_count: 0
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setIsLive(true);
      toast({
        title: "Live Stream Started! 🔴",
        description: "You're now broadcasting live on Limey"
      });

      // In a real implementation, you'd integrate with a streaming service
      // like Agora, LiveKit, or WebRTC for actual live streaming
      
    } catch (error) {
      console.error('Error starting live stream:', error);
      toast({
        title: "Error",
        description: "Failed to start live stream. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopLiveStream = async () => {
    try {
      // Update live stream to inactive
      const { error } = await supabase
        .from('live_streams')
        .update({ is_active: false })
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error stopping live stream:', error);
      }

      stopStream();
      setIsOpen(false);
      setTitle("");
      setDescription("");
      
      toast({
        title: "Stream Ended",
        description: "Your live stream has been stopped"
      });
    } catch (error) {
      console.error('Error stopping live stream:', error);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="neon" size="sm">Go Live</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>🔴</span>
            <span>Start Live Stream</span>
          </DialogTitle>
          <DialogDescription>
            Share your moment live with the Limey community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!hasPermissions ? (
            <div className="text-center space-y-4">
              <div className="bg-muted rounded-lg p-6">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Camera and microphone access required
                </p>
              </div>
              <Button onClick={requestPermissions} className="w-full">
                Grant Permissions
              </Button>
            </div>
          ) : !isLive ? (
            <>
              {/* Video preview */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Controls overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleVideo}
                    className="bg-black/50 border-white/20"
                  >
                    {videoEnabled ? (
                      <Video className="h-4 w-4 text-white" />
                    ) : (
                      <VideoOff className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAudio}
                    className="bg-black/50 border-white/20"
                  >
                    {audioEnabled ? (
                      <Mic className="h-4 w-4 text-white" />
                    ) : (
                      <MicOff className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Stream details */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title">Stream Title</Label>
                  <Input
                    id="title"
                    placeholder="What's happening?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell viewers what your stream is about..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={stopStream}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={startLiveStream} 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={!title.trim()}
                >
                  Start Live Stream
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <Badge className="bg-red-600 text-white animate-pulse px-4 py-2">
                🔴 LIVE
              </Badge>
              <p className="text-lg font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">
                You're broadcasting live!
              </p>
              
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleVideo}
                >
                  {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAudio}
                >
                  {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </div>

              <Button 
                onClick={stopLiveStream} 
                variant="destructive"
                className="w-full"
              >
                End Stream
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveStreamDialog;