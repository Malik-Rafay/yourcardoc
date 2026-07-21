import { useState, useRef } from "react";
import { Mic, Square, Volume2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioRecorderProps {
  onAudioRecorded: (base64Audio: string | null) => void;
}

export function AudioRecorder({ onAudioRecorded }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert Blob to Base64 to send to backend AI
        const reader = new FileReader();
        reader.onloadend = () => {
          onAudioRecorded(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop mic track
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const clearAudio = () => {
    setAudioUrl(null);
    onAudioRecorded(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Record Engine/Car Noise</label>

      {!audioUrl ? (
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button type="button" variant="outline" onClick={startRecording} className="gap-2">
              <Mic className="h-4 w-4 text-red-500" /> Record Car Noise
            </Button>
          ) : (
            <Button type="button" variant="destructive" onClick={stopRecording} className="gap-2 animate-pulse">
              <Square className="h-4 w-4" /> Stop Recording
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 p-2 bg-muted/20">
          <Volume2 className="h-4 w-4 text-primary" />
          <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
          <Button type="button" size="icon" variant="ghost" onClick={clearAudio} className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
}