import { useEffect, useState } from 'react';
import { message } from 'antd';
import { getDownloadUrl, getUploadUrl } from '../api/backend';

function randomKeyPart(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export const useAvatarUpload = (
  userId: string | undefined,
  initialAvatar?: string,
) => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialAvatar);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setAvatarUrl(initialAvatar);
  }, [initialAvatar]);

  const uploadProps = {
    name: 'avatar',
    showUploadList: false,
    accept: 'image/*',
    beforeUpload: (file: File) => {
      if (!userId) {
        message.error('Сначала войдите в систему');
        return false;
      }

      const isImage = file.type.startsWith('image/');
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        message.error('Можно загружать только изображения!');
        return false;
      }

      if (!isLt2M) {
        message.error('Изображение должно быть меньше 2MB!');
        return false;
      }

      void (async () => {
        setUploading(true);
        try {
          const ext = file.name.includes('.')
            ? file.name.split('.').pop()!
            : 'png';
          const key = `avatars/${userId}/${randomKeyPart()}.${ext}`;
          const contentType = file.type || 'image/jpeg';
          const putUrl = await getUploadUrl({
            userId,
            key,
            contentType,
          });
          const putRes = await fetch(putUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': contentType },
          });
          if (!putRes.ok) {
            throw new Error(`Upload failed: ${putRes.status}`);
          }
          const url = await getDownloadUrl({ userId, key });
          setAvatarUrl(url);
          message.success('Аватар загружен');
        } catch {
          message.error('Не удалось загрузить аватар');
        } finally {
          setUploading(false);
        }
      })();

      return false;
    },
  };

  return { avatarUrl, setAvatarUrl, uploadProps, uploading };
};
