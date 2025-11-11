import React, { useEffect, useRef, useState } from 'react';
import { Button } from './button';

interface CustomFileInputProps {
  label?: string;
  accept?: string;
  buttonText?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  selectedFileName?: string | null;
  file?: File | null;
  showPreview?: boolean;
  previewSize?: number; // px
  onFileSelected: (file: File | null) => void;
}

export const CustomFileInput: React.FC<CustomFileInputProps> = ({
  label,
  accept,
  buttonText = 'Elegir archivo',
  placeholder = 'Ningún archivo seleccionado',
  disabled,
  className,
  selectedFileName,
  file,
  showPreview = false,
  previewSize = 48,
  onFileSelected,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleOpenDialog = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelected(file);
    if (file && file.type?.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } else {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0] || null;
    onFileSelected(file);
    if (file && file.type?.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } else {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  };

  // Sync preview when parent controls file
  useEffect(() => {
    if (!showPreview) return;
    if (file && file.type?.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [file, showPreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      )}
      <div
        className={`flex items-center gap-3 rounded-xl border ${dragActive ? 'border-blue-400 bg-slate-800/60' : 'border-slate-700 bg-slate-800'} p-3 transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
        <Button
          type="button"
          onClick={handleOpenDialog}
          disabled={disabled}
          className="bg-slate-100 text-slate-800 rounded-lg px-3 py-2 hover:bg-slate-200"
        >
          {buttonText}
        </Button>
        <div className="flex-1 text-sm text-slate-300 truncate">
          {selectedFileName || placeholder}
        </div>
        {!showPreview && (
          <div className="text-xs text-slate-500 hidden sm:block">o arrastra aquí</div>
        )}
        {showPreview && previewUrl && (
          <img
            src={previewUrl}
            alt="Vista previa"
            style={{ width: previewSize, height: previewSize }}
            className="rounded-full object-fill"
          />
        )}
      </div>
    </div>
  );
};

export default CustomFileInput;