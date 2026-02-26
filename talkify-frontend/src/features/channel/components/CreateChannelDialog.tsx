// src/features/channel/components/CreateChannelDialog.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Radio, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateChannel } from '../hooks/useCreateChannel';

const createChannelSchema = z.object({
  name: z.string().min(2, 'Channel name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only English letters, numbers, and _ are allowed'),
  description: z
    .string()
    .max(200, 'Description must not exceed 200 characters')
    .optional(),
});

type CreateChannelFormData = z.infer<typeof createChannelSchema>;

export function CreateChannelDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createChannel, isPending } = useCreateChannel();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateChannelFormData>({
    resolver: zodResolver(createChannelSchema),
  });

  const onSubmit = (data: CreateChannelFormData) => {
    createChannel(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Radio className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name</Label>
            <Input
              id="name"
              placeholder="Example: Tech News"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Channel ID (Username)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                id="username"
                placeholder="tech_news"
                className="pl-8"
                {...register('username')}
              />
            </div>
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Write a short description about the channel..."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Channel'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}