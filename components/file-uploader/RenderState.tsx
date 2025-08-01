import { cn } from '@/lib/utils';
import { CloudUpload, ImageIcon, Loader2, XIcon } from 'lucide-react';
import { Button } from '../ui/button';
import Image from 'next/image';

export function RenderEmptyState({ isDragActive }: { isDragActive: boolean }) {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-muted mb-4">
        <CloudUpload
          className={cn(
            'size-6 text-muted-foreground',
            isDragActive && 'text-primary'
          )}
        />
      </div>
      <p className="text-base font-semibold text-foreground">
        Drop Your Files Here Or{' '}
        <span className="text-primary font-bold cursor-pointer">
          Click To Upload
        </span>
      </p>
      <Button type="button" className="mt-4">
        Select File
      </Button>
    </div>
  );
}

export function RenderErrorState() {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-destructive/30 mb-4">
        <ImageIcon className={cn('size-6 text-destructive')} />
      </div>
      <p className="text-base font-semibold">Upload Failed</p>
      <p className="text-xs mt-1 text-muted-foreground">Something went wrong</p>
      <Button className="mt-4" type="button">
        Retry File Selection
      </Button>
    </div>
  );
}

export function RenderUploadedState({
  previewUrl,
  isDeleting,
  fileType,
  handleRemoveFile,
}: {
  previewUrl: string;
  isDeleting: boolean;
  fileType: 'video' | 'image';
  handleRemoveFile: () => void;
}) {
  return (
    <div className="relative group w-full h-full flex items-center justify-center">
      {fileType === 'video' ? (
        <video src={previewUrl} controls className="rounded-md w-full h-full" />
      ) : (
        <Image
          src={previewUrl}
          alt="Uploaded File"
          fill
          className="object-contain p-2"
        />
      )}
      <Button
        onClick={handleRemoveFile}
        variant="destructive"
        size="icon"
        className={cn('absolute top-4 right-4')}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <XIcon className="size-4" />
        )}
      </Button>
    </div>
  );
}

export function RenderUploadingState({
  progress,
  file,
}: {
  progress: number;
  file: File;
}) {
  return (
    <div className="text-center flex justify-center items-center flex-col">
      <p className="p-3 rounded-full text-center bg-accent-foreground font-semibold">
        {progress}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">Uploading...</p>
      <p className="mt-1 text-xs text-muted-foreground truncate max-w-xs">
        {file.name}
      </p>
    </div>
  );
}
