"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase';
import { Camera, Loader2, User as UserIcon } from 'lucide-react';

interface ProfilePictureUploadProps {
  userId: string;
  url?: string | null;
  onUpload: (url: string) => void;
  size?: number;
}

export default function ProfilePictureUpload({ userId, url, onUpload, size = 150 }: ProfilePictureUploadProps) {
  const [supabase] = useState(() => createClient());
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url || null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) setAvatarUrl(url);
  }, [url]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setAvatarUrl(data.publicUrl);
      onUpload(data.publicUrl);
    } catch (error) {
      alert('Error uploading avatar!');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg"
        style={{ width: size, height: size }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
            <UserIcon size={size * 0.5} />
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>
      
      <div className="relative">
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        <label 
          htmlFor="avatar-upload" 
          className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors cursor-pointer text-sm font-medium shadow-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Camera className="w-4 h-4" />
          <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
        </label>
      </div>
    </div>
  );
}