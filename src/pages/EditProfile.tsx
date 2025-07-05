import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import BottomNavigation from "@/components/BottomNavigation";

const EditProfile = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch profile info on mount
  // (You may want to useEffect here to fetch and set state)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;
    const { error } = await supabase.storage.from('limeytt-uploads').upload(fileName, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('limeytt-uploads').getPublicUrl(fileName);
      setAvatarUrl(data.publicUrl);
      toast({ title: "Profile photo updated!" });
    } else {
      toast({ title: "Failed to upload photo", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    const fileName = `${user.id}/avatar.jpg`;
    await supabase.storage.from('limeytt-uploads').remove([fileName]);
    setAvatarUrl(null);
    toast({ title: "Profile photo removed" });
  };

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      username,
      display_name: displayName,
      bio,
      avatar_url: avatarUrl
    }).eq('user_id', user.id);
    if (!error) {
      toast({ title: "Profile updated!" });
      navigate('/profile');
    } else {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
      <h1 className="text-2xl font-bold text-primary">Edit Profile</h1>
      </div>
      <div className="p-4 max-w-lg mx-auto">
      <Card className="p-6 flex flex-col items-center">
        {/* Avatar */}
        <div className="relative mb-6">
        {avatarUrl ? (
          <img
          src={avatarUrl}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border-2 border-primary"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary">
          {user?.email?.charAt(0).toUpperCase()}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Edit profile photo"
        >
          <span role="img" aria-label="camera">📷</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        {avatarUrl && (
          <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          onClick={handleRemoveAvatar}
          >
          Remove
          </Button>
        )}
        </div>
        {/* Username */}
        <Input
        className="mb-4"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        />
        {/* Display Name */}
        <Input
        className="mb-4"
        placeholder="Display Name"
        value={displayName}
        onChange={e => setDisplayName(e.target.value)}
        />
        {/* Bio */}
        <Textarea
        className="mb-4"
        placeholder="Bio"
        value={bio}
        onChange={e => setBio(e.target.value)}
        maxLength={200}
        />
        <Button variant="neon" className="w-full" onClick={handleSave} disabled={uploading}>
        {uploading ? "Saving..." : "Save Changes"}
        </Button>
      </Card>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default EditProfile;
