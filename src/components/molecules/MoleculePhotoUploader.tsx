import { Camera, Image as ImageIcon, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { db, savePhoto, deletePhoto, AssessmentPhoto } from "../../lib/db";
import { cn } from "../../lib/utils";

interface MoleculePhotoUploaderProps {
  studentId: string;
  aspectId: string;
  indicatorId: string;
}

export function MoleculePhotoUploader({ studentId, aspectId, indicatorId }: MoleculePhotoUploaderProps) {
  const [photos, setPhotos] = useState<AssessmentPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function loadPhotos() {
      const allPhotos = await db.photos
        .where('[studentId+aspectId+indicatorId]')
        .equals([studentId, aspectId, indicatorId])
        .toArray();
      
      // Regenerate preview URLs as Object URLs from stored blobs since they are transient
      const photosWithUrls = allPhotos.map(photo => ({
        ...photo,
        previewUrl: URL.createObjectURL(photo.blob)
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
        // Limit to 3 photos as requested "max 3 foto secara horizontal"
        if (photos.length >= 3) {
            alert("Maksimal 3 foto per indikator");
            return;
        }

        // Convert to Blob and store
        await savePhoto(studentId, aspectId, indicatorId, file);
        
        // Refresh
        const updated = await db.photos
            .where('[studentId+aspectId+indicatorId]')
            .equals([studentId, aspectId, indicatorId])
            .toArray();
            
        const updatedWithUrls = updated.map(p => ({
            ...p,
            previewUrl: URL.createObjectURL(p.blob)
        }));
        
        setPhotos(updatedWithUrls);
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
      <div className="flex items-center gap-2 mb-1">
         <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dokumentasi</span>
         {/* Badge for photo count */}
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
