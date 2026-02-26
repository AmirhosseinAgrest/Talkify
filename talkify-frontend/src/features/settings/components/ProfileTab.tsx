// src/features/settings/components/ProfileTab.tsx

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { useAuthStore } from '@/store/useAuthStore';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

const profileSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    bio: z.string().max(150, 'Bio must not exceed 150 characters').optional(),
    phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileTab() {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: user?.username || '',
            bio: user?.bio || '',
            phone: user?.phone || '',
        },
    });

    const avatarUrl = user?.avatar ? `${API_URL}${user.avatar}` : undefined;

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await userService.updateAvatar(file);
            setUser(response.data);
            toast.success('Avatar updated');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error uploading avatar');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!user?.avatar) return;

        setIsUploading(true);
        try {
            const response = await userService.deleteAvatar();
            setUser(response.data);
            toast.success('Avatar deleted');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error deleting avatar');
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        setIsSaving(true);
        try {
            const response = await userService.updateProfile(data);
            setUser(response.data);
            toast.success('Profile updated');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error updating profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="text-2xl">
                            {user?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                    )}

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                        <Camera className="h-4 w-4" />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                </div>

                {user?.avatar && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteAvatar}
                        disabled={isUploading}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Avatar
                    </Button>
                )}

                {user?.isVerified && (
                    <div className="flex items-center gap-2 text-sm text-blue-500">
                        <VerifiedBadge size="1.5em" />
                        Verified Account
                    </div>
                )}
            </div>

            <Separator />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" {...register('username')} />
                    {errors.username && (
                        <p className="text-sm text-destructive">{errors.username.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        placeholder="A few words about yourself..."
                        rows={3}
                        {...register('bio')}
                    />
                    {errors.bio && (
                        <p className="text-sm text-destructive">{errors.bio.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="09xxxxxxxxx" {...register('phone')} />
                </div>

                <Button type="submit" className="w-full" disabled={!isDirty || isSaving}>
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </form>

            <Separator />

            <div className="space-y-2">
                <h4 className="text-sm font-medium">Account Information</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                        Joined:{' '}
                        {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : '-'}
                    </p>
                    <p>
                        Role:{' '}
                        {user?.role === 'super_admin'
                            ? 'Super Admin'
                            : user?.role === 'admin'
                                ? 'Admin'
                                : 'User'}
                    </p>
                </div>
            </div>
        </div>
    );
}