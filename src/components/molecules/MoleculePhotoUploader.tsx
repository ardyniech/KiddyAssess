import { Camera, Image as ImageIcon, Trash2, X, Edit2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { db, savePhoto, deletePhoto, AssessmentPhoto } from "../../lib/db";
import { cn } from "../../lib/utils";

import imageCompression from 'browser-image-compression';

interface MoleculePhotoUploaderProps {
  studentId: string;
  aspectId: string;
  indicatorId: string;
}

export function MoleculePhotoUploader({ studentId, aspectId, indicatorId }: MoleculePhotoUploaderProps) {
  const [photos, setPhotos] = useState<AssessmentPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadPhotos() {
      const allPhotos = await db.photos
        .where('[studentId+aspectId+indicatorId]')
        .equals([studentId, aspectId, indicatorId])
        .toArray();
      
      const photosWithUrls = await Promise.all(allPhotos.map(async (photo) => {
        let previewStr = photo.previewUrl;
        // Fix for iOS blob issues and old blob URLs
        if (!previewStr || !previewStr.startsWith('data:')) {
            try {
                previewStr = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(photo.blob);
                });
            } catch (e) {
                console.error("Failed to read blob", e);
            }
        }
        return {
            ...photo,
            previewUrl: previewStr || ""
        };
      }));
      
      setPhotos(photosWithUrls);
    }
    loadPhotos();
  }, [studentId, aspectId, indicatorId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
        if (!editingPhotoId && photos.length >= 3) {
            alert("Maksimal 3 foto per indikator");
            return;
        }

        const options = {
          maxSizeMB: 1, // Max 1MB size for good quality print but small size
          maxWidthOrHeight: 1280,
          useWebWorker: true,
          fileType: 'image/jpeg'
        };
        const compressedFile = await imageCompression(file, options);

        // Updated savePhoto call to support replacements
        await savePhoto(studentId, aspectId, indicatorId, compressedFile);
        
        // Refresh
        const updated = await db.photos
            .where('[studentId+aspectId+indicatorId]')
            .equals([studentId, aspectId, indicatorId])
            .toArray();
            
        const updatedWithUrls = await Promise.all(updated.map(async (p) => {
            let pStr = p.previewUrl;
            if (!pStr || !pStr.startsWith('data:')) {
                pStr = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(p.blob);
                });
            }
            return {
                ...p,
                previewUrl: pStr
            };
        }));
        
        setPhotos(updatedWithUrls);
        setEditingPhotoId(null);
    } catch (err) {
        console.error("Upload failed", err);
    } finally {
        setIsUploading(false);
    }
  };

  const handleRemove = async (id: number) => {
    await deletePhoto(id);
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="mt-3 space-y-2">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange} 
        disabled={isUploading}
      />
      <div className="flex items-center gap-2 mb-1">
         <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dokumentasi</span>
         {photos.length > 0 && (
             <span className="text-[10px] font-black text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded-full">{photos.length}/3</span>
         )}
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square group">
            <img 
              src={photo.previewUrl} 
              alt="Evidence" 
              className="w-full h-full object-cover rounded-lg border border-black/5 dark:border-cyan-500/20"
            />
            <button 
              onClick={() => {
                  setEditingPhotoId(photo.id!);
                  fileInputRef.current?.click();
              }}
              className="absolute -top-1.5 -left-1.5 bg-cyan-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
            >
              <Edit2 size={10} />
            </button>
            <button 
              onClick={() => handleRemove(photo.id!)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        
        {photos.length < 3 && (
          <label className={cn(
            "relative aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
            isUploading ? "bg-black/5 border-slate-300 animate-pulse" : "border-black/10 dark:border-cyan-500/20 hover:border-cyan-500 hover:bg-cyan-500/5"
          )}>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange} 
              disabled={isUploading}
            />
            <Camera size={14} className={cn(isUploading ? "text-slate-300" : "text-cyan-500/50")} />
            <span className="text-[8px] font-black uppercase text-slate-400">Upload</span>
          </label>
        )}
      </div>
    </div>
  );
}
