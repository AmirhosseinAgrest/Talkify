// src/features/chat/components/FileUploadButton.tsx

import { useRef } from 'react';
import { Paperclip, Image, Film, Mic } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileUploadButton({ onFileSelect, disabled }: FileUploadButtonProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
      <input
        type="file"
        ref={audioInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        className="hidden"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={disabled}>
            <Paperclip className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
            <Image className="h-4 w-4 mr-2" />
            Image
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => videoInputRef.current?.click()}>
            <Film className="h-4 w-4 mr-2" />
            Video
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => audioInputRef.current?.click()}>
            <Mic className="h-4 w-4 mr-2" />
            Audio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}