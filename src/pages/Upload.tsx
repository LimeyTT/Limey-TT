import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for videos/images
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      
      // Auto-generate title from filename
      if (!title) {
        const name = selectedFile.name.split('.')[0];
        setTitle(name.charAt(0).toUpperCase() + name.slice(1));
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a file and add a title",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('limey-db')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('limey-db')
        .getPublicUrl(fileName);

      console.log("File uploaded successfully:", publicUrl);
      
      toast({
        title: "Upload Successful! 🎉",
        description: "Your content has been uploaded to Limey"
      });

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setPreview(null);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">📱 Upload</h1>
          <Button variant="ghost" size="sm">Drafts</Button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* File Upload Area */}
        <Card className="p-8 border-2 border-dashed border-border hover:border-primary transition-colors">
          <div className="text-center">
            {preview ? (
              <div className="mb-4">
                {file?.type.startsWith('video/') ? (
                  <video 
                    src={preview} 
                    className="max-w-full h-64 mx-auto rounded-lg"
                    controls
                  />
                ) : (
                  <img 
                    src={preview} 
                    alt="Preview"
                    className="max-w-full h-64 mx-auto rounded-lg object-cover"
                  />
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {file?.name} ({(file?.size || 0 / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📁</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Upload Your Content</h3>
                <p className="text-muted-foreground mb-4">
                  Select videos, images, or audio files to share with the Limey community
                </p>
              </div>
            )}
            
            <Input
              type="file"
              accept="video/*,image/*,audio/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="neon" asChild className="cursor-pointer">
                <span>{file ? "Change File" : "Select File"}</span>
              </Button>
            </label>
          </div>
        </Card>

        {/* Upload Form */}
        {file && (
          <Card className="mt-6 p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Title *
                </label>
                <Input
                  placeholder="Give your content a catchy title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {title.length}/100 characters
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Description
                </label>
                <Textarea
                  placeholder="Tell viewers about your content..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Content Type Badges */}
              <div className="flex flex-wrap gap-2">
                {file.type.startsWith('video/') && (
                  <Badge variant="secondary">🎬 Video</Badge>
                )}
                {file.type.startsWith('image/') && (
                  <Badge variant="secondary">📷 Image</Badge>
                )}
                {file.type.startsWith('audio/') && (
                  <Badge variant="secondary">🎵 Audio</Badge>
                )}
                <Badge variant="outline">Trinidad & Tobago</Badge>
              </div>

              {/* Upload Button */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setTitle("");
                    setDescription("");
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="neon" 
                  onClick={handleUpload}
                  disabled={uploading || !title.trim()}
                  className="flex-1"
                >
                  {uploading ? "Uploading..." : "Share to Limey 🚀"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Upload Tips */}
        <Card className="mt-6 p-4 bg-muted/50">
          <h4 className="font-medium text-foreground mb-2">📝 Upload Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Keep videos under 60 seconds for best engagement</li>
            <li>• Use good lighting and clear audio</li>
            <li>• Add hashtags in your description to reach more viewers</li>
            <li>• Upload during peak hours (6-9 PM) for maximum views</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Upload;