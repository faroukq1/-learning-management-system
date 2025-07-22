'use client';
import { useCallback, useEffect, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import {
  RenderEmptyState,
  RenderErrorState,
  RenderUploadedState,
  RenderUploadingState,
} from './RenderState';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
interface UploaderState {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
  fileType: 'image' | 'video';
}

interface iAppProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function Uploader({ value, onChange }: iAppProps) {
  const [fileState, setFileState] = useState<UploaderState>({
    error: false,
    file: null,
    id: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    fileType: 'image',
    key: value,
  });

  const uploadFile = async (file: File) => {
    setFileState((prev) => ({
      ...prev,
      uploading: true,
      progress: 0,
    }));

    try {
      // 1. get presigned url
      const presignedResponse = await fetch('/api/s3/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          isImage: true,
        }),
      });

      if (!presignedResponse.ok) {
        toast.error('Failed to get presigned url');
        setFileState((prev) => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: true,
        }));

        return;
      }

      const { presignedUrl, key } = await presignedResponse.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentageCompleted = (event.loaded / event.total) * 100;
            setFileState((prev) => ({
              ...prev,
              progress: Math.round(percentageCompleted),
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status == 204) {
            setFileState((prev) => ({
              ...prev,
              progress: 100,
              uploading: false,
              key: key,
            }));

            onChange?.(key);
            toast.success('File Uploaded Succesfully');
            resolve();
          } else {
            reject(new Error('Upload Failed'));
          }
        };
        xhr.onerror = () => {
          reject(new Error('Upload Failed'));
        };

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    } catch (error) {
      toast.error('Something Went Wrong.');
      setFileState((prev) => ({
        ...prev,
        progress: 0,
        error: true,
        uploading: false,
      }));
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        if (fileState.objectUrl && !fileState.objectUrl.startsWith('http')) {
          URL.revokeObjectURL(fileState.objectUrl);
        }

        setFileState({
          file: file,
          uploading: false,
          progress: 0,
          objectUrl: URL.createObjectURL(file),
          error: false,
          id: uuidv4(),
          isDeleting: false,
          fileType: 'image',
        });

        uploadFile(file);
      }
    },
    [fileState.objectUrl]
  );

  const handleRemoveFile = async () => {
    if (fileState.isDeleting || !fileState.objectUrl) return;

    try {
      setFileState((prev) => ({
        ...prev,
        isDeleting: true,
      }));

      // call  the route handler to delete

      const response = await fetch('/api/s3/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'Application/json' },
        body: JSON.stringify({ key: fileState.key }),
      });

      if (!response.ok) {
        toast.error('Failed to remove file from storage');
        setFileState((prev) => ({
          ...prev,
          isDeleting: true,
          error: true,
        }));

        return;
      }

      if (fileState.objectUrl && !fileState.objectUrl.startsWith('http'))
        URL.revokeObjectURL(fileState.objectUrl);

      onChange?.('');
      setFileState({
        file: null,
        uploading: false,
        progress: 0,
        objectUrl: undefined,
        error: false,
        fileType: 'image',
        id: null,
        isDeleting: false,
      });
      toast.success('File Removed Successfully');
    } catch (error) {
      // handle error;
      toast.error('Eror removing file. Please try again');
      setFileState((prev) => ({
        ...prev,
        isDeleting: false,
        error: true,
      }));
    }
  };

  const rejectedFile = (fileRejection: FileRejection[]) => {
    if (fileRejection.length) {
      const toManyFileErorr = fileRejection.find(
        (rejection) => rejection.errors[0].code === 'too-many-files'
      );

      const fileSizeTooBig = fileRejection.find(
        (rejection) => rejection.errors[0].code === 'file-too-large'
      );
      if (toManyFileErorr) {
        toast.error('Too many files selected, max is 1.');
        return;
      }

      if (fileSizeTooBig) {
        toast.error('File size exceed the limit.');
        return;
      }
    }
  };

  const renderContent = () => {
    if (fileState.uploading) {
      return (
        <RenderUploadingState
          file={fileState.file as File}
          progress={fileState.progress}
        />
      );
    }

    if (fileState.error) {
      return <RenderErrorState />;
    }

    if (fileState.objectUrl) {
      return (
        <RenderUploadedState
          previewUrl={fileState.objectUrl}
          isDeleting={fileState.isDeleting}
          handleRemoveFile={handleRemoveFile}
        />
      );
    }

    return <RenderEmptyState isDragActive={isDragActive} />;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'images/*': [],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 1024 * 1024 * 5,
    onDropRejected: rejectedFile,
    disabled: fileState.uploading || !!fileState.objectUrl,
  });

  useEffect(() => {
    return () => {
      if (fileState.objectUrl && !fileState.objectUrl.startsWith('http'))
        URL.revokeObjectURL(fileState.objectUrl);
    };
  }, [fileState.objectUrl]);
  return (
    <Card
      className={cn(
        'relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64',
        isDragActive
          ? 'border-primary bg-primary/10 border-solid'
          : 'border-border hover:border-primary'
      )}
      {...getRootProps()}
    >
      <CardContent className="flex items-center justify-center h-full w-full p-4">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  );
}
