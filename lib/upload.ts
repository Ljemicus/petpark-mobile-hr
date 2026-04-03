import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

async function fetchAsBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Neuspjelo čitanje datoteke.'));
        return;
      }

      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Neuspjela konverzija datoteke.'));
        return;
      }

      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Neuspjelo učitavanje datoteke.'));
    reader.readAsDataURL(blob);
  });
}

export async function uploadToSupabaseStorage(options: {
  bucket: string;
  path: string;
  uri: string;
  contentType?: string;
}) {
  const base64 = await fetchAsBase64(options.uri);

  const { error } = await supabase.storage
    .from(options.bucket)
    .upload(options.path, decode(base64), {
      contentType: options.contentType ?? 'application/octet-stream',
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(options.bucket).getPublicUrl(options.path);
  return data.publicUrl;
}

/**
 * Safe wrapper: returns the public URL on success, or null if the upload
 * fails for any reason (missing bucket, network error, permissions, etc.).
 */
export async function safeUpload(
  options: Parameters<typeof uploadToSupabaseStorage>[0],
): Promise<string | null> {
  try {
    return await uploadToSupabaseStorage(options);
  } catch {
    return null;
  }
}
