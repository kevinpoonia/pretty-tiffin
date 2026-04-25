'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Star } from 'lucide-react';
import Image from 'next/image';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

async function uploadToCloudinary(file: File): Promise<string> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) throw new Error('Cloudinary not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to env.');
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const data = await res.json();
  return data.secure_url as string;
}

export default function ImageUpload({ images, onChange, maxImages = 8 }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length >= maxImages) { setError(`Maximum ${maxImages} images allowed`); return; }
    setError('');
    setUploading(true);
    const remaining = maxImages - images.length;
    const toUpload = Array.from(files).slice(0, remaining).filter(f => f.type.startsWith('image/'));
    try {
      const urls = await Promise.all(toUpload.map(uploadToCloudinary));
      onChange([...images, ...urls]);
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));
  const makeMain = (i: number) => {
    const copy = [...images];
    [copy[0], copy[i]] = [copy[i], copy[0]];
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all select-none ${
          dragging ? 'border-brand-500 bg-brand-50 scale-[1.01]' : 'border-brand-200 hover:border-brand-400 hover:bg-brand-50/50'
        }`}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => handleFiles(e.target.files)} />
        {uploading
          ? <Loader2 size={32} className="mx-auto mb-2 text-brand-500 animate-spin" />
          : <Upload size={32} className="mx-auto mb-2 text-brand-400" />}
        <p className="text-sm font-bold text-brand-700">
          {uploading ? 'Uploading to Cloudinary…' : 'Drag & drop images or click to browse'}
        </p>
        <p className="text-xs text-brand-400 mt-1">PNG, JPG, WebP · Up to {maxImages} images</p>
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={url + i} className="relative aspect-square rounded-xl overflow-hidden group bg-brand-50 border border-brand-100">
              <Image src={url} alt="" fill sizes="140px" className="object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {i !== 0 && (
                  <button type="button" onClick={() => makeMain(i)}
                    className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow" title="Set as main">
                    <Star size={12} className="text-white" />
                  </button>
                )}
                <button type="button" onClick={() => remove(i)}
                  className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow">
                  <X size={12} className="text-brand-900" />
                </button>
              </div>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black bg-brand-900 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Main</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
