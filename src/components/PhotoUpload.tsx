import { useState } from "react";
import { Camera, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploadProps {
  onImageChange: (base64: string | null) => void;
}

export function PhotoUpload({ onImageChange }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 for easy passing to serverless functions
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageChange(result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreview(null);
    onImageChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Add Photo of Issue (Engine, Leak, Part)</label>
      
      {!preview ? (
        <label className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/20 hover:bg-muted/40 transition">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Camera className="h-6 w-6 text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Tap to take photo or upload image</p>
          </div>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="relative h-32 w-32 rounded-lg overflow-hidden border border-border">
          <img src={preview} alt="Part issue" className="h-full w-full object-cover" />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}