'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageUpload({ images, onImagesChange, maxImages = 5, maxSizeMB = 10 }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const addFiles = useCallback((files: FileList | File[]) => {
    setError('');
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setError('Doar imagini sunt acceptate');
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Fisierul ${file.name} depaseste ${maxSizeMB}MB`);
        continue;
      }
      if (images.length + newFiles.length >= maxImages) {
        setError(`Maximum ${maxImages} imagini`);
        break;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (newFiles.length > 0) {
      onImagesChange([...images, ...newFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  }, [images, onImagesChange, maxImages, maxSizeMB]);

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    onImagesChange(images.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
        } ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <span className="text-3xl block mb-2">{dragOver ? '\u{1F4E5}' : '\u{1F4F7}'}</span>
        <p className="text-sm font-medium text-gray-700">
          {dragOver ? 'Elibereaza pentru a incarca' : 'Trage imaginile aici sau apasa pentru a selecta'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {images.length}/{maxImages} imagini &middot; Max {maxSizeMB}MB fiecare &middot; JPG, PNG, WebP
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>{'\u26A0'}</span> {error}
        </p>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                {'\u2715'}
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI hint */}
      {images.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
          <span className="text-sm">{'\u{1F916}'}</span>
          <p className="text-xs text-blue-700">
            AI-ul va analiza automat imaginile pentru a sugera categorie si a gasi match-uri vizuale.
          </p>
        </div>
      )}
    </div>
  );
}
