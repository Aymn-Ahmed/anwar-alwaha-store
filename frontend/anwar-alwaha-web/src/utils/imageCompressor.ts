/**
 * Client-Side Image Compression Utility
 * Resizes and compresses images in the browser using HTML5 Canvas
 * to ensure high-resolution phone camera photos (6-12MB) upload
 * in ~150-250KB within seconds.
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/webp' | 'image/jpeg';
}

export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.82,
    mimeType = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('الملف المختار ليس صورة صالحة'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('تعذر معالجة محتوى الصورة'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Preserve aspect ratio while constraining to maxWidth & maxHeight
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Canvas 2D unsupported fallback
          resolve(e.target?.result as string);
          return;
        }

        // Enable high-quality bilinear interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Attempt export as WebP (modern & lightweight)
        try {
          const dataUrl = canvas.toDataURL(mimeType, quality);
          // If browser doesn't support WebP export, it produces image/png
          if (dataUrl.startsWith('data:image/png') && mimeType === 'image/webp') {
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(dataUrl);
          }
        } catch {
          // Fallback to JPEG
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function compressImages(
  files: File[],
  options?: CompressImageOptions
): Promise<string[]> {
  const promises = files.map((file) => compressImage(file, options));
  return Promise.all(promises);
}
