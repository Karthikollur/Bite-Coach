// components/PhotoUpload.js
// What: Camera/file upload button for food photos with client-side compression.
// Why 'use client': File input, preview, and Canvas API for compression all need the browser.

'use client';

import { useState } from 'react';

/**
 * Compress an image before uploading to reduce bandwidth and speed up AI analysis.
 * Phone photos can be 5-15MB. We compress to ~200KB (40x smaller).
 * Uses the Canvas API — built into every browser, no extra library needed.
 */
async function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 1024; // Max 1024px wide
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 0.8 = 80% JPEG quality — good balance between quality and file size
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    };
    img.onerror = () => resolve(file); // Fallback: use original if compression fails
    img.src = URL.createObjectURL(file);
  });
}

export default function PhotoUpload({ onPhotoReady }) {
  const [preview, setPreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);

    try {
      // Show a preview immediately so the user sees their photo quickly
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Compress in the background while showing the preview
      const compressed = await compressImage(file);
      const compressedFile = new File([compressed], 'meal-photo.jpg', {
        type: 'image/jpeg',
      });

      // Tell the parent component (log-meal page) that the photo is ready
      onPhotoReady(compressedFile);
    } catch (error) {
      console.error('Image compression failed:', error);
      // Fallback: pass the original file uncompressed
      onPhotoReady(file);
    } finally {
      setIsCompressing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Photo preview — shown after selection */}
      {preview && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Your food photo"
            className="w-full rounded-xl shadow-md object-cover max-h-72"
          />
          {isCompressing && (
            <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
              <p className="text-white text-sm font-medium">Preparing photo...</p>
            </div>
          )}
        </div>
      )}

      {/* File input — styled as a big button */}
      <label className="block w-full bg-green-500 text-white text-center py-4 rounded-xl font-semibold cursor-pointer hover:bg-green-600 transition-colors active:scale-95">
        {preview ? '📸 Change Photo' : '📸 Snap or Upload Your Meal'}
        <input
          type="file"
          accept="image/*"
          // 'capture="environment"' activates the rear camera on mobile phones
          // It's ignored on desktop where it just opens the file picker
          capture="environment"
          onChange={handleFileChange}
          className="hidden" // The label IS the button — the actual input is hidden
        />
      </label>

      {preview && (
        <p className="text-center text-xs text-gray-400">
          Photo compressed for fast AI analysis
        </p>
      )}
    </div>
  );
}
