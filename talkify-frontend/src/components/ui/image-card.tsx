import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ImageCardProps {
  imageUrl: string;
  username: string;
  userAvatar?: string;
  caption?: string;
  likes?: number;
  comments?: number;
  onLike?: () => void;
  className?: string;
}

export const ImageCard = ({
  imageUrl,
  username,
  userAvatar,
  caption,
  likes = 0,
  comments = 0,
  onLike,
  className,
}: ImageCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  return (
    <div className={cn("bg-card rounded-lg overflow-hidden border border-border", className)}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={caption || `Photo by ${username}`}
          className="w-full h-full object-cover hover:scale-105 transition-smooth"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={cn(
                "transition-smooth hover:scale-110 active:scale-95",
                isLiked && "text-destructive"
              )}
            >
              <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
            </button>
            <button className="transition-smooth hover:scale-110 active:scale-95">
              <MessageCircle className="w-6 h-6" />
            </button>
          </div>
          <button className="transition-smooth hover:scale-110 active:scale-95">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        <p className="font-semibold text-sm mb-2">{likes + (isLiked ? 1 : 0)} likes</p>

        {caption && (
          <p className="text-sm">
            <span className="font-semibold mr-2">{username}</span>
            {caption}
          </p>
        )}

        {comments > 0 && (
          <button className="text-sm text-muted-foreground mt-2 hover:text-foreground transition-base">
            View all {comments} comments
          </button>
        )}
      </div>
    </div>
  );
};