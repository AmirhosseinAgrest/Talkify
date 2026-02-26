// src/features/chat/components/SharedMediaSection.tsx

import { useState, useEffect } from 'react';
import { Image, Film, Mic, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaViewer } from '@/components/common/MediaViewer';
import { chatService } from '@/services/chat.service';
import type { Message } from '@/types';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

interface SharedMediaSectionProps {
  chatId: string;
}

export function SharedMediaSection({ chatId }: SharedMediaSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<Message | null>(null);

  useEffect(() => {
    loadMessages();
  }, [chatId]);

  const loadMessages = async () => {
    try {
      const response = await chatService.getMessages(chatId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const images = messages.filter((m) => m.type === 'image');
  const videos = messages.filter((m) => m.type === 'video');
  const audios = messages.filter((m) => m.type === 'audio');

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (images.length === 0 && videos.length === 0 && audios.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>No shared media available</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="font-medium mb-4">Shared Media</h3>

      <Tabs defaultValue="images">
        <TabsList className="w-full">
          <TabsTrigger value="images" className="flex-1 gap-1">
            <Image className="h-4 w-4" />
            Images ({images.length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex-1 gap-1">
            <Film className="h-4 w-4" />
            Videos ({videos.length})
          </TabsTrigger>
          <TabsTrigger value="audios" className="flex-1 gap-1">
            <Mic className="h-4 w-4" />
            Audio ({audios.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="mt-4">
          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {images.map((msg) => (
                <img
                  key={msg.id}
                  src={`${API_URL}${msg.fileUrl}`}
                  alt=""
                  className="aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedMedia(msg)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No images available</p>
          )}
        </TabsContent>

        <TabsContent value="videos" className="mt-4">
          {videos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {videos.map((msg) => (
                <div
                  key={msg.id}
                  className="aspect-video bg-muted rounded-lg relative cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedMedia(msg)}
                >
                  <video
                    src={`${API_URL}${msg.fileUrl}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <Film className="h-8 w-8 text-white" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No videos available</p>
          )}
        </TabsContent>

        <TabsContent value="audios" className="mt-4">
          {audios.length > 0 ? (
            <div className="space-y-2">
              {audios.map((msg) => (
                <audio
                  key={msg.id}
                  src={`${API_URL}${msg.fileUrl}`}
                  controls
                  className="w-full"
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No audio available</p>
          )}
        </TabsContent>
      </Tabs>

      {selectedMedia && (
        <MediaViewer
          open={!!selectedMedia}
          onOpenChange={() => setSelectedMedia(null)}
          type={selectedMedia.type as 'image' | 'video' | 'audio'}
          url={`${API_URL}${selectedMedia.fileUrl}`}
          fileName={selectedMedia.fileName || undefined}
        />
      )}
    </div>
  );
}