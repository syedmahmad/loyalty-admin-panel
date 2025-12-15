/**
 * Compresses an image file to reduce its size while maintaining quality
 * @param file - The image file to compress
 * @param maxSizeMB - Maximum size in MB (default: 5)
 * @param maxWidthOrHeight - Maximum width or height (default: 1920)
 * @returns Promise<Blob> - Compressed image as a Blob
 */
export const compressImage = async (
    file: File,
    maxSizeMB: number = 5,
    maxWidthOrHeight: number = 1920,
): Promise<Blob> => {
    if (file.size <= maxSizeMB * 1024 * 1024) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            let { width, height } = img;
            if (width > height) {
                if (width > maxWidthOrHeight) {
                    height = (height * maxWidthOrHeight) / width;
                    width = maxWidthOrHeight;
                }
            } else {
                if (height > maxWidthOrHeight) {
                    width = (width * maxWidthOrHeight) / height;
                    height = maxWidthOrHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);

            let quality = 0.9;
            const attemptCompression = () => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Could not compress image'));
                            return;
                        }

                        if (blob.size <= maxSizeMB * 1024 * 1024 || quality <= 0.1) {
                            URL.revokeObjectURL(objectUrl);
                            resolve(blob);
                        } else {
                            quality -= 0.1;
                            attemptCompression();
                        }
                    },
                    file.type,
                    quality,
                );
            };

            attemptCompression();
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Could not load image'));
        };

        img.src = objectUrl;
    });
};
